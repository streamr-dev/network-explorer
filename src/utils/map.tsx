import { RefObject } from 'react'
import { MapRef } from 'react-map-gl'

export const NodeLayerId = 'node-layer'

export const InteractiveLayerIds = [NodeLayerId]

export const NodeSourceId = 'node-source'

/**
 * The value specifies after how long the operation comes
 * to a stop, in milliseconds.
 */
export const Inertia = 300

export function setNodeFeatureState(
  mapRef: RefObject<MapRef>,
  nodeId: string,
  state: Record<string, boolean>,
) {
  const map = mapRef.current?.getMap()

  if (!map) {
    return
  }

  if (map.isStyleLoaded()) {
    map.setFeatureState(
      {
        source: NodeSourceId,
        id: nodeId,
      },
      state,
    )

    return
  }

  /**
   * Defer the call for a while to wait for styles to load.
   */
  window.setTimeout(() => {
    setNodeFeatureState(mapRef, nodeId, state)
  })
}

export function getCursor({ isHovering = false, isDragging = false }) {
  return isDragging ? 'all-scroll' : isHovering ? 'pointer' : 'default'
}
