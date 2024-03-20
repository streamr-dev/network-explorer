import { useIsFetching, useQuery } from '@tanstack/react-query'
import { MinuteMs } from '../consts'
import { getOperatorNodes } from '../getters'

function getAllOperatorNodesQueryKey() {
  return ['useAllOperatorNodesQuery']
}

export function useAllOperatorNodesQuery() {
  return useQuery({
    queryKey: getAllOperatorNodesQueryKey(),
    queryFn: () => getOperatorNodes({}),
    staleTime: 5 * MinuteMs,
  })
}

export function useIsFetchingAllNodes() {
  const queryCount = useIsFetching({
    exact: true,
    queryKey: getAllOperatorNodesQueryKey(),
  })

  return queryCount > 0
}

function getOperatorNodesForStreamQueryKey(streamId: string | undefined) {
  return ['useOperatorNodesForStreamQuery', streamId || '']
}

export function useOperatorNodesForStreamQuery(streamId: string | undefined) {
  return useQuery({
    queryKey: getOperatorNodesForStreamQueryKey(streamId),
    queryFn: async () => {},
    staleTime: 5 * MinuteMs,
  })
}

export function useIsFetchingOperatorNodesForStream(streamId: string | undefined) {
  const queryCount = useIsFetching({
    exact: true,
    queryKey: getOperatorNodesForStreamQueryKey(streamId),
  })

  return queryCount > 0
}
