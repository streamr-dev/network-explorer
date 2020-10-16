import React, { useEffect } from 'react'
import {
  BrowserRouter,
  Route,
  Switch,
} from 'react-router-dom'

import { ConnectedMap } from '../components/Map'
import SearchBox from '../components/SearchBox'
import Stream from '../components/Stream'
import Node from '../components/Node'
import Debug from '../components/Debug'
import LoadingIndicator from '../components/LoadingIndicator'
import Layout from '../components/Layout'
import ErrorBoundary from '../components/ErrorBoundary'

import { Provider as StoreProvider } from '../contexts/Store'
import { Provider as ControllerProvider, useController } from '../contexts/Controller'
import { Provider as Pendingrovider } from '../contexts/Pending'

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

const App = () => (
  <BrowserRouter>
    <Pendingrovider>
      <StoreProvider>
        <ControllerProvider>
          <ConnectedMap />
          <LoadingIndicator />
          <Layout>
            <ErrorBoundary>
              <TrackerLoader />
              <SearchBox />
              <Switch>
                <Route exact path="/streams/:streamId/nodes/:nodeId" component={Stream} />
                <Route exact path="/streams/:streamId" component={Stream} />
                <Route exact path="/nodes/:nodeId" component={Node} />
              </Switch>
              <Debug />
            </ErrorBoundary>
          </Layout>
        </ControllerProvider>
      </StoreProvider>
    </Pendingrovider>
  </BrowserRouter>
)

export default App
