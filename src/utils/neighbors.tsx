import { useIsFetching, useQuery } from '@tanstack/react-query'
import { MinuteMs } from '../consts'
import { getNeighbors } from '../getters'

function getOperatorNodeNeighborsQueryKey(nodeId: string | undefined) {
  return ['useOperatorNodeNeighborsQuery', nodeId || '']
}

interface UseOperatorNodeNeighborsQueryOptions {
  streamId?: string | undefined
}

export function useOperatorNodeNeighborsQuery(
  nodeId: string | undefined,
  options: UseOperatorNodeNeighborsQueryOptions = {},
) {
  const { streamId } = options

  return useQuery({
    queryKey: getOperatorNodeNeighborsQueryKey(nodeId),
    queryFn: async () => {
      const neighbours = await getNeighbors({
        node: nodeId,
        streamId,
      })

      if (!streamId) {
        return neighbours
      }

      return neighbours.filter(
        ({ streamPartitionId }) => streamPartitionId.replace(/#\d+$/, '') === streamId,
      )
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
