import { config } from '@streamr/config'

export const POLYGON_CHAIN_ID = config.polygon.id
export const POLYGON_AMOY_CHAIN_ID = config.polygonAmoy.id
export const DEFAULT_CHAIN_ID = POLYGON_CHAIN_ID
const SUPPORTED_CHAIN_IDS: number[] = [POLYGON_CHAIN_ID, POLYGON_AMOY_CHAIN_ID]

const INDEXER_URLS: Record<number, string> = {
  [POLYGON_CHAIN_ID]: 'https://stream-metrics.streamr.network/api',
  [POLYGON_AMOY_CHAIN_ID]: 'https://stream-metrics-polygonAmoy.streamr.network/api',
}

export function getIndexerUrl(chainId: number): string {
  const uri = INDEXER_URLS[chainId]
  if (!uri) {
    throw new Error(`No indexer URL configured for chain ID ${chainId}`)
  }
  return uri
}

const CHAIN_ID_STORAGE_KEY = 'network-explorer-chain-id'

export function getPersistedChainId(): number {
  const stored = localStorage.getItem(CHAIN_ID_STORAGE_KEY)

  if (stored && SUPPORTED_CHAIN_IDS.includes(parseInt(stored, 10))) {
    return parseInt(stored, 10)
  }

  return DEFAULT_CHAIN_ID
}

export function persistChainId(chainId: number): void {
  localStorage.setItem(CHAIN_ID_STORAGE_KEY, chainId.toString())
}
