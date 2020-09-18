import { Contract, providers, BigNumber } from 'ethers'

import trackerRegistryConfig from './abis/trackerRegistryDev.json'
import { get } from './request'

const ADDRESS = '0xBFCF120a8fD17670536f1B27D9737B775b2FD4CF'
const PROVIDER = 'http://10.200.10.1:8545'

type NodeInfo = {
  url: string,
  nodeAddress: string,
  lastSeen: BigNumber,
}

export const mapApiUrl = (url: string) => {
  const ip = url.slice(5).slice(0, -6)

  return `http://${ip}:11111`
}

const defaultTrackers = [
  'http://corea1.streamr.network:11111',
]

export const getTrackers = async (): Promise<string[]> => {
  const provider = new providers.JsonRpcProvider(PROVIDER)
  // check that provider is connected and has some valid blockNumber
  await provider.getBlockNumber()

  const contract = new Contract(ADDRESS, trackerRegistryConfig.abi, provider)
  // check that contract is connected
  await contract.addressPromise

  if (typeof contract.getNodes !== 'function') {
    throw Error('getNodes is not defined in contract')
  }

  const result: NodeInfo[] = await contract.getNodes()

  return [
    ...defaultTrackers,
    ...(result || []).map(({ url }) => mapApiUrl(url)),
  ]
}

export type Node = {
  id: string,
  latitude: number,
  longitude: number,
}

type NodeResult = {
  country: string,
  city: string,
  latitude: number,
  longitude: number,
}
type NodeResultList = Record<string, NodeResult>

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

  return Object.keys(result || []).map((id: string) => {
    const { latitude, longitude } = result[id] || {}

    return {
      id,
      latitude,
      longitude,
    }
  })
}

export type Topology = Record<string, string[]>

export type Topologyresult = Record<string, Topology>

export const getTopology = async ({ id }: { id: string }): Promise<Topology> => {
  const [url] = defaultTrackers // todo: need to go through all trackers?
  let result: Topologyresult = {}

  try {
    result = await get<Topologyresult>({
      url: `${url}/topology/${id}`,
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to load topology from ${url}/topology/${id}`)
  }

  const [topology] = Object.values(result || [])

  return topology
}
