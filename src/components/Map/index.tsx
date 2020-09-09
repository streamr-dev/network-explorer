import React, { useState, useEffect, useRef } from 'react'
import ReactMapGL, {
  NavigationControl,
  Marker,
  ViewportProps,
  SVGOverlay,
  HTMLRedrawOptions,
  InteractiveMap,
  FlyToInterpolator,
} from 'react-map-gl'
import styled from 'styled-components/macro'
import useSupercluster from 'use-supercluster'
import Supercluster, { PointFeature } from 'supercluster'
import 'mapbox-gl/dist/mapbox-gl.css'
import ConnectionLayer from './ConnectionLayer'

import useWindowSize from '../../hooks/useWindowSize'

const MAPBOX_TOKEN = 'pk.eyJ1IjoibWF0dGlubmVzIiwiYSI6ImNrNWhrN2FubDA0cGgzam1ycHV6Nmg2dHoifQ.HC5_Wu1R-OqRLza1u6P3Ig'

interface NodeProperties {
  nodeId: number,
  cluster: boolean,
  cluster_id?: number,
  point_count: number,
  point_count_abbreviated: string,
}

// eslint-disable-next-line react/require-default-props
const NodeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M16 0C27.8241 0 32 4.19557 32 16C32 27.7598 27.7545 32 16 32C4.28014 32 0 27.7054 0 16C0 4.24975 4.21033 0 16 0Z"
      fill="#0324FF"
    />
  </svg>
)

const ClusterIcon = ({ size, onClick }: { size: number, onClick: () => void }) => (
  <ClusterContainer onClick={onClick}>
    <NodeIcon />
    <span>{size}</span>
  </ClusterContainer>
)

const NavigationContainer = styled.div`
  position: absolute;
  right: 32px;
  bottom: 32px;
`

const NodeMarker = styled(NodeIcon)`
  width: 32px;
  height: 32px;
  transform: translate(-50%, -50%);
`

const NodeConnection = styled.path`
  color: #0324FF;
  stroke-dasharray: 5;
`

const ClusterContainer = styled.div`
  position: relative;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transform: translate(-50%, -50%);

  & span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #ffffff;
  }
`
type SuperClusterType = Supercluster<NodeProperties, Supercluster.AnyProps>

type ClusterPointFeature =
  | Supercluster.PointFeature<NodeProperties>
  | Supercluster.PointFeature<Supercluster.ClusterProperties & Supercluster.AnyProps>

type ClusterConnection = {
  source: [number, number],
  target: [number, number],
}

const getClusterConnections = (
  supercluster: SuperClusterType,
  clusters: Array<ClusterPointFeature>,
  nodeConnections: Array<[number, number]>,
) => {
  const clusterNodes = clusters.map((cluster) => ({
    id: cluster.properties.cluster ? cluster.id : cluster.properties.nodeId,
    cluster,
    nodes: getNodesInCluster(supercluster, cluster),
  }))

  const connections: Array<ClusterConnection> = []
  nodeConnections.forEach((connection) => {
    const src = clusterNodes.find((n) => n.nodes.includes(connection[0]))
    const target = clusterNodes.find((n) => n.nodes.includes(connection[1]))

    if (src != null && target != null && src !== target) {
      const conn = {
        source: src.cluster.geometry.coordinates as [number, number],
        target: target.cluster.geometry.coordinates as [number, number],
      }
      connections.push(conn)
    }
  })

  return connections
}

const getNodesInCluster = (
  supercluster: SuperClusterType,
  cluster: ClusterPointFeature,
): Array<number> => {
  // Get all chilren recursively
  if (cluster.properties.cluster && typeof cluster.id === 'number') {
    const children = supercluster.getChildren(cluster.id)
    return children
      .flatMap((child) => getNodesInCluster(supercluster, child))
  }

  // This is a leaf node, return its id
  return [cluster.properties.nodeId]
}

const Map = () => {
  const mapRef = useRef<InteractiveMap>(null)

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

  const [nodeLocations] = useState([
    {
      id: 1,
      latitude: 60.15952,
      longitude: 24.93545,
    },
    {
      id: 2,
      latitude: 60.15852,
      longitude: 24.94545,
    },
    {
      id: 3,
      latitude: 60.18952,
      longitude: 24.91545,
    },
    {
      id: 4,
      latitude: 60.19952,
      longitude: 24.92545,
    },
    {
      id: 5,
      latitude: 60.17952,
      longitude: 24.92545,
    },
  ])

  const [nodeConnections] = useState<Array<[number, number]>>([[1, 2], [1, 3], [4, 5]])

  const points: Array<PointFeature<NodeProperties>> = nodeLocations.map((node) => ({
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

  const windowSize = useWindowSize()
  useEffect(() => {
    setViewport((prev) => ({
      ...prev,
      width: windowSize.width ?? prev.width,
      height: windowSize.height ?? prev.height,
    }))
  }, [windowSize.width, windowSize.height])

  return (
    <ReactMapGL
      {...viewport}
      mapboxApiAccessToken={MAPBOX_TOKEN}
      mapStyle='mapbox://styles/mattinnes/ckdtszq5m0iht19qk0zuz52oy'
      onViewportChange={(v: ViewportProps) => setViewport({ ...v })}
      ref={mapRef}
    >
      <ConnectionLayer />
      <SVGOverlay
        redraw={(opts: HTMLRedrawOptions) => {
          if (supercluster == null) {
            return null
          }

          const connections = getClusterConnections(supercluster, clusters, nodeConnections)
          return connections.map((conn) => {
            const [ax, ay] = opts.project(conn.source)
            const [bx, by] = opts.project(conn.target)
            return (
              <NodeConnection
                key={`connection-${ax}-${bx}`}
                d={`M ${ax} ${ay} L ${bx} ${by}`}
                fill="transparent"
                stroke="currentColor"
              />
            )
          })
        }}
      />
      {clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates
        const {
          cluster: isCluster,
          point_count: pointCount,
          nodeId,
        } = cluster.properties

        if (isCluster) {
          return (
            <Marker
              key={`cluster-${cluster.id}`}
              latitude={latitude}
              longitude={longitude}
            >
              <ClusterIcon
                size={pointCount}
                onClick={() => {
                  if (cluster.id == null || supercluster == null || typeof cluster.id !== 'number') {
                    return
                  }

                  const expansionZoom = Math.min(
                    supercluster.getClusterExpansionZoom(cluster.id),
                    viewport.maxZoom,
                  )

                  setViewport({
                    ...viewport,
                    latitude,
                    longitude,
                    zoom: expansionZoom,
                    transitionInterpolator: new FlyToInterpolator({
                      speed: 3,
                    }),
                    transitionDuration: 'auto',
                  })
                }}
              />
            </Marker>
          )
        }

        return (
          <Marker
            key={`node-${nodeId}`}
            latitude={latitude}
            longitude={longitude}
          >
            <NodeMarker />
          </Marker>
        )
      })}
      <NavigationContainer>
        <NavigationControl
          showCompass={false}
          onViewportChange={(v: ViewportProps) => setViewport({ ...v })}
        />
      </NavigationContainer>
    </ReactMapGL>
  )
}

export default Map
