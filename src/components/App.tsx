import { QueryClientProvider } from '@tanstack/react-query'
import React, { useRef } from 'react'
import { MapRef } from 'react-map-gl'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import styled from 'styled-components'
import { Provider as ControllerProvider } from '../contexts/Controller'
import { Provider as PendingProvider } from '../contexts/Pending'
import { StoreProvider } from '../contexts/Store'
import { useIsFetchingNeighbors, useIsFetchingNodes } from '../utils'
import { getQueryClient } from '../utils/queries'
import Debug from './Debug'
import ErrorBoundary from './ErrorBoundary'
import Layout from './Layout'
import UnstyledLoadingIndicator from './LoadingIndicator'
import { Map } from './Map'
import NetworkSelector from './NetworkSelector'
import { SearchBox } from './SearchBox'
import Stream from './Stream'
import StreamrClientProvider from './StreamrClientProvider'
import { NodeTopologyList } from './NodeTopologyList'

const LoadingIndicator = styled(UnstyledLoadingIndicator)`
  position: fixed;
  top: 0;
  z-index: 4;
`

function Page() {
  const isLoadingNodes = useIsFetchingNodes()

  const isLoadingTopology = useIsFetchingNeighbors()

  const mapRef = useRef<MapRef>(null)

  return (
    <StoreProvider mapRef={mapRef}>
      <Map innerRef={mapRef} />
      <LoadingIndicator large loading={isLoadingNodes || isLoadingTopology} />
      <Layout>
        <ErrorBoundary>
          <Debug />
          <NetworkSelector />
          <SearchBox />
          <Outlet />
        </ErrorBoundary>
      </Layout>
    </StoreProvider>
  )
}

export function App() {
  return (
    <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
      <QueryClientProvider client={getQueryClient()}>
        <PendingProvider>
          <StreamrClientProvider>
            <ControllerProvider>
              <Routes>
                <Route element={<Page />}>
                  <Route path="/streams/:streamId/nodes/:nodeId" element={<Stream />} />
                  <Route path="/streams/:streamId" element={<Stream />} />
                  <Route path="/nodes/:nodeId" element={<NodeTopologyList />} />
                  <Route index element={<NodeTopologyList />} />
                </Route>
              </Routes>
            </ControllerProvider>
          </StreamrClientProvider>
        </PendingProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}
