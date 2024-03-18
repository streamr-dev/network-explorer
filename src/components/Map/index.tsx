import 'mapbox-gl/dist/mapbox-gl.css'
import React, { RefObject, useRef, useState } from 'react'
import ReactMapGL, {
  LinearInterpolator,
  MapRef,
  TRANSITION_EVENTS,
  ViewportProps,
} from 'react-map-gl'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useGlobalKeyDownEffect, useLocationFromParams } from '../../hooks'
import { useStore } from '../../hooks/useStore'
import { ConnectionsMode } from '../../types'
import { MapboxToken, isOperatorNodeGeoFeature, useNodesQuery } from '../../utils'
import { ConnectionLayer } from './ConnectionLayer'
import { MarkerLayer } from './MarkerLayer'
import { NavigationControl } from './NavigationControl'
import { useActiveNode } from '../../contexts/ActiveNode'
import { Inertia, InteractiveLayerIds, NodeLayerId, NodeSourceId, getCursor, setNodeFeatureState } from '../../utils/map'

const defaultViewport: ViewportProps = {
  altitude: 0,
  bearing: 0,
  height: 0,
  latitude: 53.86859,
  longitude: -0.36616,
  maxPitch: 60,
  maxZoom: 15,
  minPitch: 0,
  minZoom: 2,
  pitch: 0,
  transitionDuration: 300,
  transitionEasing: (t: number) => t,
  transitionInterpolator: new LinearInterpolator(),
  transitionInterruption: TRANSITION_EVENTS.BREAK,
  width: 0,
  zoom: 3,
}

interface LocationFromParams {
  longitude: number
  latitude: number
  zoom: number
}

function getLocationKey({ longitude, latitude, zoom }: LocationFromParams) {
  return JSON.stringify([longitude, latitude, zoom])
}

export function Map() {
  const { streamId } = useStore()

  const [connectionMode, setConnectionMode] = useState<ConnectionsMode>(ConnectionsMode.Auto)

  const showConnections = !streamId
    ? connectionMode === ConnectionsMode.Always
    : connectionMode === ConnectionsMode.Auto

  const [viewport, setViewport] = useState(defaultViewport)

  const mapRef = useRef<MapRef>(null)

  const navRef = useRef<HTMLDivElement>(null)

  const hoveredNodeIdRef = useRef<string | null>(null)

  const activeNode = useActiveNode()

  const activeNodeIdRef = useRef<string | null>(null)

  const { current: prevActiveNodeId } = activeNodeIdRef

  const nodesQuery = useNodesQuery({})

  const nodes = nodesQuery.data || []

  if (prevActiveNodeId !== activeNode?.id) {
    if (prevActiveNodeId) {
      setNodeFeatureState(mapRef, prevActiveNodeId, { active: false })
    }

    if (activeNode) {
      setNodeFeatureState(mapRef, activeNode.id, { active: true })

      const map = mapRef.current?.getMap()

      if (map) {
        const location = [activeNode.location.longitude, activeNode.location.latitude]

        if (!map.getBounds().contains(location)) {
          map.panTo(location)
        }
      }
    }

    activeNodeIdRef.current = activeNode?.id || null
  }

  const navigate = useNavigate()

  useGlobalKeyDownEffect('0', () => {
    setViewport(defaultViewport)
  })

  const location = useLocationFromParams()

  const locationKeyRef = useRef<string | null>(null)

  if (location) {
    const locationKey = getLocationKey(location)

    if (locationKeyRef.current !== locationKey) {
      setViewport((current) => ({
        ...current,
        ...location,
      }))

      locationKeyRef.current = locationKey
    }
  } else {
    locationKeyRef.current = null
  }

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

          const to =
            isOperatorNodeGeoFeature(feature) && feature.properties.id !== activeNode?.id
              ? `/nodes/${feature.properties.id}`
              : '/'

          navigate(to)
        }}
        onHover={(e) => {
          const feature: GeoJSON.Feature | undefined = (e.features || [])[0]

          const nodeId = isOperatorNodeGeoFeature(feature) ? feature.properties.id : null

          const { current: prevNodeId } = hoveredNodeIdRef

          if (nodeId === prevNodeId) {
            return
          }

          if (prevNodeId) {
            setNodeFeatureState(mapRef, prevNodeId, { hover: false })

            hoveredNodeIdRef.current = null
          }

          if (nodeId) {
            setNodeFeatureState(mapRef, nodeId, { hover: true })

            hoveredNodeIdRef.current = nodeId
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
        <MarkerLayer nodes={nodes} sourceId={NodeSourceId} layerId={NodeLayerId} />
        <NavigationControl
          onZoomIn={() => {
            setViewport(({ zoom = 0, ...rest }) => ({
              ...rest,
              zoom: zoom + 1,
            }))
          }}
          onZoomOut={() => {
            setViewport(({ zoom = 0, ...rest }) => ({
              ...rest,
              zoom: zoom - 1,
            }))
          }}
          onZoomReset={() => {
            setViewport(defaultViewport)
          }}
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
