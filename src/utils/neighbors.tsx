import { useIsFetching, useQuery } from '@tanstack/react-query'
import { MinuteMs } from '../consts'
import { getNeighbors } from '../getters'

function getAllNeighborsQueryKey() {
  return ['useAllNeighborsQuery']
}

export function useAllNeighborsQuery() {
  return useQuery({
    queryKey: getAllNeighborsQueryKey(),
    queryFn: () => getNeighbors({}),
    staleTime: 5 * MinuteMs,
  })
}

export function useIsFetchingAllNeighbors() {
  const queryCount = useIsFetching({
    exact: true,
    queryKey: getAllNeighborsQueryKey(),
  })

  return queryCount > 0
}

function getOperatorNodeNeighborsQueryKey(nodeId: string | undefined) {
  return ['useOperatorNodeNeighborsQuery', nodeId || '']
}

export function useOperatorNodeNeighborsQuery(nodeId: string | undefined) {
  return useQuery({
    queryKey: getOperatorNodeNeighborsQueryKey(nodeId),
    queryFn: async () => {
      if (!nodeId) {
        return []
      }

      return getNeighbors({
        node: nodeId,
      })
    },
    staleTime: 5 * MinuteMs,
  })
}

export function useIsFetchingOperatorNodeNeighbors(nodeId: string | undefined) {
  const queryCount = useIsFetching({
    exact: true,
    queryKey: getOperatorNodeNeighborsQueryKey(nodeId),
  })

  return queryCount > 0
}
