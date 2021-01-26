import React, { useEffect } from 'react'
import {
  BrowserRouter,
  Route,
  Switch,
} from 'react-router-dom'
import styled from 'styled-components'

import { ConnectedMap } from '../components/Map'
import SearchBox from '../components/SearchBox'
import Stream from '../components/Stream'
import Node from '../components/Node'
import Debug from '../components/Debug'
import UnstyledLoadingIndicator from '../components/LoadingIndicator'
import Layout from '../components/Layout'
import ErrorBoundary from '../components/ErrorBoundary'

import { Provider as StoreProvider } from '../contexts/Store'
import { Provider as ControllerProvider, useController } from '../contexts/Controller'
import { Provider as Pendingrovider, usePending } from '../contexts/Pending'

function useLoadTrackersEffect() {
  const { loadTrackers } = useController()

  useEffect(() => {
    loadTrackers()
  }, [loadTrackers])
}

const TrackerLoader = () => {
  useLoadTrackersEffect()
  return null
}

const LoadingIndicator = styled(UnstyledLoadingIndicator)`
  position: fixed;
  top: 0;
  z-index: 4;
`

const LoadingBar = () => {
  const { isPending: isLoadingTrackers } = usePending('trackers')
  const { isPending: isLoadingNodes } = usePending('nodes')
  const { isPending: isLoadingTopology } = usePending('topology')
  const { isPending: isSearching } = usePending('search')

  const isLoading = !!(isLoadingTrackers || isLoadingNodes || isLoadingTopology || isSearching)

  return (
    <LoadingIndicator large loading={isLoading} />
  )
}

const App = () => (
  <BrowserRouter basename={process.env.PUBLIC_URL}>
    <Pendingrovider>
      <StoreProvider>
        <ControllerProvider>
          <ConnectedMap />
          <LoadingBar />
          <Layout>
            <ErrorBoundary>
              <TrackerLoader />
              <Debug />
              <SearchBox />
              <Switch>
                <Route exact path="/streams/:streamId/nodes/:nodeId" component={Stream} />
                <Route exact path="/streams/:streamId" component={Stream} />
                <Route exact path="/nodes/:nodeId" component={Node} />
                <Route exact path="/" component={Node} />
              </Switch>
            </ErrorBoundary>
          </Layout>
        </ControllerProvider>
      </StoreProvider>
    </Pendingrovider>
  </BrowserRouter>
)

export default App
