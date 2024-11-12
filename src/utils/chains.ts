import { config } from '@streamr/config'

export const POLYGON_CHAIN_ID = config.polygon.id
export const POLYGON_AMOY_CHAIN_ID = config.polygonAmoy.id

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
