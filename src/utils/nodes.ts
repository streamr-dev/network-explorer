import { useIsFetching, useQuery } from '@tanstack/react-query'
import { MinuteMs } from '../consts'
import { getOperatorNodes } from '../getters'
import { useStore } from '../Store'

function getOperatorNodesForStreamQueryKey(streamId: string | undefined, chainId: number) {
  return ['useOperatorNodesForStreamQuery', streamId || '', chainId]
}

export function useOperatorNodesForStreamQuery(streamId: string | undefined) {
  const { chainId } = useStore()

  return useQuery({
    queryKey: getOperatorNodesForStreamQueryKey(streamId, chainId),
    queryFn: () =>
      getOperatorNodes({
        streamId,
        chainId,
      }),
    staleTime: 5 * MinuteMs,
  })
}

export function useIsFetchingOperatorNodesForStream(streamId: string | undefined) {
  const { chainId } = useStore()
  const queryCount = useIsFetching({
    exact: true,
    queryKey: getOperatorNodesForStreamQueryKey(streamId, chainId),
  })

  return queryCount > 0
}

export function isOperatorNodeGeoFeature(
  arg: GeoJSON.Feature | undefined,
): arg is GeoJSON.Feature<GeoJSON.Point, { id: string; title: string; locationId: string }> {
  return !!arg && arg.geometry.type === 'Point' && !!(arg.properties || {}).locationId
}
