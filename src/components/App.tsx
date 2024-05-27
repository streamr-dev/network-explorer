import { QueryClientProvider } from '@tanstack/react-query'
import 'mapbox-gl/dist/mapbox-gl.css'
import React from 'react'
import { MapProvider } from 'react-map-gl'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import styled from 'styled-components'
import { StoreProvider } from '../Store'
import {
  useMap,
  useSelectedNodeLocationEffect,
  useSelectedPlaceLocationEffect,
  useStreamIdParam,
} from '../hooks'
import { useIsFetchingOperatorNodesForStream } from '../utils/nodes'
import { getQueryClient } from '../utils/queries'
import { Backdrop } from './Backdrop'
import { ErrorBoundary } from './ErrorBoundary'
import UnstyledLoadingIndicator from './LoadingIndicator'
import { Map } from './Map'
import { MapNavigationControl } from './MapNavigationControl'
import NetworkSelector from './NetworkSelector'
import { NodeTopologyList } from './NodeTopologyList'
import { PublisherDetector } from './PublisherDetector'
import { SearchBox } from './SearchBox'
import { StreamTopologyList } from './StreamTopologyList'
import StreamrClientProvider from './StreamrClientProvider'

const LoadingIndicator = styled(UnstyledLoadingIndicator)`
  position: fixed;
  top: 0;
  z-index: 4;
`

function Page() {
  const streamId = useStreamIdParam()

  const isLoadingNodes = useIsFetchingOperatorNodesForStream(streamId || undefined)

  return (
    <StoreProvider>
      <PublisherDetector />
      <Map />
      <MapAutoUpdater />
      <LoadingIndicator large loading={isLoadingNodes} />
      <Backdrop />
      <ErrorBoundary>
        <NetworkSelector />
        <Sidebar>
          <SearchBox />
          <Outlet />
        </Sidebar>
        <Controls>
          <MapNavigationControl />
        </Controls>
      </ErrorBoundary>
    </StoreProvider>
  )
}

const Sidebar = styled.div`
  box-sizing: border-box;
  max-height: 100%;
  left: 0;
  padding: 32px;
  position: absolute;
  top: 0;
  width: 460px;

  > * + * {
    margin-top: 16px;
  }
`

const Controls = styled.div`
  bottom: 0;
  padding: 16px;
  position: absolute;
  right: 0;
`

function MapAutoUpdater() {
  const map = useMap()

  useSelectedNodeLocationEffect(([longitude, latitude]) => {
    if (!map || map.getBounds().contains([longitude, latitude])) {
      return
    }

    map.flyTo({ center: [longitude, latitude] })
  })

  useSelectedPlaceLocationEffect(({ longitude, latitude, zoom }) => {
    map?.flyTo({ center: [longitude, latitude], zoom })
  })

  return null
}

export function App() {
  return (
    <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
      <QueryClientProvider client={getQueryClient()}>
        <StreamrClientProvider>
          <MapProvider>
            <Routes>
              <Route element={<Page />}>
                <Route path="/streams/:streamId/nodes/:nodeId" element={<StreamTopologyList />} />
                <Route path="/streams/:streamId" element={<StreamTopologyList />} />
                <Route path="/nodes/:nodeId" element={<NodeTopologyList />} />
                <Route index element={<NodeTopologyList />} />
              </Route>
            </Routes>
          </MapProvider>
        </StreamrClientProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}
