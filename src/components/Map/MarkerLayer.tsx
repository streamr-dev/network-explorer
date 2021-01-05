import React from 'react'
import { Marker, ViewportProps, FlyToInterpolator } from 'react-map-gl'
import { SuperClusterType, ClusterPointFeature } from './types'
import { NodeMarker, ClusterMarker } from './Markers'

type Props = {
  supercluster: SuperClusterType,
  clusters: Array<ClusterPointFeature>,
  viewport: ViewportProps,
  setViewport: (v: ViewportProps) => void,
  activeNode?: string,
  onNodeClick?: (v: string) => void,
}

const arePointsOverlapped = (a: ClusterPointFeature, b: ClusterPointFeature) => {
  return a.geometry.coordinates.every((coord, index) => coord === b.geometry.coordinates[index])
}

const getCirclePositions = (center: [number, number], count: number) => {
  const circleFootSeparation = 0.00003
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
  viewport,
  setViewport,
  activeNode,
  onNodeClick,
}: Props) => (
  <>
    {clusters.map((cluster) => {
      const [longitude, latitude] = cluster.geometry.coordinates
      const {
        cluster: isCluster,
        point_count: pointCount,
        nodeId,
      } = cluster.properties

      if (isCluster) {
        if (cluster.id == null ||
          supercluster == null ||
          typeof cluster.id !== 'number'
        ) {
          return null
        }

        // Check if we have overlapping markers
        if (cluster.id && cluster) {
          const child = supercluster.getChildren(cluster.id)

          if (child.length > 1 && child.every((c) => arePointsOverlapped(c, child[0]))) {
            const circle = getCirclePositions(
              cluster.geometry.coordinates as [number, number],
              child.length,
            )

            return child.map((point, index) => {
              const id = point.properties.nodeId
              const lat = circle[index].latitude
              const lng = circle[index].longitude

              return (
                <Marker key={`expanded-cluster-${id}`} latitude={lat} longitude={lng}>
                  <NodeMarker
                    id={id}
                    isActive={activeNode === id}
                    onClick={() => onNodeClick && onNodeClick(id)}
                  />
                </Marker>
              )
            })
          }
        }

        return (
          <Marker key={`cluster-${cluster.id}`} latitude={latitude} longitude={longitude}>
            <ClusterMarker
              size={pointCount}
              onClick={() => {
                if (typeof cluster.id !== 'number') {
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
