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

import { Provider as NodesProvider, useNodes } from '../contexts/Nodes'
import { Provider as LoadingProvider } from '../contexts/Loading'

function useProductLoadEffect() {
  const { loadNodes } = useNodes()

  useEffect(() => {
    loadNodes()
  }, [loadNodes])
}

const LoadTrackersEffect = () => {
  useProductLoadEffect()
  return null
}

const App = () => (
  <BrowserRouter>
    <LoadingProvider>
      <NodesProvider>
        <LoadTrackersEffect />
        <Switch>
          <Route exact path="/streams/:id" component={Stream} />
          <Route exact path="/nodes/:id" component={Node} />
        </Switch>
        <LoadingIndicator />
        <Map />
        <SearchBox />
        <Debug />
      </NodesProvider>
    </LoadingProvider>
  </BrowserRouter>
)

export default App
