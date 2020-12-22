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
import useSupercluster from 'use-supercluster'
import { PointFeature } from 'supercluster'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useHistory } from 'react-router-dom'

import { NodeProperties } from './types'
import ConnectionLayer from './ConnectionLayer'
import MarkerLayer from './MarkerLayer'
import NavigationControl, { Props as NavigationControlProps } from './NavigationControl'

import useWindowSize from '../../hooks/useWindowSize'
import { useStore, ActiveView } from '../../contexts/Store'
import { MAPBOX_TOKEN } from '../../utils/api/mapbox'
import { Node, Topology } from '../../utils/api/tracker'
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

const padBounds = (bounds: number[], padding: number) => {
  if (bounds != null) {
    return [
      bounds[0] - padding,
      bounds[1] - padding,
      bounds[2] + padding,
      bounds[3] + padding,
    ]
  }
  return bounds
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

  // Convert topology to a list of node connection pairs
  const connections = useMemo(() => (
    Object.keys(topology || {}).flatMap((key) => {
      const nodeList = topology[key]
      return nodeList.map((n) => [key, n])
    })
  ), [topology])

  const points: Array<PointFeature<NodeProperties>> = useMemo(() =>
    (nodes || []).map((node) => ({
      type: 'Feature',
      properties: {
        nodeId: node.id,
        cluster: false,
        point_count: 1,
        point_count_abbreviated: '1',
      },
      geometry: {
        type: 'Point',
        coordinates: [node.longitude, node.latitude],
      },
    })), [nodes])

  // Calculate map bounds for current viewport
  const vp = new WebMercatorViewport({
    ...viewport,
  })
  const [north, west] = vp.unproject([0, 0])
  const [east, south] = vp.unproject([viewport.width, viewport.height])
  const bounds = [north, south, east, west]

  // Calculate clusters
  const { clusters, supercluster } = useSupercluster({
    points,
    // Add a bit of safe margin to bounds so that supercluster will not filter
    // markers on the edges of viewport so aggressively.
    bounds: padBounds(bounds, 0.1) as [number, number, number, number],
    zoom: viewport.zoom,
    options: {
      radius: 40,
      minZoom: viewport.minZoom,
      maxZoom: viewport.maxZoom,
    },
  })

  // Calculate clusters separately for the whole world at current zoom level
  // so that we can use it to draw connections even when nodes are out of
  // current viewport.
  const worldBounds = [-180, -90, 180, 90] as [number, number, number, number]
  const { clusters: worldClusters, supercluster: worldSupercluster } = useSupercluster({
    points,
    bounds: worldBounds,
    zoom: viewport.zoom,
    options: {
      radius: 40,
      minZoom: viewport.minZoom,
      maxZoom: viewport.maxZoom,
    },
  })

  return (
    <ReactMapGL
      {...viewport}
      mapboxApiAccessToken={MAPBOX_TOKEN}
      mapStyle='mapbox://styles/mattinnes/ckdtszq5m0iht19qk0zuz52oy'
      onViewportChange={setViewport}
      ref={mapRef}
      onClick={onMapClick}
    >
      {worldSupercluster != null && (
        <ConnectionLayer
          supercluster={worldSupercluster}
          clusters={worldClusters}
          nodeConnections={connections}
        />
      )}
      {supercluster != null && (
        <MarkerLayer
          supercluster={supercluster}
          clusters={clusters}
          viewport={viewport}
          setViewport={(...args) => setViewport(...args)}
          activeNode={activeNode && activeNode.id}
          onNodeClick={onNodeClick}
        />
      )}
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
