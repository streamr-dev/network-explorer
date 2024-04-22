import { useIsFetching, useQuery } from '@tanstack/react-query'
import { MinuteMs } from '../consts'
import { getOperatorNodes } from '../getters'

function getOperatorNodesForStreamQueryKey(streamId: string | undefined) {
  return ['useOperatorNodesForStreamQuery', streamId || '']
}

export function useOperatorNodesForStreamQuery(streamId: string | undefined) {
  return useQuery({
    queryKey: getOperatorNodesForStreamQueryKey(streamId),
    queryFn: () =>
      getOperatorNodes({
        streamId,
      }),
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

export function isOperatorNodeGeoFeature(
  arg: GeoJSON.Feature | undefined,
): arg is GeoJSON.Feature<GeoJSON.Point, { id: string; title: string; locationId: string }> {
  return !!arg && arg.geometry.type === 'Point' && !!(arg.properties || {}).locationId
}
