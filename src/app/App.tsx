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
import { Provider as NodesProvider, useNodes } from '../contexts/Nodes'
import { Provider as StreamProvider } from '../contexts/Stream'
import { Provider as TopologyProvider } from '../contexts/Topology'
import { Provider as Pendingrovider } from '../contexts/Pending'

function useLoadTrackersEffect() {
  const { loadTrackers } = useNodes()

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
        <NodesProvider>
          <StreamProvider>
            <TopologyProvider>
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
            </TopologyProvider>
          </StreamProvider>
        </NodesProvider>
      </StoreProvider>
    </Pendingrovider>
  </BrowserRouter>
)

export default App
