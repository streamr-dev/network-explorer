import React from 'react'
import { Marker, ViewportProps, FlyToInterpolator } from 'react-map-gl'
import { PointFeature } from 'supercluster'
import { SuperClusterType, ClusterPointFeature, NodeProperties } from './types'
import { NodeMarker, ClusterMarker } from './Markers'

type Props = {
  supercluster: SuperClusterType,
  clusters: Array<ClusterPointFeature>,
  points: Array<PointFeature<NodeProperties>>,
  viewport: ViewportProps,
  setViewport: (v: ViewportProps) => void,
  activeNode?: string,
  onNodeClick?: (v: string) => void,
}

const arePointsOverlapped = (a: ClusterPointFeature, b: ClusterPointFeature) => {
  return a.geometry.coordinates.every((coord, index) => coord === b.geometry.coordinates[index])
}

const getCirclePositions = (center: [number, number], count: number) => {
  const circleFootSeparation = 0.000018
  const circumference = circleFootSeparation * (2 + count)
  const legLength = circumference / (2 * Math.PI)
  const angleStep = (2 * Math.PI) / count

  return [...Array(count).keys()].map((_, index) => {
    const angle = index * angleStep
    return {
      latitude: center[1] + (legLength * Math.cos(angle)),
      longitude: center[0] + (legLength * Math.sin(angle)),
      angle,
      legLength,
      index,
    }
  })
}

const MarkerLayer = ({
  supercluster,
  clusters,
  points,
  viewport,
  setViewport,
  activeNode,
  onNodeClick,
}: Props) => (
  <>
    {points.map((cluster) => {
      const [longitude, latitude] = cluster.geometry.coordinates
      const {
        cluster: isCluster,
        point_count: pointCount,
        nodeId,
      } = cluster.properties

      return (
        <Marker key={`node-${nodeId}`} latitude={latitude} longitude={longitude}>
          <NodeMarker
            id={nodeId}
            isActive={activeNode === nodeId}
            onClick={() => onNodeClick && onNodeClick(nodeId)}
          />
        </Marker>
      )
    })}
  </>
)

export default MarkerLayer
