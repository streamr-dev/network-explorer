import { WebMercatorViewport } from 'react-map-gl'
import { OperatorNode } from '../../types'

export const getCenteredViewport = (nodes: OperatorNode[], vpWidth: number, vpHeight: number) => {
  if (nodes == null || nodes.length < 1) {
    return {}
  }

  const pointsLong = nodes.map(({ location }) => location.longitude)

  const pointsLat = nodes.map(({ location }) => location.latitude)

  const cornersLongLat: [[number, number], [number, number]] = [
    [Math.min(...pointsLong), Math.min(...pointsLat)],
    [Math.max(...pointsLong), Math.max(...pointsLat)],
  ]

  const preferredPadding = 200
  const padding =
    vpWidth > 2 * preferredPadding && vpWidth > 2 * preferredPadding ? preferredPadding : 0

  const { longitude, latitude, zoom } = new WebMercatorViewport({
    width: vpWidth,
    height: vpHeight,
  }).fitBounds(cornersLongLat, { padding })

  return {
    longitude,
    latitude,
    zoom,
  }
}
