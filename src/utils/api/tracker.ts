import { entropyToMnemonic, wordlists } from 'bip39'
import { Utils } from 'streamr-client-protocol'
import { GraphLink } from '@streamr/quick-dijkstra-wasm'

import { getReversedGeocodedLocation } from './mapbox'

import { get } from '../request'
import getConfig from '../config'

const getTrackerRegistry = async () => {
  const { tracker } = getConfig()

  if (tracker.source === 'http') {
    return {
      getAllTrackers: () => [
        {
          http: tracker.http,
        },
      ],
      getTracker: () => ({
        http: tracker.http,
      }),
    }
  }

  return Utils.getTrackerRegistryFromContract(tracker)
}

export const getTrackers = async (): Promise<string[]> => {
  const trackerRegistry = await getTrackerRegistry()

  const result: string[] = (trackerRegistry.getAllTrackers() || [])
    .map(({ http }: { http: string }) => http)
    .filter(Boolean)

  return result || []
}

export const getTrackerForStream = async (options: { id: string; partition?: number }) => {
  const { id, partition } = {
    ...{ id: undefined, partition: 0 },
    ...options,
  }
  const trackerRegistry = await getTrackerRegistry()

  const { http } = trackerRegistry.getTracker(id, partition)

  return http
}

export type Node = {
  id: string
  title: string
  address: string,
  latitude: number
  longitude: number
  placeName: string
}

type NodeResult = {
  country: string
  city: string
  latitude: number
  longitude: number
}
type NodeResultList = Record<string, NodeResult>

export const generateMnemonic = (id: string) =>
  entropyToMnemonic(id.slice(2), wordlists.english)
    .split(' ')
    .slice(0, 3)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

export const getAddress = (id: string) => {
  const hashPos = id.indexOf('#')

  if (hashPos < 0) {
    return id
  }

  return id.slice(0, hashPos)
}

export const getNodes = async (url: string): Promise<Node[]> => {
  let result: NodeResultList = {}

  try {
    result = await get<NodeResultList>({
      url: `${url}/location/`,
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to load nodes from ${url}/location/`)
  }

  return Promise.all(
    Object.keys(result || []).map(async (id: string) => {
      const { latitude, longitude, country } = result[id] || {}
      const { region } = await getReversedGeocodedLocation({ latitude, longitude })
      const address = getAddress(id)
      let title

      try {
        title = generateMnemonic(address)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e)
      }

      return {
        id,
        latitude,
        longitude,
        address,
        title: title || address,
        placeName: region || country,
      }
    }),
  )
}

export type Latency = Record<string, number | undefined>

export type Topology = Record<string, Latency>

export type TopologyEntry = {
  neighborId: string
  rtt: number | undefined
}

export type TopologyResult = Record<string, TopologyEntry[]>

export type StreamTopologyResult = Record<string, TopologyResult>

export const getTopologyFromResponse = (response: TopologyResult): Topology =>
  Object.keys(response || {}).reduce(
    (topology: Topology, nodeId: string) => ({
      ...topology,
      [nodeId]: (response[nodeId] || []).reduce(
        (latencies, { neighborId, rtt }) => ({
          ...latencies,
          [neighborId]: rtt,
        }),
        {},
      ),
    }),
    {},
  )

const isNumber = (value: number | undefined) => typeof value === 'number' && isFinite(value)

export const getIndexedNodes = (topology: Topology): GraphLink[] => {
  const ret: GraphLink[] = []

  const matrix: Map<string, number> = new Map<string, number>()

  // build a mapping from links with arbitrary node ids to links with integer ids,
  // the integer id is based on the first occurence of the node in the data and
  // convert links to integer format using the mapping created,
  // ignoring NULL rtts
  const nodeIds: { [nodeId: string]: number } = {}

  Object.keys(topology || {}).forEach((nodeId) => {
    if (!isNumber(nodeIds[nodeId])) {
      nodeIds[nodeId] = Object.keys(nodeIds).length
    }

    Object.keys(topology[nodeId] || {}).forEach((neighborId) => {
      if (!isNumber(nodeIds[neighborId])) {
        nodeIds[neighborId] = Object.keys(nodeIds).length
      }

      // only take into account one non-null measurement per connection
      // interpret connections as two-way
      if (isNumber(topology[nodeId][neighborId])) {
        const a = nodeIds[nodeId]
        const b = nodeIds[neighborId]

        matrix.set(
          JSON.stringify(a < b ? [a, b] : [b, a]),
          Math.round((topology[nodeId][neighborId] || 0) / 2),
        )
      }
    })
  })

  for (const [key, value] of matrix.entries()) {
    const [nodeIndex, neighborIndex] = JSON.parse(key)
    ret.push([nodeIndex, neighborIndex, value])
  }

  return ret
}

export const getTopology = async ({ id }: { id: string }): Promise<Topology> => {
  const url = await getTrackerForStream({ id })
  let result: StreamTopologyResult = {}

  const encodedId = encodeURIComponent(id)
  try {
    result = await get<StreamTopologyResult>({
      url: `${url}/topology/${encodedId}/`, // trailing slash needed
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to load topology from ${url}/topology/${encodedId}/`)
  }

  const [topology] = Object.values(result)

  return getTopologyFromResponse(topology)
}

export const getNodeConnections = async (): Promise<Topology> => {
  const trackerUrls = await getTrackers()

  let nodeConnections

  try {
    const topologyPromises = trackerUrls.map((url) =>
      get<TopologyResult>({
        url: `${url}/node-connections/`,
      }),
    )

    const topologies = await Promise.all(topologyPromises)

    nodeConnections = (topologies || []).reduce((combined: Topology, response: TopologyResult) => {
      const topology = getTopologyFromResponse(response)
      const nextCombined = {
        ...combined,
      }

      Object.keys(topology || {}).forEach((nodeId) => {
        if (!nextCombined[nodeId]) {
          nextCombined[nodeId] = {}
        }

        Object.keys(topology[nodeId] || {}).forEach((neighborId) => {
          let rtt

          if (
            nextCombined[nodeId] &&
            isNumber(nextCombined[nodeId][neighborId]) &&
            isNumber(topology[nodeId][neighborId])
          ) {
            rtt = Math.max(nextCombined[nodeId][neighborId] || 0, topology[nodeId][neighborId] || 0)
          } else if (isNumber(topology[nodeId][neighborId])) {
            rtt = topology[nodeId][neighborId]
          }

          nextCombined[nodeId] = {
            ...nextCombined[nodeId],
            [neighborId]: rtt,
          }
        })
      })

      return nextCombined
    }, {})
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to load node connections: ${e.message}`)
  }

  return nodeConnections || {}
}
