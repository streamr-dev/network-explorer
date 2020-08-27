import React, { useState, useEffect } from 'react'
import ReactMapGL, { NavigationControl, ViewportProps } from 'react-map-gl'
import styled from 'styled-components/macro'

import useWindowSize from '../../hooks/useWindowSize'

const MAPBOX_TOKEN = 'pk.eyJ1IjoibWF0dGlubmVzIiwiYSI6ImNrNWhrN2FubDA0cGgzam1ycHV6Nmg2dHoifQ.HC5_Wu1R-OqRLza1u6P3Ig'

const NavigationContainer = styled.div`
  position: absolute;
  right: 32px;
  bottom: 32px;
`

const MapView = () => {
  const [viewport, setViewport] = useState({
    width: 400,
    height: 400,
    latitude: 60.16952,
    longitude: 24.93545,
    zoom: 10,
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
      onViewportChange={(v: ViewportProps) => setViewport(v)}
    >
      <NavigationContainer>
        <NavigationControl
          showCompass={false}
          onViewportChange={(v: ViewportProps) => setViewport(v)}
        />
      </NavigationContainer>
    </ReactMapGL>
  )
}

export default MapView
