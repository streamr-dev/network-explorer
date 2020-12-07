import { entropyToMnemonic, wordlists } from 'bip39'
import { Utils } from 'streamr-client-protocol'

import { getReversedGeocodedLocation } from './mapbox'

import { get } from '../request'
import getConfig from '../config'

export const getTrackers = async (): Promise<string[]> => {
  const trackerRegistry = await Utils.getTrackerRegistryFromContract(getConfig().tracker)

  const result: string[] = (trackerRegistry.getAllTrackers() || [])
    .map(({ http }: { http: string }) => http)
    .filter(Boolean)

  return result || []
}

export const getTrackerForStream = async (options: { id: string, partition }) => {
  const { id, partition } = {
    ...({ partition: 0 }),
    ...options,
  }
  const trackerRegistry = await Utils.getTrackerRegistryFromContract(getConfig().tracker)

  const { http } = trackerRegistry.getTracker(id, partition)

  return http
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

export const generateMnemonic = (id: string) => (
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

  const encodedId = encodeURIComponent(id)
  try {
    result = await get<Topologyresult>({
      url: `${url}/topology/${encodedId}/`, // trailing slash needed
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to load topology from ${url}/topology/${encodedId}/`)
  }

  const [topology] = Object.values(result || {})

  return topology || {}
}
