import React, { useMemo } from 'react'
import { Source, Layer } from 'react-map-gl'
import { Node } from '../../utils/api/tracker'
import { Topology } from '../../contexts/Store'

type NodeConnection = {
  sourceId: string | number | undefined
  targetId: string | number | undefined
  source: [number, number]
  target: [number, number]
}

type UniqueConnection = Record<string, NodeConnection>

const getNodeConnections = (topology: Topology, nodes: Node[]): Array<NodeConnection> => {
  // Convert topology to a list of node connection pairs
  const nodeConnections = Object.keys(topology || {}).flatMap((key) => {
    const nodeList = topology[key]
    return nodeList.map((n) => [key, n])
  })

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
          source: [src.location.longitude, src.location.latitude] as [number, number],
          target: [target.location.longitude, target.location.latitude] as [number, number],
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
  nodes: Node[]
  visible?: boolean
}

const ConnectionLayer = ({ topology, nodes, visible }: Props) => {
  const geoJsonLines: GeoJSON.FeatureCollection<GeoJSON.Geometry> = useMemo(() => {
    const connections = getNodeConnections(topology, nodes)

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
  }, [topology, nodes])

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
