import { Map } from 'mapbox-gl'

export const NodeLayerId = 'node-layer'

export const InteractiveLayerIds = [NodeLayerId]

export const NodeSourceId = 'node-source'

export function setNodeFeatureState(
  map: Map | undefined,
  locationId: string,
  state: Record<string, boolean>,
) {
  if (!map) {
    return
  }

  if (map.isStyleLoaded()) {
    map.setFeatureState(
      {
        source: NodeSourceId,
        id: locationId,
      },
      state,
    )

    return
  }

  /**
   * Defer the call for a while to wait for styles to load.
   */
  window.setTimeout(() => {
    setNodeFeatureState(map, locationId, state)
  })
}

export function getNodeLocationId({ longitude = 0, latitude = 0 }) {
  return `${longitude},${latitude}`
}
