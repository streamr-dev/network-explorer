import { useInfiniteQuery, useIsFetching, useQuery } from '@tanstack/react-query'
import {
  GetNeighborsDocument,
  GetNeighborsQuery,
  GetNeighborsQueryVariables,
  GetNodesDocument,
  GetNodesQuery,
  GetNodesQueryVariables,
  GetStreamsDocument,
  GetStreamsQuery,
  GetStreamsQueryVariables,
  GetSummaryQuery,
  GetSummaryQueryVariables,
  OrderDirection,
  StreamOrderBy,
} from '../generated/gql/indexer'
import { getIndexerClient } from './queries'

function getSummaryQueryKey() {
  return ['useSummaryQuery'] as const
}

export function useSummaryQuery() {
  return useQuery({
    queryKey: getSummaryQueryKey(),
    queryFn: async () => {
      const {
        data: { summary },
      } = await getIndexerClient().query<GetSummaryQuery, GetSummaryQueryVariables>({
        fetchPolicy: 'network-only',
        query: GetNeighborsDocument,
      })

      const { nodeCount, messagesPerSecond, streamCount } = summary

      return { nodeCount, messagesPerSecond, streamCount }
    },
  })
}

export function useIsFetchingSummary() {
  return (
    useIsFetching({
      exact: false,
      queryKey: [getSummaryQueryKey()[0]],
    }) > 0
  )
}

interface UseNodesQueryParams {
  ids?: string[]
}

function getNodesQueryKey({ ids = [] }: UseNodesQueryParams) {
  return ['useNodesQuery', ...ids] as const
}

export function useNodesQuery(params: UseNodesQueryParams) {
  const pageSize = 500

  const { ids } = params

  return useQuery({
    queryKey: getNodesQueryKey(params),
    queryFn: async () => {
      const items: GetNodesQuery['nodes']['items'] = []

      let cursor = '0'

      for (;;) {
        const {
          data: { nodes },
        } = await getIndexerClient().query<GetNodesQuery, GetNodesQueryVariables>({
          fetchPolicy: 'network-only',
          query: GetNodesDocument,
          variables: {
            cursor,
            ids,
            pageSize,
          },
        })

        items.push(...nodes.items)

        if (!nodes.cursor || nodes.cursor === cursor) {
          break
        }

        cursor = nodes.cursor

        console.log('CURSOR', cursor)

        await new Promise<void>((resolve) => {
          setTimeout(resolve, 2000)
        })
      }
    },
  })
}

export function useIsFetchingNodes() {
  return (
    useIsFetching({
      exact: false,
      queryKey: [getNodesQueryKey({})[0]],
    }) > 0
  )
}

interface UseStreamsQueryParams {
  ids?: string[]
  orderBy?: StreamOrderBy
  orderDirection?: OrderDirection
  owner?: string
  pageSize?: number
  searchTerm?: string
}

function getStreamsInfiniteQueryKey(params: UseStreamsQueryParams) {
  const {
    ids = [],
    orderBy = StreamOrderBy.MessagesPerSecond,
    orderDirection = OrderDirection.Asc,
    owner,
    pageSize,
    searchTerm,
  } = params

  return [
    'useStreamsInfiniteQuery',
    pageSize,
    orderBy,
    orderDirection,
    owner,
    searchTerm,
    ...ids,
  ] as const
}

export function useStreamsInfiniteQuery(params: UseStreamsQueryParams) {
  const {
    ids,
    orderBy = StreamOrderBy.MessagesPerSecond,
    orderDirection = OrderDirection.Asc,
    owner,
    pageSize = 10,
    searchTerm,
  } = params

  return useInfiniteQuery({
    queryKey: getStreamsInfiniteQueryKey({
      ids,
      orderBy,
      orderDirection,
      owner,
      pageSize,
      searchTerm,
    }),
    queryFn: async ({ pageParam }) => {
      const result = await getIndexerClient().query<GetStreamsQuery, GetStreamsQueryVariables>({
        fetchPolicy: 'network-only',
        query: GetStreamsDocument,
        variables: {
          cursor: pageParam,
          pageSize,
          orderBy,
          orderDirection,
          owner,
          searchTerm,
          ids,
        },
      })

      const { items, cursor } = result.data.streams

      return {
        cursor: cursor || undefined,
        items: items,
      }
    },
    initialPageParam: '0',
    getNextPageParam: (lastPage) => {
      return lastPage.cursor
    },
  })
}

export function useIsFetchingStreams() {
  return (
    useIsFetching({
      exact: false,
      queryKey: [getStreamsInfiniteQueryKey({})[0]],
    }) > 0
  )
}

interface UseNeighborsQueryParams {
  node?: string
  streamPart?: string
}

function getNeighborsQueryKey({ node, streamPart }: UseNeighborsQueryParams) {
  return ['useNeighborsQuery', streamPart, node] as const
}

export function useNeighborsQuery(params: UseNeighborsQueryParams) {
  const pageSize = 500

  const { node, streamPart } = params

  return useQuery({
    queryKey: getNeighborsQueryKey(params),
    queryFn: async () => {
      const items: GetNeighborsQuery['neighbors']['items'] = []

      let cursor = '0'

      for (;;) {
        const {
          data: { neighbors },
        } = await getIndexerClient().query<GetNeighborsQuery, GetNeighborsQueryVariables>({
          fetchPolicy: 'network-only',
          query: GetNeighborsDocument,
          variables: {
            cursor,
            node,
            pageSize,
            streamPart,
          },
        })

        items.push(...neighbors.items)

        if (!neighbors.cursor || neighbors.cursor === cursor) {
          break
        }

        cursor = neighbors.cursor

        console.log('CURSOR', cursor)

        await new Promise<void>((resolve) => {
          setTimeout(resolve, 2000)
        })
      }
    },
  })
}

export function useIsFetchingNeighbors() {
  return (
    useIsFetching({
      exact: false,
      queryKey: [getNeighborsQueryKey({})[0]],
    }) > 0
  )
}
