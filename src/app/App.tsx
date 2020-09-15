import React from 'react'
import {
  BrowserRouter,
  Route,
  Switch,
} from 'react-router-dom'

import Map from '../components/Map'
import Stream from '../components/Stream'
import Node from '../components/Node'
import Debug from '../components/Debug'

import { Provider as MapStateProvider } from '../contexts/MapState'

const App = () => (
  <BrowserRouter>
    <MapStateProvider>
      <Switch>
        <Route exact path="/streams/:id" component={Stream} />
        <Route exact path="/nodes/:id" component={Node} />
      </Switch>
      <Map />
      <Debug />
    </MapStateProvider>
  </BrowserRouter>
)

export default App
