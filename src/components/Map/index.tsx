import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react'
import ReactMapGL, {
  InteractiveMap,
  ViewportProps,
  FlyToInterpolator,
  LinearInterpolator,
} from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useHistory } from 'react-router-dom'

import ConnectionLayer from './ConnectionLayer'
import MarkerLayer from './MarkerLayer'
import NavigationControl, { Props as NavigationControlProps } from './NavigationControl'

import useWindowSize from '../../hooks/useWindowSize'
import { useStore, ActiveView, Topology } from '../../contexts/Store'
import { MAPBOX_TOKEN } from '../../utils/api/mapbox'
import { Node } from '../../utils/api/tracker'
import { useDebounced } from '../../hooks/wrapCallback'
import { getCenteredViewport } from './utils'
import useKeyDown from '../../hooks/useKeyDown'

type Props = {
  nodes: Node[],
  topology: Topology,
  activeNode?: Node,
  viewport: ViewportProps,
  setViewport: React.Dispatch<React.SetStateAction<ViewportProps>>,
  onNodeClick?: (v: string) => void,
  onMapClick?: () => void,
} & NavigationControlProps

const defaultViewport = {
  width: 400,
  height: 400,
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
}: Props) => {
  const mapRef = useRef<InteractiveMap>(null)

  return (
    <ReactMapGL
      {...viewport}
      mapboxApiAccessToken={MAPBOX_TOKEN}
      mapStyle='mapbox://styles/mattinnes/cklaehqgx01yh17pdfs03tt8t'
      onViewportChange={setViewport}
      ref={mapRef}
      onClick={onMapClick}
    >
      <ConnectionLayer
        topology={topology}
        nodes={nodes}
      />
      <MarkerLayer
        nodes={nodes}
        activeNode={activeNode && activeNode.id}
        onNodeClick={onNodeClick}
      />
      <NavigationControl
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onZoomReset={onZoomReset}
      />
    </ReactMapGL>
  )
}

const LINEAR_TRANSITION_PROPS = {
  transitionDuration: 300,
  transitionEasing: (t: number) => t,
  transitionInterpolator: new LinearInterpolator(),
}

export const ConnectedMap = () => {
  const {
    visibleNodes,
    topology,
    activeNode,
    activeLocation,
    streamId,
    setActiveView,
  } = useStore()
  const history = useHistory()
  const [viewport, setViewport] = useState<ViewportProps>({
    ...defaultViewport,
    transitionInterpolator: new FlyToInterpolator({
      speed: 3,
    }),
    transitionDuration: 'auto',
  })

  const debouncedSetViewport = useDebounced(
    useCallback(async (viewPort: ViewportProps) => (
      setViewport(viewPort)
    ), []),
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
    if (visibleNodes.length <= 0) { return }

    debouncedSetViewport((prev: ViewportProps) => {
      const vp = getCenteredViewport(visibleNodes, prev.width, prev.height)
      return {
        ...prev,
        ...vp,
      }
    })
  }, [debouncedSetViewport, visibleNodes])

  const windowSize = useWindowSize()

  useEffect(() => {
    debouncedSetViewport((prev: ViewportProps) => ({
      ...prev,
      width: windowSize.width ?? prev.width,
      height: windowSize.height ?? prev.height,
    }))
  }, [debouncedSetViewport, windowSize.width, windowSize.height])

  const onNodeClick = useCallback((nodeId: string) => {
    let path = '/'

    if (streamId) {
      path += `streams/${encodeURIComponent(streamId)}/`
    }

    path += `nodes/${nodeId}`

    history.replace(path)
  }, [streamId, history])

  // reset search view when clicking on map
  const onMapClick = useCallback(() => {
    setActiveView(ActiveView.Map)
  }, [setActiveView])

  const zoomIn = useCallback(() => {
    debouncedSetViewport((prev: ViewportProps) => ({
      ...prev,
      zoom: prev.zoom + 1,
      LINEAR_TRANSITION_PROPS,
    }))
  }, [debouncedSetViewport])

  const zoomOut = useCallback(() => {
    debouncedSetViewport((prev: ViewportProps) => ({
      ...prev,
      zoom: prev.zoom - 1,
      LINEAR_TRANSITION_PROPS,
    }))
  }, [debouncedSetViewport])

  const reset = useCallback(() => {
    debouncedSetViewport((prev: ViewportProps) => {
      const nextViewport = getCenteredViewport(visibleNodes, prev.width, prev.height)
      return {
        ...prev,
        ...nextViewport,
        LINEAR_TRANSITION_PROPS,
      }
    })
  }, [debouncedSetViewport, visibleNodes])

  useKeyDown(useMemo(() => ({
    '0': () => {
      reset()
    },
  }), [reset]))

  return (
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
    />
  )
}

export default ConnectedMap
