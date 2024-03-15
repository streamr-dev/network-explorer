import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { QueryClient } from '@tanstack/react-query'

let graphClient: ApolloClient<NormalizedCacheObject> | undefined

export function getIndexerClient(): ApolloClient<NormalizedCacheObject> {
  if (!graphClient) {
    graphClient = new ApolloClient({
      uri: 'https://stream-metrics.streamr.network/api',
      cache: new InMemoryCache(),
    })
  }

  return graphClient
}

let queryClient: QueryClient | undefined

export function getQueryClient() {
    if (!queryClient) {
        queryClient = new QueryClient()
    }

    return queryClient
}
