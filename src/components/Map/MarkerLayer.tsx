import React, { useMemo } from 'react'
import { Layer, Source } from 'react-map-gl'
import { useNodesQuery } from '../../utils'
import { NodeLayerId, NodeSourceId } from '../../utils/map'

export function MarkerLayer() {
  const nodesQuery = useNodesQuery({})

  const nodes = nodesQuery.data || []

  const geoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: nodes.map(({ geoFeature }) => geoFeature),
    }
  }, [nodes])

  // promoteId for Source is needed so that we can use string ids for Features.
  // We need Feature ids for using feature states to control styling dynamically.
  return (
    <Source id={NodeSourceId} type="geojson" data={geoJson} promoteId="id">
      <Layer
        id={NodeLayerId}
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
