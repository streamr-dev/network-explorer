import React, { useEffect } from 'react'
import {
  BrowserRouter,
  Route,
  Switch,
} from 'react-router-dom'

import Map from '../components/Map'
import SearchBox from '../components/SearchBox'
import Stream from '../components/Stream'
import Node from '../components/Node'
import Debug from '../components/Debug'
import LoadingIndicator from '../components/LoadingIndicator'
import Layout from '../components/Layout'

import { Provider as NodesProvider, useNodes } from '../contexts/Nodes'
import { Provider as Pendingrovider } from '../contexts/Pending'

function useProductLoadEffect() {
  const { updateTrackers } = useNodes()

  useEffect(() => {
    updateTrackers()
  }, [updateTrackers])
}

const LoadTrackersEffect = () => {
  useProductLoadEffect()
  return null
}

const App = () => (
  <BrowserRouter>
    <Pendingrovider>
      <NodesProvider>
        <LoadTrackersEffect />
        <Map />
        <LoadingIndicator />
        <Layout>
          <SearchBox />
          <Switch>
            <Route exact path="/streams/:id" component={Stream} />
            <Route exact path="/nodes/:id" component={Node} />
          </Switch>
          <Debug />
        </Layout>
      </NodesProvider>
    </Pendingrovider>
  </BrowserRouter>
)

export default App
