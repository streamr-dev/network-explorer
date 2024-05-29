import { QueryClientProvider } from '@tanstack/react-query'
import 'mapbox-gl/dist/mapbox-gl.css'
import React from 'react'
import { MapProvider } from 'react-map-gl'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import styled from 'styled-components'
import { StoreProvider } from '../Store'
import {
  useMap,
  useSelectedNodeLocationEffect,
  useSelectedPlaceLocationEffect,
  useStreamIdParam,
} from '../hooks'
import { useAutoCenterNodeEffect, useHud } from '../utils'
import { useIsFetchingOperatorNodesForStream } from '../utils/nodes'
import { getQueryClient } from '../utils/queries'
import { Backdrop } from './Backdrop'
import { ErrorBoundary } from './ErrorBoundary'
import UnstyledLoadingIndicator from './LoadingIndicator'
import { Map } from './Map'
import { MapNavigationControl } from './MapNavigationControl'
import NetworkSelector from './NetworkSelector'
import { NodeTopologyList } from './NodeTopologyList'
import { PublisherDetector } from './PublisherDetector'
import { SearchBox } from './SearchBox'
import { StreamTopologyList } from './StreamTopologyList'
import StreamrClientProvider from './StreamrClientProvider'
import { TabletMedia } from '../utils/styled'

const LoadingIndicator = styled(UnstyledLoadingIndicator)`
  position: fixed;
  top: 0;
  z-index: 4;
`

function Page() {
  const streamId = useStreamIdParam()

  const isLoadingNodes = useIsFetchingOperatorNodesForStream(streamId || undefined)

  const { showNetworkSelector, showSearch, showNodeList } = useHud()

  return (
    <StoreProvider>
      <PublisherDetector />
      <Map />
      <MapAutoUpdater />
      <LoadingIndicator large loading={isLoadingNodes} />
      <Backdrop />
      <ErrorBoundary>
        {showNetworkSelector && <NetworkSelector />}
        {(showSearch || showNodeList) && (
          <SidebarContainer>
            <Sidebar>
              {showSearch && <SearchBox />}
              {showNodeList && (
                <OutletWrap>
                  <Outlet />
                </OutletWrap>
              )}
            </Sidebar>
          </SidebarContainer>
        )}
        <Controls>
          <MapNavigationControl />
        </Controls>
      </ErrorBoundary>
    </StoreProvider>
  )
}

const OutletWrap = styled.div`
  display: none;

  @media ${TabletMedia} {
    display: block;
  }
`

const SidebarContainer = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: auto;
  position: absolute;
  pointer-events: none;
  top: 0;
  left: 0;
`

const Sidebar = styled.div`
  box-sizing: border-box;
  max-height: 100%;
  pointer-events: auto;
  height: 100%;

  &:empty {
    display: none;
  }

  > * + * {
    margin-top: 16px;
  }

  @media ${TabletMedia} {
    height: auto;
    padding: 32px;
    width: min(460px, max(360px, 50vw));
  }
`

const Controls = styled.div`
  bottom: 0;
  padding: max(12px, min(32px, 10vw));
  position: absolute;
  right: 0;
`

function MapAutoUpdater() {
  const map = useMap()

  useSelectedNodeLocationEffect(([longitude, latitude]) => {
    if (!map || map.getBounds().contains([longitude, latitude])) {
      return
    }

    map.flyTo({ center: [longitude, latitude] })
  })

  useSelectedPlaceLocationEffect(({ longitude, latitude, zoom }) => {
    map?.flyTo({ center: [longitude, latitude], zoom })
  })

  useAutoCenterNodeEffect()

  return null
}

export function App() {
  return (
    <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
      <QueryClientProvider client={getQueryClient()}>
        <StreamrClientProvider>
          <MapProvider>
            <Routes>
              <Route element={<Page />}>
                <Route path="/streams/:streamId/nodes/:nodeId" element={<StreamTopologyList />} />
                <Route path="/streams/:streamId" element={<StreamTopologyList />} />
                <Route path="/nodes/:nodeId" element={<NodeTopologyList />} />
                <Route index element={<NodeTopologyList />} />
              </Route>
            </Routes>
          </MapProvider>
        </StreamrClientProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}
