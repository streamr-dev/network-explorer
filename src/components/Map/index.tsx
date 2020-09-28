import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
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

import { NodeProperties } from './types'
import ConnectionLayer from './ConnectionLayer'
import MarkerLayer from './MarkerLayer'

import useWindowSize from '../../hooks/useWindowSize'
import { useTopology } from '../../contexts/Topology'
import { MAPBOX_TOKEN } from '../../utils/api/mapbox'
import { Node, Topology } from '../../utils/api/tracker'

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
  let bounds = mapRef.current?.getMap().getBounds().toArray().flat() as [
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

export default () => {
  const { visibleNodes, topology, activeNode } = useTopology()
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
  })

  // zoom selected network node into view
  useEffect(() => {
    if (activeNode) {
      setViewport((prev) => ({
        ...prev,
        longitude: activeNode.longitude,
        latitude: activeNode.latitude,
        zoom: 5,
        transitionInterpolator: new FlyToInterpolator({
          speed: 3,
        }),
        transitionDuration: 'auto',
      }))
    }
  }, [activeNode])

  // zoom topology into view
  useEffect(() => {
    if (visibleNodes.length <= 0) { return }

    setViewport((prev) => {
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
        transitionInterpolator: new FlyToInterpolator({
          speed: 3,
        }),
        transitionDuration: 'auto',
      }
    })
  }, [visibleNodes])

  const windowSize = useWindowSize()

  useEffect(() => {
    setViewport((prev) => ({
      ...prev,
      width: windowSize.width ?? prev.width,
      height: windowSize.height ?? prev.height,
    }))
  }, [setViewport, windowSize.width, windowSize.height])

  return (
    <Map
      nodes={visibleNodes}
      viewport={viewport}
      topology={topology}
      setViewport={setViewport}
      activeNode={activeNode}
    />
  )
}
