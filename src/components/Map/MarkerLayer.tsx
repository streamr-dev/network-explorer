import React, { useMemo } from 'react'
import { Layer, Source } from 'react-map-gl'
import { useNodesQuery } from '../../utils'
import { NodeLayerId, NodeSourceId, getNodeLocationId } from '../../utils/map'
import { OperatorNode } from '../../types'

const EmptyNodes: OperatorNode[] = []

export function MarkerLayer() {
  const nodesQuery = useNodesQuery({})

  const nodes = nodesQuery.data || EmptyNodes

  const geoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = useMemo(() => {
    const features: GeoJSON.Feature<
      GeoJSON.Point,
      { id: string; title: string; locationId: string }
    >[] = []

    const uniquenessGate: Record<string, true> = {}

    for (const { location, id, title } of nodes) {
      const locationId = getNodeLocationId(location)

      if (uniquenessGate[locationId]) {
        continue
      }

      uniquenessGate[locationId] = true

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
        },
        properties: {
          id,
          title,
          locationId,
        },
      })
    }

    return {
      type: 'FeatureCollection',
      features,
    }
  }, [nodes])

  // promoteId for Source is needed so that we can use string ids for Features.
  // We need Feature ids for using feature states to control styling dynamically.
  return (
    <Source id={NodeSourceId} type="geojson" data={geoJson} promoteId="locationId">
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
