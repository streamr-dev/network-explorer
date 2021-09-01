import React, {
  useState, useEffect, useRef, useMemo, useCallback,
} from 'react'
import ReactMapGL, {
  ViewportProps,
  FlyToInterpolator,
  LinearInterpolator,
  MapRef,
  TRANSITION_EVENTS,
} from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import ConnectionLayer from './ConnectionLayer'
import MarkerLayer from './MarkerLayer'
import NavigationControl, { Props as NavigationControlProps } from './NavigationControl'

import { useStore, Topology } from '../../contexts/Store'
import { MAPBOX_TOKEN } from '../../utils/api/mapbox'
import { Node } from '../../utils/api/tracker'
import { useDebounced } from '../../hooks/wrapCallback'
import useKeyDown from '../../hooks/useKeyDown'

type Props = {
  nodes: Node[]
  topology: Topology
  activeNode?: Node
  viewport: ViewportProps
  setViewport: React.Dispatch<React.SetStateAction<ViewportProps>>
  onNodeClick?: (v: string) => void
  onMapClick?: () => void
  canShowConnections?: boolean,
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
  maxZoom: 20,
  minZoom: 0,
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
  canShowConnections = false,
  showConnections = false,
}: Props) => {
  const mapRef = useRef<MapRef>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const hoveredNodeIdRef = useRef<string | null>(null)
  const activeNodeIdRef = useRef<string | null>(null)

  const setNodeFeatureState = useCallback((id: string, state) => {
    const map = mapRef.current?.getMap()

    if (map && map.loaded()) {
      map.setFeatureState({
        source: NODE_SOURCE_ID,
        id,
      }, {
        ...state,
      })
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
      {!!canShowConnections && (
        <ConnectionLayer topology={topology} nodes={nodes} visible={!!showConnections} />
      )}
      <MarkerLayer
        nodes={nodes}
        sourceId={NODE_SOURCE_ID}
        layerId={NODE_LAYER_ID}
      />
      <NavigationControl
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onZoomReset={onZoomReset}
        onToggleConnections={canShowConnections ? onToggleConnections : undefined}
        ref={navRef}
      />
    </ReactMapGL>
  )
}

const LINEAR_TRANSITION_PROPS = {
  transitionDuration: 300,
  transitionEasing: (t: number) => t,
  transitionInterpolator: new LinearInterpolator(),
  transitionInterruption: TRANSITION_EVENTS.BREAK,
}

const MapContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
`

export const ConnectedMap = () => {
  const {
    visibleNodes,
    topology,
    activeNode,
    activeLocation,
    streamId,
    showConnections,
    toggleShowConnections,
  } = useStore()
  const history = useHistory()
  const [viewport, setViewport] = useState<ViewportProps>({
    ...defaultViewport,
    transitionInterpolator: new FlyToInterpolator({
      speed: 3,
    }),
    transitionDuration: 2000,
  })

  const debouncedSetViewport = useDebounced(
    useCallback(async (viewPort: ViewportProps) => setViewport(viewPort), []),
    250,
  )

  // zoom selected location into view
  useEffect(() => {
    if (activeLocation) {
      debouncedSetViewport((prev: ViewportProps) => ({
        ...prev,
        longitude: activeLocation.longitude,
        latitude: activeLocation.latitude,
        zoom: 10,
      }))
    }
  }, [debouncedSetViewport, activeLocation])

  const { id: activeNodeId } = activeNode || {}

  const showNode = useCallback(
    (nodeId?: string) => {
      let path = '/'

      if (streamId) {
        path += `streams/${encodeURIComponent(streamId)}/`
      }

      if (nodeId) {
        path += `nodes/${encodeURIComponent(nodeId)}`
      }

      history.replace(path)
    },
    [streamId, history],
  )

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

  const zoomIn = useCallback(() => {
    debouncedSetViewport((prev: ViewportProps) => ({
      ...prev,
      zoom: (prev.zoom || 0) + 1,
      LINEAR_TRANSITION_PROPS,
    }))
  }, [debouncedSetViewport])

  const zoomOut = useCallback(() => {
    debouncedSetViewport((prev: ViewportProps) => ({
      ...prev,
      zoom: (prev.zoom || 0) - 1,
      LINEAR_TRANSITION_PROPS,
    }))
  }, [debouncedSetViewport])

  const reset = useCallback(() => {
    debouncedSetViewport((prev: ViewportProps) => {
      const nextViewport = defaultViewport
      return {
        ...prev,
        ...nextViewport,
        LINEAR_TRANSITION_PROPS,
      }
    })
  }, [debouncedSetViewport])

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
        canShowConnections={!!streamId}
        showConnections={showConnections === 'auto' || showConnections === 'always'}
        onToggleConnections={toggleShowConnections}
      />
    </MapContainer>
  )
}

export default ConnectedMap
