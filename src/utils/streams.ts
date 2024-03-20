import { useQuery } from '@tanstack/react-query'
import { MinuteMs } from '../consts'
import {
  GetStreamsDocument,
  GetStreamsQuery,
  GetStreamsQueryVariables,
} from '../generated/gql/indexer'
import { getIndexerClient } from './queries'

function getLimitedStreamsQueryKey(phrase: string, limit: number) {
  return ['useLimitedStreamsQuery', phrase, limit]
}

interface UseLimitedStreamsQueryParams {
  phrase: string
  limit?: number
}

export function useLimitedStreamsQuery(params: UseLimitedStreamsQueryParams) {
  const { phrase, limit = 20 } = params

  return useQuery({
    queryKey: getLimitedStreamsQueryKey(phrase, limit),
    queryFn: async () => {
      if (!phrase) {
        return []
      }

      const {
        data: { streams },
      } = await getIndexerClient().query<GetStreamsQuery, GetStreamsQueryVariables>({
        query: GetStreamsDocument,
        variables: {
          searchTerm: phrase,
          pageSize: limit,
        },
      })

      return streams.items.map(
        ({
          id,
          description,
          peerCount,
          messagesPerSecond,
          publisherCount = null,
          subscriberCount = null,
        }) => ({
          description: description || '',
          id,
          messagesPerSecond,
          peerCount,
          publisherCount,
          subscriberCount,
        }),
      )
    },
    staleTime: 5 * MinuteMs,
  })
}
