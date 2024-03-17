import React, { useMemo } from 'react'
import { Source, Layer } from 'react-map-gl'
import { OperatorNode } from '../../types'

type MarkerLayerProps = {
  nodes: OperatorNode[]
  sourceId: string
  layerId: string
}

export function MarkerLayer({ nodes, sourceId, layerId }: MarkerLayerProps) {
  const geoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: nodes.map(({ geoFeature }) => geoFeature),
    }
  }, [nodes])

  // promoteId for Source is needed so that we can use string ids for Features.
  // We need Feature ids for using feature states to control styling dynamically.
  return (
    <Source id={sourceId} type="geojson" data={geoJson} promoteId="id">
      <Layer
        id={layerId}
        type="circle"
        paint={{
          'circle-radius': ['case', ['boolean', ['feature-state', 'hover'], false], 6, 4],
          'circle-color': [
            'case',
            ['boolean', ['feature-state', 'active'], false],
            '#ffffff',
            '#0324ff',
          ],
          'circle-stroke-color': '#0324ff',
          'circle-stroke-width': ['case', ['boolean', ['feature-state', 'active'], false], 8, 0],
        }}
      />
    </Source>
  )
}
