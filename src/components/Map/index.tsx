import React, { useState, useEffect, useRef } from 'react'
import ReactMapGL, {
  NavigationControl,
  InteractiveMap,
} from 'react-map-gl'
import styled from 'styled-components/macro'
import useSupercluster from 'use-supercluster'
import { PointFeature } from 'supercluster'
import 'mapbox-gl/dist/mapbox-gl.css'

import { NodeProperties, NodeConnection } from './types'
import ConnectionLayer from './ConnectionLayer'
import MarkerLayer from './MarkerLayer'

import useWindowSize from '../../hooks/useWindowSize'
import { useMapState } from '../../contexts/MapState'

const MAPBOX_TOKEN = 'pk.eyJ1IjoibWF0dGlubmVzIiwiYSI6ImNrNWhrN2FubDA0cGgzam1ycHV6Nmg2dHoifQ.HC5_Wu1R-OqRLza1u6P3Ig'

const NavigationContainer = styled.div`
  position: absolute;
  right: 32px;
  bottom: 32px;
`

const Map = () => {
  const mapRef = useRef<InteractiveMap>(null)
  const { nodes, viewport, setViewport } = useMapState()

  const [nodeConnections] = useState<Array<NodeConnection>>([[1, 2], [1, 3], [4, 5]])

  const points: Array<PointFeature<NodeProperties>> = nodes.map((node) => ({
    type: 'Feature',
    properties: {
      nodeId: node.id,
      cluster: false,
      point_count: 1,
      point_count_abbreviated: '1',
    },
    geometry: {
      type: 'Point',
      coordinates: [node.longitude, node.latitude],
    },
  }))
  let bounds = mapRef.current?.getMap().getBounds().toArray().flat() as [
    number,
    number,
    number,
    number
  ]
  const safeMargin = 0.1
  // Add a bit of safe margin to bounds so that supercluster will not filter
  // markers on the edges of viewport so aggressively.
  if (bounds != null) {
    bounds = [
      bounds[0] - safeMargin,
      bounds[1] - safeMargin,
      bounds[2] + safeMargin,
      bounds[3] + safeMargin,
    ]
  }
  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom: viewport.zoom,
    options: {
      radius: 40,
      maxZoom: viewport.maxZoom,
    },
  })

  const windowSize = useWindowSize()
  useEffect(() => {
    setViewport((prev) => ({
      ...prev,
      width: windowSize.width ?? prev.width,
      height: windowSize.height ?? prev.height,
    }))
  }, [setViewport, windowSize.width, windowSize.height])

  return (
    <ReactMapGL
      {...viewport}
      mapboxApiAccessToken={MAPBOX_TOKEN}
      mapStyle='mapbox://styles/mattinnes/ckdtszq5m0iht19qk0zuz52oy'
      onViewportChange={setViewport}
      ref={mapRef}
    >
      {supercluster != null && (
        <>
          <ConnectionLayer
            supercluster={supercluster}
            clusters={clusters}
            nodeConnections={nodeConnections}
          />
          <MarkerLayer
            supercluster={supercluster}
            clusters={clusters}
            viewport={viewport}
            setViewport={setViewport}
          />
        </>
      )}
      <NavigationContainer>
        <NavigationControl
          showCompass={false}
          onViewportChange={setViewport}
        />
      </NavigationContainer>
    </ReactMapGL>
  )
}

export default Map
