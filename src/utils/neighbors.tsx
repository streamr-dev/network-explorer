import { useQuery } from '@tanstack/react-query'
import { MinuteMs } from '../consts'
import { getNeighbors } from '../getters'
import { useStore } from '../Store'

function getOperatorNodeNeighborsQueryKey(nodeId: string | undefined, chainId: number) {
  return ['useOperatorNodeNeighborsQuery', nodeId || '', chainId]
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
    queryKey: getOperatorNodeNeighborsQueryKey(nodeId, chainId),
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
