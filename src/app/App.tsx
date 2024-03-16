import React, { ReactNode } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import { ConnectedMap } from '../components/Map'
import { SearchBox } from '../components/SearchBox'
import Stream from '../components/Stream'
import Network from '../components/Network'
import NetworkSelector from '../components/NetworkSelector'
import Debug from '../components/Debug'
import UnstyledLoadingIndicator from '../components/LoadingIndicator'
import Layout from '../components/Layout'
import ErrorBoundary from '../components/ErrorBoundary'
import StreamrClientProvider from '../components/StreamrClientProvider'
import { Provider as ControllerProvider } from '../contexts/Controller'
import { Provider as PendingProvider } from '../contexts/Pending'
import { QueryClientProvider } from '@tanstack/react-query'
import { getQueryClient } from '../utils/queries'
import { useIsFetchingNeighbors, useIsFetchingNodes } from '../utils'

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

export function App() {
  return (
    <Providers>
      <ConnectedMap />
      <GlobalLoadingIndicator />
      <Layout>
        <ErrorBoundary>
          <Debug />
          <NetworkSelector />
          <SearchBox />
          <Switch>
            <Route exact path="/streams/:streamId/nodes/:nodeId" component={Stream} />
            <Route exact path="/streams/:streamId" component={Stream} />
            <Route exact path="/nodes/:nodeId" component={Network} />
            <Route exact path="/" component={Network} />
          </Switch>
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
