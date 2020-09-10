import React from 'react'
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

import { Provider as MapStateProvider } from '../contexts/MapState'
import { Provider as LoadingProvider } from '../contexts/Loading'

const App = () => (
  <BrowserRouter>
    <LoadingProvider>
      <MapStateProvider>
        <Switch>
          <Route exact path="/streams/:id" component={Stream} />
          <Route exact path="/nodes/:id" component={Node} />
        </Switch>
        <LoadingIndicator />
        <Map />
        <SearchBox />
        <Debug />
      </MapStateProvider>
    </LoadingProvider>
  </BrowserRouter>
)

export default App
