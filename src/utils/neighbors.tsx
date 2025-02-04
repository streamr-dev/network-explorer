import { useQuery } from '@tanstack/react-query'
import { MinuteMs } from '../consts'
import { getNeighbors } from '../getters'
import { useStore } from '../Store'

function getOperatorNodeNeighborsQueryKey(chainId: number, nodeId: string | undefined) {
  return ['useOperatorNodeNeighborsQuery', chainId, nodeId || '']
}

interface UseOperatorNodeNeighborsQueryOptions {
  streamId?: string | undefined
}

export function useOperatorNodeNeighborsQuery(
  nodeId: string | undefined,
  options: UseOperatorNodeNeighborsQueryOptions = {},
) {
  const { streamId } = options
  const { chainId } = useStore()

  return useQuery({
    queryKey: getOperatorNodeNeighborsQueryKey(chainId, nodeId),
    queryFn: async () => {
      const neighbours = await getNeighbors({
        node: nodeId,
        streamId,
        chainId,
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
