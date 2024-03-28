import { useIsFetchingLocationRegions, useLocationRegionsQuery } from '../utils/places'

interface PlaceProps {
  longitude: number
  latitude: number
}

export function Place(props: PlaceProps) {
  const { data: [place = undefined] = [] } = useLocationRegionsQuery(props)

  const isFetching = useIsFetchingLocationRegions(props)

  return isFetching ? 'Locating…' : place?.region || 'N/A'
}
