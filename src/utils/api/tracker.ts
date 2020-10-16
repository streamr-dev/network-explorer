import { entropyToMnemonic, wordlists } from 'bip39'
import { Utils } from 'streamr-client-protocol'

import { getReversedGeocodedLocation } from './mapbox'
import { SearchResult } from './streamr'

import { get } from '../request'

const ADDRESS = process.env.REACT_APP_TRACKER_REGISTRY_ADDRESS
const PROVIDER = process.env.REACT_APP_TRACKER_REGISTRY_PROVIDER

export const mapApiUrl = (url: string) => {
  const ip = `${url}`.slice(5).replace(':1111', ':3030')

  return `http://${ip}`
}

export const getTrackers = async (): Promise<string[]> => {
  const trackerRegistry = await Utils.getTrackerRegistryFromContract({
    contractAddress: ADDRESS,
    jsonRpcProvider: PROVIDER,
  })
  const result: string[] = (trackerRegistry.getAllTrackers() || [])
    .map(({ http }: { http: string }) => http)
    .filter(Boolean)

  return [
    ...(result || []).map((url) => mapApiUrl(url)),
  ]
}

export const getTrackerForStream = async ({ id }: { id: string }) => {
  const trackerRegistry = await Utils.getTrackerRegistryFromContract({
    contractAddress: ADDRESS,
    jsonRpcProvider: PROVIDER,
  })

  const { http } = trackerRegistry.getTracker(id)
  return mapApiUrl(http)
}

export type Node = {
  id: string,
  title: string,
  latitude: number,
  longitude: number,
  placeName: string
}

type NodeResult = {
  country: string,
  city: string,
  latitude: number,
  longitude: number,
}
type NodeResultList = Record<string, NodeResult>

const generateMnemonic = (id: string) => (
  entropyToMnemonic(id.slice(2), wordlists.english)
    .split(' ')
    .slice(0, 3)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
)

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

  return Promise.all(Object.keys(result || []).map(async (id: string) => {
    const { latitude, longitude, country } = result[id] || {}
    const { region } = await getReversedGeocodedLocation({ latitude, longitude })

    return {
      id,
      latitude,
      longitude,
      title: generateMnemonic(id),
      placeName: region || country,
    }
  }))
}

export type Topology = Record<string, string[]>

export type Topologyresult = Record<string, Topology>

export const getTopology = async ({ id }: { id: string }): Promise<Topology> => {
  const url = await getTrackerForStream({ id })
  let result: Topologyresult = {}

  try {
    result = await get<Topologyresult>({
      url: `${url}/topology/${id}/`, // trailing slash needed
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to load topology from ${url}/topology/${id}/`)
  }

  const [topology] = Object.values(result || {})

  return topology || {}
}

// TODO: temporary stream search, remove once public /streams endpoint is available
type SearchStreams = {
  search?: string,
}

export const searchStreams = async ({ search = '' }: SearchStreams): Promise<SearchResult[]> => {
  const trackers = await getTrackers()

  // get all topologies from all trackers
  const allTopologies = await Promise.all(trackers.map((url) => get<Topologyresult>({
    url: `${url}/topology/`,
  })))

  // construct a stream list from stream ids
  const streamIds = allTopologies
    .flatMap((topologies: Topologyresult) => Object.keys(topologies))
    .map((id) => id.slice(0, -3))

  return [...(new Set(streamIds))]
    .filter((id) => id.toLowerCase().indexOf(search.toLowerCase()) >= 0)
    .map((id) => ({
      type: 'streams',
      id,
      name: id,
    }))
}
