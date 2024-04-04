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

let queryClient: QueryClient | undefined

export function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient()
  }

  return queryClient
}
