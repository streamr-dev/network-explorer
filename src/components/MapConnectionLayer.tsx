import React, { useMemo } from 'react'
import { Layer, Source } from 'react-map-gl'
import { useNodeConnections } from '../utils'
import { useStore } from '../Store'
import { ConnectionsMode } from '../types'

export function MapConnectionLayer() {
  const connections = useNodeConnections()

  const { connectionsMode } = useStore()

  const visible = connectionsMode === ConnectionsMode.Always

  const lineData = useMemo(
    function getFeatureConnection(): GeoJSON.FeatureCollection {
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
    },
    [connections],
  )

  return (
    <Source id="node-connections-source" type="geojson" data={lineData}>
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
