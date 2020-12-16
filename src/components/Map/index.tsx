import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react'
import ReactMapGL, {
  NavigationControl,
  InteractiveMap,
  ViewportProps,
  WebMercatorViewport,
  FlyToInterpolator,
} from 'react-map-gl'
import styled from 'styled-components/macro'
import useSupercluster from 'use-supercluster'
import { PointFeature } from 'supercluster'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useHistory } from 'react-router-dom'

import { NodeProperties } from './types'
import ConnectionLayer from './ConnectionLayer'
import MarkerLayer from './MarkerLayer'

import useWindowSize from '../../hooks/useWindowSize'
import { useStore, ActiveView } from '../../contexts/Store'
import { MAPBOX_TOKEN } from '../../utils/api/mapbox'
import { Node, Topology } from '../../utils/api/tracker'
import { useDebounced } from '../../hooks/wrapCallback'

const NavigationContainer = styled.div`
  position: absolute;
  right: 32px;
  bottom: 32px;
`

type ViewPort = Record<string, number>

type Props = {
  nodes: Node[],
  topology: Topology,
  activeNode?: Node,
  viewport: ViewportProps,
  setViewport: (viewport: ViewportProps) => void,
  onNodeClick?: (v: string) => void,
  onMapClick?: () => void,
}

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
}: Props) => {
  const mapRef = useRef<InteractiveMap>(null)

  // Convert topology to a list of node connection pairs
  const connections = useMemo(() => (
    Object.keys(topology || {}).flatMap((key) => {
      const nodeList = topology[key]
      return nodeList.map((n) => [key, n])
    })
  ), [topology])

  const points: Array<PointFeature<NodeProperties>> = (nodes || []).map((node) => ({
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
  }))
  let bounds = mapRef.current?.getMap()?.getBounds().toArray().flat() as [
    number,
    number,
    number,
    number
  ]
  const safeMargin = 0.1
  // Add a bit of safe margin to bounds so that supercluster will not filter
  // markers on the edges of viewport so aggressively.
  if (bounds != null) {
    bounds = [
      bounds[0] - safeMargin,
      bounds[1] - safeMargin,
      bounds[2] + safeMargin,
      bounds[3] + safeMargin,
    ]
  }
  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom: viewport.zoom,
    options: {
      radius: 40,
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
      {supercluster != null && (
        <>
          <ConnectionLayer
            supercluster={supercluster}
            clusters={clusters}
            nodeConnections={connections}
          />
          <MarkerLayer
            supercluster={supercluster}
            clusters={clusters}
            viewport={viewport}
            setViewport={(...args) => setViewport(...args)}
            activeNode={activeNode && activeNode.id}
            onNodeClick={onNodeClick}
          />
        </>
      )}
      <NavigationContainer>
        <NavigationControl
          showCompass={false}
          onViewportChange={setViewport}
        />
      </NavigationContainer>
    </ReactMapGL>
  )
}

export const ConnectedMap = () => {
  const {
    visibleNodes,
    topology,
    activeNode,
    streamId,
    setActiveView,
  } = useStore()
  const history = useHistory()
  const [viewport, setViewport] = useState<ViewportProps>({
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

  // zoom selected network node into view
  useEffect(() => {
    if (activeNode) {
      debouncedSetViewport((prev: ViewportProps) => ({
        ...prev,
        longitude: activeNode.longitude,
        latitude: activeNode.latitude,
        zoom: 10,
      }))
    }
  }, [debouncedSetViewport, activeNode])

  // zoom topology into view
  useEffect(() => {
    if (visibleNodes.length <= 0 || !!activeNode) { return }

    debouncedSetViewport((prev: ViewportProps) => {
      const pointsLong = visibleNodes.map(point => point.longitude)
      const pointsLat = visibleNodes.map(point => point.latitude)
      const cornersLongLat: [[number, number], [number, number]] = [
        [Math.min(...pointsLong), Math.min(...pointsLat)],
        [Math.max(...pointsLong), Math.max(...pointsLat)],
      ]

      // Use WebMercatorViewport to get center longitude/latitude and zoom
      const { longitude, latitude, zoom } = new WebMercatorViewport({
        width: prev.width,
        height: prev.height,
      })
        .fitBounds(cornersLongLat, { padding: 200 }) // Can also use option: offset: [0, -100]

      return {
        ...prev,
        longitude,
        latitude,
        zoom,
      }
    })
  }, [debouncedSetViewport, visibleNodes, activeNode])

  const windowSize = useWindowSize()

  useEffect(() => {
    debouncedSetViewport((prev: ViewportProps) => ({
      ...prev,
      width: windowSize.width ?? prev.width,
      height: windowSize.height ?? prev.height,
    }))
  }, [debouncedSetViewport, windowSize.width, windowSize.height])

  const { id: activeNodeId } = activeNode || {}

  const onNodeClick = useCallback((nodeId: string) => {
    let path = '/'

    if (streamId) {
      path += `streams/${encodeURIComponent(streamId)}/`
    }

    if (nodeId !== activeNodeId) {
      path += `nodes/${nodeId}`
    }

    history.replace(path)
  }, [streamId, activeNodeId, history])

  // reset search view when clicking on map
  const onMapClick = useCallback(() => {
    setActiveView(ActiveView.Map)
  }, [setActiveView])

  return (
    <Map
      nodes={visibleNodes}
      viewport={viewport}
      topology={topology}
      setViewport={setViewport}
      activeNode={activeNode}
      onNodeClick={onNodeClick}
      onMapClick={onMapClick}
    />
  )
}

export default ConnectedMap
