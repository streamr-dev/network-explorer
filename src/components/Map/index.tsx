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

import { useStore, ActiveView, Topology } from '../../contexts/Store'
import { MAPBOX_TOKEN } from '../../utils/api/mapbox'
import { Node } from '../../utils/api/tracker'
import { useDebounced } from '../../hooks/wrapCallback'
import { getCenteredViewport } from './utils'
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
  latitude: 60.16952,
  longitude: 24.93545,
  zoom: 10,
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
      onClick={onMapClick}
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
      <ConnectionLayer topology={topology} nodes={nodes} visible={!!showConnections} />
      <MarkerLayer
        nodes={nodes}
        activeNode={activeNode && activeNode.id}
        onNodeClick={onNodeClick}
      />
      <NavigationControl
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onZoomReset={onZoomReset}
        onToggleConnections={onToggleConnections}
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
    setActiveView,
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

  // zoom topology into view
  useEffect(() => {
    if (visibleNodes.length <= 0) {
      return
    }

    debouncedSetViewport((prev: ViewportProps) => {
      const vp = getCenteredViewport(visibleNodes, prev.width || 0, prev.height || 0)
      return {
        ...prev,
        ...vp,
      }
    })
  }, [debouncedSetViewport, visibleNodes])

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
      setActiveView(ActiveView.Map)

      showNode(nodeId !== activeNodeId ? nodeId : undefined)
    },
    [setActiveView, showNode, activeNodeId],
  )

  // reset search view when clicking on map
  const onMapClick = useCallback(() => {
    setActiveView(ActiveView.Map)

    // unselect active node
    showNode(undefined)
  }, [setActiveView, showNode])

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
      const nextViewport = getCenteredViewport(visibleNodes, prev.width || 0, prev.height || 0)
      return {
        ...prev,
        ...nextViewport,
        LINEAR_TRANSITION_PROPS,
      }
    })
  }, [debouncedSetViewport, visibleNodes])

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
