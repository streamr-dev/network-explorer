import React, { useState, useEffect, useRef } from 'react'
import ReactMapGL, {
  NavigationControl,
  ViewportProps,
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

const MAPBOX_TOKEN = 'pk.eyJ1IjoibWF0dGlubmVzIiwiYSI6ImNrNWhrN2FubDA0cGgzam1ycHV6Nmg2dHoifQ.HC5_Wu1R-OqRLza1u6P3Ig'

const NavigationContainer = styled.div`
  position: absolute;
  right: 32px;
  bottom: 32px;
`

const Map = () => {
  const mapRef = useRef<InteractiveMap>(null)

  const [viewport, setViewport] = useState<ViewportProps>({
    width: 400,
    height: 400,
    latitude: 60.16952,
    longitude: 24.93545,
    zoom: 10,
    bearing: 0,
    pitch: 0,
    altitude: 0,
    maxZoom: 20,
    minZoom: 0,
    maxPitch: 60,
    minPitch: 0,
  })

  const [nodeLocations] = useState([
    {
      id: 1,
      latitude: 60.15952,
      longitude: 24.93545,
    },
    {
      id: 2,
      latitude: 60.15852,
      longitude: 24.94545,
    },
    {
      id: 3,
      latitude: 60.18952,
      longitude: 24.91545,
    },
    {
      id: 4,
      latitude: 60.19952,
      longitude: 24.92545,
    },
    {
      id: 5,
      latitude: 60.17952,
      longitude: 24.92545,
    },
  ])

  const [nodeConnections] = useState<Array<NodeConnection>>([[1, 2], [1, 3], [4, 5]])

  const points: Array<PointFeature<NodeProperties>> = nodeLocations.map((node) => ({
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
  }, [windowSize.width, windowSize.height])

  return (
    <ReactMapGL
      {...viewport}
      mapboxApiAccessToken={MAPBOX_TOKEN}
      mapStyle='mapbox://styles/mattinnes/ckdtszq5m0iht19qk0zuz52oy'
      onViewportChange={(v: ViewportProps) => setViewport({ ...v })}
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
          onViewportChange={(v: ViewportProps) => setViewport({ ...v })}
        />
      </NavigationContainer>
    </ReactMapGL>
  )
}

export default Map
