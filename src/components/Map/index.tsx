import React, {
  useEffect, useRef, useMemo, useCallback,
} from 'react'
import ReactMapGL, {
  ViewportProps,
  MapRef,
} from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import styled from 'styled-components'

import ConnectionLayer from './ConnectionLayer'
import MarkerLayer from './MarkerLayer'
import NavigationControl, { Props as NavigationControlProps } from './NavigationControl'

import { useStore, Topology } from '../../contexts/Store'
import { useController } from '../../contexts/Controller'
import { MAPBOX_TOKEN } from '../../utils/api/mapbox'
import { Node } from '../../utils/api/tracker'
import useKeyDown from '../../hooks/useKeyDown'

type Props = {
  nodes: Node[]
  topology: Topology
  activeNode?: Node
  viewport: ViewportProps
  setViewport: React.Dispatch<React.SetStateAction<ViewportProps>>
  onNodeClick?: (v: string) => void
  onMapClick?: () => void
  showConnections?: boolean
} & NavigationControlProps

const defaultViewport = {
  width: 0,
  height: 0,
  latitude: 53.86859,
  longitude: -0.36616,
  zoom: 3,
  bearing: 0,
  pitch: 0,
  altitude: 0,
  maxZoom: 15,
  minZoom: 2,
  maxPitch: 60,
  minPitch: 0,
}

// react-map-gl documentation: The value specifies after how long the operation comes to a stop, in milliseconds
const INERTIA = 300

const NODE_SOURCE_ID = 'node-source'
const NODE_LAYER_ID = 'node-layer'

function getCursor({ isHovering, isDragging }: { isHovering: boolean; isDragging: boolean }) {
  if (isDragging) {
    return 'all-scroll'
  }

  return isHovering ? 'pointer' : 'default'
}

export const Map = ({
  nodes,
  topology,
  activeNode,
  viewport = defaultViewport,
  setViewport,
  onNodeClick,
  onMapClick,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onToggleConnections,
  showConnections = false,
}: Props) => {
  const mapRef = useRef<MapRef>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const hoveredNodeIdRef = useRef<string | null>(null)
  const activeNodeIdRef = useRef<string | null>(null)

  const setNodeFeatureState = useCallback((id: string, state) => {
    const map = mapRef.current?.getMap()

    if (map && map.isStyleLoaded()) {
      map.setFeatureState({
        source: NODE_SOURCE_ID,
        id,
      }, {
        ...state,
      })
    } else if (map && !map.isStyleLoaded()) {
      // Defer the call for a while to wait for styles to load
      setTimeout(() => setNodeFeatureState(id, state), 100)
    }
  }, [])

  useEffect(() => {
    // Set node feature state to contain active status
    if (activeNode?.id) {
      if (activeNodeIdRef.current !== activeNode.id) {
        if (activeNodeIdRef.current) {
          setNodeFeatureState(activeNodeIdRef.current, { active: false })
        }
        activeNodeIdRef.current = activeNode.id
      }

      setNodeFeatureState(activeNodeIdRef.current, { active: true })
    } else if (activeNodeIdRef.current != null) {
      setNodeFeatureState(activeNodeIdRef.current, { active: false })
      activeNodeIdRef.current = null
    }
  }, [activeNode, setNodeFeatureState])

  // Bring active node into view if it's outside of map bounds
  useEffect(() => {
    const map = mapRef.current?.getMap()
    if (map && activeNode) {
      const lngLat = [activeNode.location.longitude, activeNode.location.latitude]
      const isInBounds = map.getBounds().contains(lngLat)
      if (!isInBounds) {
        map.panTo(lngLat)
      }
    }
  }, [activeNode])

  return (
    <ReactMapGL
      {...viewport}
      width="100%"
      height="100%"
      mapboxApiAccessToken={MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mattinnes/cklaehqgx01yh17pdfs03tt8t"
      onViewportChange={setViewport}
      getCursor={getCursor}
      ref={mapRef}
      interactiveLayerIds={[NODE_LAYER_ID]}
      onClick={(e) => {
        if (!navRef.current!.contains(e.target)) {
          // Did we click on a node or just the background map layer?
          if (onNodeClick && e.features && e.features.length > 0) {
            const firstId = e.features[0].properties.id
            if (firstId) {
              onNodeClick(firstId)
            }
          } else if (onMapClick) {
            onMapClick()
          }
        }
      }}
      onHover={(e) => {
        // Set node feature state to contain hover status
        if (e.features && e.features.length > 0) {
          if (e.features[0].properties.id) {
            if (hoveredNodeIdRef.current !== e.features[0].properties.id) {
              if (hoveredNodeIdRef.current) {
                setNodeFeatureState(hoveredNodeIdRef.current, { hover: false })
              }
              hoveredNodeIdRef.current = e.features[0].properties.id
            }

            if (hoveredNodeIdRef.current) {
              setNodeFeatureState(hoveredNodeIdRef.current, { hover: true })
            }
          }
        } else {
          if (hoveredNodeIdRef.current) {
            setNodeFeatureState(hoveredNodeIdRef.current, { hover: false })
          }
          hoveredNodeIdRef.current = null
        }
      }}
      dragPan={{
        inertia: INERTIA,
      }}
      dragRotate={{
        inertia: INERTIA,
      }}
      touchZoom={{
        inertia: INERTIA,
      }}
      touchRotate={{
        inertia: INERTIA,
      }}
    >
      <ConnectionLayer
        topology={topology}
        nodes={nodes}
        activeNode={activeNode}
        visible={!!showConnections}
      />
      <MarkerLayer
        nodes={nodes}
        sourceId={NODE_SOURCE_ID}
        layerId={NODE_LAYER_ID}
      />
      <NavigationControl
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onZoomReset={onZoomReset}
        onToggleConnections={onToggleConnections}
        ref={navRef}
      />
    </ReactMapGL>
  )
}

const MapContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100%;
`

export const ConnectedMap = () => {
  const {
    visibleNodes,
    topology,
    activeNode,
    streamId,
    showConnections,
    toggleShowConnections,
  } = useStore()
  const {
    viewport,
    setViewport,
    showNode,
    zoomIn,
    zoomOut,
    reset,
  } = useController()

  const { id: activeNodeId } = activeNode || {}

  const onNodeClick = useCallback(
    (nodeId: string) => {
      showNode(nodeId !== activeNodeId ? nodeId : undefined)
    },
    [showNode, activeNodeId],
  )

  // reset search view when clicking on map
  const onMapClick = useCallback(() => {
    // unselect active node
    showNode(undefined)
  }, [showNode])

  useKeyDown(
    useMemo(
      () => ({
        '0': () => {
          reset()
        },
      }),
      [reset],
    ),
  )

  return (
    <MapContainer>
      <Map
        nodes={visibleNodes}
        viewport={viewport}
        topology={topology}
        setViewport={setViewport}
        activeNode={activeNode}
        onNodeClick={onNodeClick}
        onMapClick={onMapClick}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onZoomReset={reset}
        showConnections={(showConnections === 'auto' && !!streamId) || showConnections === 'always'}
        onToggleConnections={toggleShowConnections}
      />
    </MapContainer>
  )
}

export default ConnectedMap
