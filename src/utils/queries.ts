import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { QueryClient } from '@tanstack/react-query'

let indexerGraphClient: ApolloClient<NormalizedCacheObject> | undefined

export function getIndexerClient(): ApolloClient<NormalizedCacheObject> {
  if (!indexerGraphClient) {
    indexerGraphClient = new ApolloClient({
      uri: 'https://stream-metrics.streamr.network/api',
      cache: new InMemoryCache(),
    })
  }

  return indexerGraphClient
}

let networkGraphClient: ApolloClient<NormalizedCacheObject> | undefined

export function getNetworkClient(): ApolloClient<NormalizedCacheObject> {
  if (!networkGraphClient) {
    networkGraphClient = new ApolloClient({
      uri: 'https://gateway-arbitrum.network.thegraph.com/api/8bcbd55cdd1369cadb0bb813d9817776/subgraphs/id/EGWFdhhiWypDuz22Uy7b3F69E9MEkyfU9iAQMttkH5Rj',
      cache: new InMemoryCache(),
    })
  }

  return networkGraphClient
}

let queryClient: QueryClient | undefined

export function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient()
  }

  return queryClient
}
