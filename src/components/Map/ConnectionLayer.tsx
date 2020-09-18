import React from 'react'
import { SVGOverlay, HTMLRedrawOptions } from 'react-map-gl'
import styled from 'styled-components/macro'
import uniqBy from 'lodash/uniqBy'
import {
  SuperClusterType,
  ClusterPointFeature,
  ClusterConnection,
  NodeConnection,
} from './types'

const NodeConnectionPath = styled.path`
  color: #0324FF;
  stroke-dasharray: 5;
`

const getClusterConnections = (
  supercluster: SuperClusterType,
  clusters: Array<ClusterPointFeature>,
  nodeConnections: Array<string[]>,
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
        sourceId: src.id,
        targetId: target.id,
      }
      connections.push(conn)
    }
  })

  const uniqueConnections = uniqBy(connections, (v) => (
    [v.sourceId, v.targetId].sort().map((i) => i?.toString()).join()
  ))

  return uniqueConnections
}

const getNodesInCluster = (
  supercluster: SuperClusterType,
  cluster: ClusterPointFeature,
): Array<string> => {
  // Get all chilren recursively
  if (cluster.properties.cluster && typeof cluster.id === 'number') {
    const children = supercluster.getChildren(cluster.id)
    return children
      .flatMap((child) => getNodesInCluster(supercluster, child))
  }

  // This is a leaf node, return its id
  return [cluster.properties.nodeId]
}

type Props = {
  supercluster: SuperClusterType,
  clusters: Array<ClusterPointFeature>,
  nodeConnections: Array<NodeConnection>,
}

const ConnectionLayer = ({ supercluster, clusters, nodeConnections }: Props) => (
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
          <NodeConnectionPath
            key={`connection-${conn.sourceId}-${conn.targetId}`}
            d={`M ${ax} ${ay} L ${bx} ${by}`}
            fill="transparent"
            stroke="currentColor"
          />
        )
      })
    }}
  />
)

export default ConnectionLayer
