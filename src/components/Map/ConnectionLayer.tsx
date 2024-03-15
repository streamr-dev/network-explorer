import React, { useMemo } from 'react'
import { Source, Layer } from 'react-map-gl'
import { Topology } from '../../contexts/Store'
import { OperatorNode } from '../../types'

type NodeConnection = {
  sourceId: string | number | undefined
  targetId: string | number | undefined
  source: [number, number]
  target: [number, number]
}

type UniqueConnection = Record<string, NodeConnection>

const getNodeConnections = (
  topology: Topology,
  nodes: OperatorNode[],
  activeNode: OperatorNode | undefined,
): Array<NodeConnection> => {
  // Convert topology to a list of node connection pairs
  const nodeConnections = Object.keys(topology || {})
    .flatMap((key) => {
      const nodeList = topology[key]
      return nodeList.map((n) => [key, n])
    })
    // Show only connections from active node if selected.
    // Otherwise shows all connections.
    .filter((nodeIds) => activeNode != null ?
      (nodeIds[0] === activeNode.id || nodeIds[1] === activeNode.id ) :
      true,
    )

  const uniqueConnections: UniqueConnection = {}
  for (let i = 0; i < nodeConnections.length; ++i) {
    const sourceId = nodeConnections[i][0]
    const targetId = nodeConnections[i][1]
    const uniqueId = [sourceId, targetId].sort().join()

    if (!uniqueConnections[uniqueId] && sourceId !== targetId) {
      const src = nodes.find(({ id }) => id === sourceId)
      const target = nodes.find(({ id }) => id === targetId)

      if (src && target) {
        uniqueConnections[uniqueId] = {
          source: [src.longitude, src.latitude] as [number, number],
          target: [target.longitude, target.latitude] as [number, number],
          sourceId,
          targetId,
        }
      }
    }
  }

  return Object.values(uniqueConnections)
}

type Props = {
  topology: Topology
  nodes: OperatorNode[]
  activeNode: OperatorNode | undefined
  visible?: boolean
}

const ConnectionLayer = ({
  topology,
  nodes,
  activeNode,
  visible,
}: Props) => {
  const geoJsonLines: GeoJSON.FeatureCollection<GeoJSON.Geometry> = useMemo(() => {
    const connections = getNodeConnections(topology, nodes, activeNode)

    return {
      type: 'FeatureCollection',
      features: connections.map(({ source, target }) => ({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [source, target],
        },
        properties: {},
      })),
    }
  }, [topology, nodes, activeNode])

  return (
    <Source id="node-connections-source" type="geojson" data={geoJsonLines}>
      <Layer
        id="node-connections-layer"
        type="line"
        paint={{
          'line-width': 1,
          'line-color': '#0324FF',
          'line-opacity': visible ? 0.5 : 0,
        }}
      />
    </Source>
  )
}

export default ConnectionLayer
