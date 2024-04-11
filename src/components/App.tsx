import { QueryClientProvider } from '@tanstack/react-query'
import React, { useRef } from 'react'
import { MapRef } from 'react-map-gl'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import styled from 'styled-components'
import { StoreProvider } from '../Store'
import { useStreamIdParam } from '../hooks'
import { useIsFetchingOperatorNodesForStream } from '../utils/nodes'
import { getQueryClient } from '../utils/queries'
import { ErrorBoundary } from './ErrorBoundary'
import Layout from './Layout'
import UnstyledLoadingIndicator from './LoadingIndicator'
import { Map } from './Map'
import NetworkSelector from './NetworkSelector'
import { NodeTopologyList } from './NodeTopologyList'
import { SearchBox } from './SearchBox'
import { StreamTopologyList } from './StreamTopologyList'
import StreamrClientProvider from './StreamrClientProvider'
import { PublisherDetector } from './PublisherDetector'

const LoadingIndicator = styled(UnstyledLoadingIndicator)`
  position: fixed;
  top: 0;
  z-index: 4;
`

function Page() {
  const streamId = useStreamIdParam()

  const isLoadingNodes = useIsFetchingOperatorNodesForStream(streamId || undefined)

  const mapRef = useRef<MapRef>(null)

  return (
    <StoreProvider mapRef={mapRef}>
      <PublisherDetector />
      <Map innerRef={mapRef} />
      <LoadingIndicator large loading={isLoadingNodes} />
      <Layout>
        <ErrorBoundary>
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
        <StreamrClientProvider>
          <Routes>
            <Route element={<Page />}>
              <Route path="/streams/:streamId/nodes/:nodeId" element={<StreamTopologyList />} />
              <Route path="/streams/:streamId" element={<StreamTopologyList />} />
              <Route path="/nodes/:nodeId" element={<NodeTopologyList />} />
              <Route index element={<NodeTopologyList />} />
            </Route>
          </Routes>
        </StreamrClientProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}
