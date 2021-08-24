import React, { useEffect } from 'react'
import {
  BrowserRouter, Route, Switch, useLocation,
} from 'react-router-dom'
import styled from 'styled-components'

import { ConnectedMap } from '../components/Map'
import SearchBox from '../components/SearchBox'
import Stream from '../components/Stream'
import Network from '../components/Network'
import NetworkSelector from '../components/NetworkSelector'
import Debug from '../components/Debug'
import UnstyledLoadingIndicator from '../components/LoadingIndicator'
import Layout from '../components/Layout'
import ErrorBoundary from '../components/ErrorBoundary'
import StreamrClientProvider from '../components/StreamrClientProvider'

import { Provider as StoreProvider, useStore } from '../contexts/Store'
import { Provider as ControllerProvider } from '../contexts/Controller'
import { Provider as Pendingrovider, usePending } from '../contexts/Pending'

function useResetSearchTextEffect() {
  const { updateSearch: updateSearchText, resetSearchResults } = useStore()
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname === '/') {
      updateSearchText('')
      resetSearchResults()
    }
  }, [updateSearchText, resetSearchResults, pathname])
}

const SearchTextResetter = () => {
  useResetSearchTextEffect()
  return null
}

const LoadingIndicator = styled(UnstyledLoadingIndicator)`
  position: fixed;
  top: 0;
  z-index: 4;
`

const LoadingBar = () => {
  const { isPending: isLoadingNodes } = usePending('nodes')
  const { isPending: isLoadingTopology } = usePending('topology')
  const { isPending: isSearching } = usePending('search')

  const isLoading = !!(isLoadingNodes || isLoadingTopology || isSearching)

  return <LoadingIndicator large loading={isLoading} />
}

const App = () => (
  <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
    <Pendingrovider>
      <StoreProvider>
        <ControllerProvider>
          <StreamrClientProvider>
            <ConnectedMap />
            <LoadingBar />
            <Layout>
              <ErrorBoundary>
                <SearchTextResetter />
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
          </StreamrClientProvider>
        </ControllerProvider>
      </StoreProvider>
    </Pendingrovider>
  </BrowserRouter>
)

export default App
