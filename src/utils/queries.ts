import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { QueryClient } from '@tanstack/react-query'
import { getIndexerUrl } from './chains'

let indexerGraphClients: Record<number, ApolloClient<NormalizedCacheObject>> = {}

export function getIndexerClient(chainId: number): ApolloClient<NormalizedCacheObject> {
  if (!indexerGraphClients[chainId]) {
    const uri = getIndexerUrl(chainId)

    indexerGraphClients[chainId] = new ApolloClient({
      uri,
      cache: new InMemoryCache(),
    })
  }

  return indexerGraphClients[chainId]
}

let queryClient: QueryClient | undefined

export function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient()
  }

  return queryClient
}
