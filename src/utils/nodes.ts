import { useIsFetching, useQuery } from '@tanstack/react-query'
import { MinuteMs } from '../consts'
import { getOperatorNodes } from '../getters'

function getOperatorNodesForStreamQueryKey(chainId: number, streamId: string | undefined) {
  return ['useOperatorNodesForStreamQuery', chainId, streamId || '']
}

export function useOperatorNodesForStreamQuery(chainId: number, streamId: string | undefined) {
  return useQuery({
    queryKey: getOperatorNodesForStreamQueryKey(chainId, streamId),
    queryFn: () =>
      getOperatorNodes({
        streamId,
        chainId,
      }),
    staleTime: 5 * MinuteMs,
  })
}

export function useIsFetchingOperatorNodesForStream(chainId: number, streamId: string | undefined) {
  const queryCount = useIsFetching({
    exact: true,
    queryKey: getOperatorNodesForStreamQueryKey(chainId, streamId),
  })

  return queryCount > 0
}

export function isOperatorNodeGeoFeature(
  arg: GeoJSON.Feature | undefined,
): arg is GeoJSON.Feature<GeoJSON.Point, { id: string; title: string; locationId: string }> {
  return !!arg && arg.geometry.type === 'Point' && !!(arg.properties || {}).locationId
}
