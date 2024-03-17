import React, { ReactNode } from 'react'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import styled from 'styled-components'
import { Map } from './Map'
import { SearchBox } from './SearchBox'
import Stream from './Stream'
import { Network } from './Network'
import NetworkSelector from './NetworkSelector'
import Debug from './Debug'
import UnstyledLoadingIndicator from './LoadingIndicator'
import Layout from './Layout'
import ErrorBoundary from './ErrorBoundary'
import StreamrClientProvider from './StreamrClientProvider'
import { Provider as ControllerProvider } from '../contexts/Controller'
import { Provider as PendingProvider } from '../contexts/Pending'
import { QueryClientProvider } from '@tanstack/react-query'
import { getQueryClient } from '../utils/queries'
import { useIsFetchingNeighbors, useIsFetchingNodes } from '../utils'
import { ActiveContextProvider } from '../contexts/ActiveNode'

const LoadingIndicator = styled(UnstyledLoadingIndicator)`
  position: fixed;
  top: 0;
  z-index: 4;
`

function GlobalLoadingIndicator() {
  const isLoadingNodes = useIsFetchingNodes()

  const isLoadingTopology = useIsFetchingNeighbors()

  return <LoadingIndicator large loading={isLoadingNodes || isLoadingTopology} />
}

function MapWrapper() {
  return (
    <ActiveContextProvider>
      <Outlet />
    </ActiveContextProvider>
  )
}

export function App() {
  return (
    <Providers>
      <Routes>
        <Route element={<MapWrapper />}>
          <Route path="/nodes/:nodeId" element={<Map />} />
          <Route path="*" element={<Map />} />
        </Route>
      </Routes>
      <GlobalLoadingIndicator />
      <Layout>
        <ErrorBoundary>
          <Debug />
          <NetworkSelector />
          <SearchBox />
          <Routes>
            <Route path="/streams/:streamId/nodes/:nodeId" element={<Stream />} />
            <Route path="/streams/:streamId" element={<Stream />} />
            <Route path="/nodes/:nodeId" element={<Network />} />
            <Route index element={<Network />} />
          </Routes>
        </ErrorBoundary>
      </Layout>
    </Providers>
  )
}

function Providers({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
      <QueryClientProvider client={getQueryClient()}>
        <PendingProvider>
          <StreamrClientProvider>
            <ControllerProvider>{children}</ControllerProvider>
          </StreamrClientProvider>
        </PendingProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}
