import 'mapbox-gl/dist/mapbox-gl.css'
import React, { RefObject, useRef, useState } from 'react'
import ReactMapGL, { MapRef } from 'react-map-gl'
import styled from 'styled-components'
import { useStore } from '../../Store'
import { useLocationFromParams, useNavigateToNodeCallback } from '../../hooks'
import { ConnectionsMode } from '../../types'
import {
  InteractiveLayerIds,
  getCursor,
  getNodeLocationId,
  setNodeFeatureState,
} from '../../utils/map'
import { isOperatorNodeGeoFeature } from '../../utils/nodes'
import { MapboxToken } from '../../utils/places'
import { ConnectionLayer } from './ConnectionLayer'
import { MarkerLayer } from './MarkerLayer'
import { NavigationControl } from './NavigationControl'

/**
 * The value specifies after how long the operation comes
 * to a stop, in milliseconds.
 */
const Inertia = 300

interface LocationFromParams {
  longitude: number
  latitude: number
  zoom: number
}

function getLocationKey({ longitude, latitude, zoom }: LocationFromParams) {
  return JSON.stringify([longitude, latitude, zoom])
}

interface MapProps {
  innerRef: RefObject<MapRef>
}

export function Map({ innerRef: mapRef }: MapProps) {
  const streamId: string | undefined = undefined

  const [connectionMode, setConnectionMode] = useState<ConnectionsMode>(ConnectionsMode.Auto)

  const showConnections = !streamId
    ? connectionMode === ConnectionsMode.Always
    : connectionMode === ConnectionsMode.Auto

  const navRef = useRef<HTMLDivElement>(null)

  const { viewport, setViewport, setViewportDebounced, resetViewport } = useStore()

  const lastHoveredNodeLocationIdRef = useRef<string | null>(null)

  const navigateToNode = useNavigateToNodeCallback()

  useSelectedNodeLocationEffect(([longitude, latitude]) => {
    const map = mapRef.current?.getMap()

    if (!map || map.getBounds().contains([longitude, latitude])) {
      return
    }

    setViewport((current) => ({
      ...current,
      longitude,
      latitude,
    }))
  })

  useSelectedPlaceLocationEffect((location) => {
    setViewport((current) => ({
      ...current,
      ...location,
    }))
  })

  return (
    <MapContainer>
      <ReactMapGL
        {...viewport}
        width="100%"
        height="100%"
        mapboxApiAccessToken={MapboxToken}
        mapStyle="mapbox://styles/mattinnes/cklaehqgx01yh17pdfs03tt8t"
        onViewportChange={setViewport}
        getCursor={getCursor}
        ref={mapRef}
        interactiveLayerIds={InteractiveLayerIds}
        onClick={(e) => {
          if (!navRef.current || navRef.current.contains(e.target)) {
            return
          }

          const feature: GeoJSON.Feature | undefined = (e.features || [])[0]

          navigateToNode(isOperatorNodeGeoFeature(feature) ? feature.properties.id : '')
        }}
        onHover={(e) => {
          const feature: GeoJSON.Feature | undefined = (e.features || [])[0]

          const nodeLocationId = isOperatorNodeGeoFeature(feature)
            ? feature.properties.locationId
            : null

          const { current: prevNodeLocationId } = lastHoveredNodeLocationIdRef

          if (nodeLocationId === prevNodeLocationId) {
            return
          }

          if (prevNodeLocationId) {
            setNodeFeatureState(mapRef, prevNodeLocationId, { hover: false })

            lastHoveredNodeLocationIdRef.current = null
          }

          if (nodeLocationId) {
            setNodeFeatureState(mapRef, nodeLocationId, { hover: true })

            lastHoveredNodeLocationIdRef.current = nodeLocationId
          }
        }}
        dragPan={{
          inertia: Inertia,
        }}
        dragRotate={{
          inertia: Inertia,
        }}
        touchZoom={{
          inertia: Inertia,
        }}
        touchRotate={{
          inertia: Inertia,
        }}
      >
        <ConnectionLayer visible={showConnections} />
        <MarkerLayer />
        <NavigationControl
          onZoomIn={() => {
            setViewportDebounced(({ zoom = 0, ...rest }) => ({
              ...rest,
              zoom: zoom + 1,
            }))
          }}
          onZoomOut={() => {
            setViewportDebounced(({ zoom = 0, ...rest }) => ({
              ...rest,
              zoom: zoom - 1,
            }))
          }}
          onResetMap={resetViewport}
          onToggleConnections={() => {
            /*
             * @todo Rename `Always` to just `On` (= On/Off).
             */
            setConnectionMode((current) =>
              current === ConnectionsMode.Always ? ConnectionsMode.Off : ConnectionsMode.Always,
            )
          }}
          innerRef={navRef}
        />
      </ReactMapGL>
    </MapContainer>
  )
}

const MapContainer = styled.div`
  position: relative;
  height: 100%;
`

function useSelectedNodeLocationEffect(onLocationUpdate: (location: [number, number]) => void) {
  const selectedNodeLocationIdRef = useRef<string | null>(null)

  const { current: prevSelectedNodeLocationId } = selectedNodeLocationIdRef

  const { mapRef, selectedNode, nodeIdParamkey } = useStore()

  const nodeIdParamkeyRef = useRef(nodeIdParamkey)

  if (selectedNode && nodeIdParamkeyRef.current !== nodeIdParamkey) {
    const { longitude, latitude } = selectedNode.location

    onLocationUpdate([longitude, latitude])
  }

  nodeIdParamkeyRef.current = nodeIdParamkey

  const selectedNodeLocationId = selectedNode ? getNodeLocationId(selectedNode.location) : undefined

  if (prevSelectedNodeLocationId !== selectedNodeLocationId) {
    if (prevSelectedNodeLocationId) {
      setNodeFeatureState(mapRef, prevSelectedNodeLocationId, { active: false })
    }

    if (selectedNodeLocationId) {
      setNodeFeatureState(mapRef, selectedNodeLocationId, { active: true })
    }

    selectedNodeLocationIdRef.current = selectedNodeLocationId || null
  }
}

function useSelectedPlaceLocationEffect(onLocationUpdate: (location: LocationFromParams) => void) {
  const location = useLocationFromParams()

  const { locationParamKey } = useStore()

  const locationParamKeyRef = useRef(locationParamKey)

  const locationKeyRef = useRef<string | null>(null)

  if (location) {
    const locationKey = getLocationKey(location)

    if (
      locationKeyRef.current !== locationKey ||
      locationParamKeyRef.current !== locationParamKey
    ) {
      onLocationUpdate(location)

      locationKeyRef.current = locationKey
    }
  } else {
    locationKeyRef.current = null
  }

  locationParamKeyRef.current = locationParamKey
}
