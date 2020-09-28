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
      const { cluster: isCluster, point_count: pointCount, nodeId } = cluster.properties

      if (isCluster) {
        return (
          <Marker key={`cluster-${cluster.id}`} latitude={latitude} longitude={longitude}>
            <ClusterMarker
              size={pointCount}
              onClick={() => {
                if (
                  cluster.id == null ||
                  supercluster == null ||
                  typeof cluster.id !== 'number'
                ) {
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
