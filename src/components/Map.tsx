import React, { useRef, useState } from 'react'
import { Map as Kartta } from 'react-map-gl'
import { DefaultViewState, MapId, MapboxToken } from '../consts'
import { useNavigateToNodeCallback } from '../hooks'
import { useHud } from '../utils'
import { InteractiveLayerIds, setNodeFeatureState } from '../utils/map'
import { isOperatorNodeGeoFeature } from '../utils/nodes'
import { MapConnectionLayer } from './MapConnectionLayer'
import { MapMarkerLayer } from './MapMarkerLayer'

export function Map() {
  const lastHoveredNodeLocationIdRef = useRef<string | null>(null)

  const navigateToNode = useNavigateToNodeCallback()

  const [cursor, setCursor] = useState<string | undefined>()

  const { showConnections, showConnectionsToggle } = useHud()

  return (
    <Kartta
      id={MapId}
      mapboxAccessToken={MapboxToken}
      mapStyle="mapbox://styles/mattinnes/cklaehqgx01yh17pdfs03tt8t"
      interactiveLayerIds={InteractiveLayerIds}
      cursor={cursor}
      attributionControl={false}
      initialViewState={DefaultViewState}
      onClick={(e) => {
        const feature: GeoJSON.Feature | undefined = (e.features || [])[0]

        navigateToNode(isOperatorNodeGeoFeature(feature) ? feature.properties.id : '')
      }}
      onMouseMove={(e) => {
        const feature: GeoJSON.Feature | undefined = (e.features || [])[0]

        const nodeLocationId = isOperatorNodeGeoFeature(feature)
          ? feature.properties.locationId
          : null

        const { current: prevNodeLocationId } = lastHoveredNodeLocationIdRef

        if (nodeLocationId === prevNodeLocationId) {
          return
        }

        if (prevNodeLocationId) {
          setNodeFeatureState(e.target, prevNodeLocationId, { hover: false })

          lastHoveredNodeLocationIdRef.current = null
        }

        if (nodeLocationId) {
          setNodeFeatureState(e.target, nodeLocationId, { hover: true })

          lastHoveredNodeLocationIdRef.current = nodeLocationId
        }

        setCursor(nodeLocationId ? 'pointer' : undefined)
      }}
    >
      {(showConnections || showConnectionsToggle) && <MapConnectionLayer />}
      <MapMarkerLayer />
    </Kartta>
  )
}
