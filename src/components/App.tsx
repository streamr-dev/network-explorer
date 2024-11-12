import { QueryClientProvider } from '@tanstack/react-query'
import 'mapbox-gl/dist/mapbox-gl.css'
import React from 'react'
import { MapProvider } from 'react-map-gl'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import styled, { css } from 'styled-components'
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
import { TabletMedia } from '../utils/styled'
import { Backdrop } from './Backdrop'
import { ErrorBoundary } from './ErrorBoundary'
import UnstyledLoadingIndicator from './LoadingIndicator'
import { Map } from './Map'
import { MapNavigationControl } from './MapNavigationControl'
import NetworkSelector from './NetworkSelector'
import { NodeTopologyList } from './NodeTopologyList'
import { PublisherDetector } from './PublisherDetector'
import { Sidebar } from './Sidebar'
import { StreamTopologyList } from './StreamTopologyList'
import StreamrClientProvider from './StreamrClientProvider'

const LoadingIndicator = styled(UnstyledLoadingIndicator)`
  position: fixed;
  top: 0;
  z-index: 4;
`

function Page() {
  const streamId = useStreamIdParam()

  const isLoadingNodes = useIsFetchingOperatorNodesForStream(streamId || undefined)

  const { showNetworkSelector, showSearch, compact } = useHud()

  return (
    <>
      <PublisherDetector />
      <Map />
      <MapAutoUpdater />
      <LoadingIndicator large loading={isLoadingNodes} />
      <ErrorBoundary>
        <Controls $compact={compact}>
          <NetworkSelectorWrap $alwaysGrow={!showSearch}>
            {showNetworkSelector && <NetworkSelector />}
          </NetworkSelectorWrap>
          <MapNavigationControl />
        </Controls>
        <Backdrop />
        <Sidebar />
      </ErrorBoundary>
    </>
  )
}

const NetworkSelectorWrap = styled.div<{ $alwaysGrow?: boolean }>`
  ${({ $alwaysGrow = false }) =>
    $alwaysGrow
      ? css`
          flex-grow: 1;
        `
      : css`
          &:empty {
            display: none;
          }
        `}

  @media ${TabletMedia} {
    flex-grow: 1;

    &:empty {
      display: block;
    }
  }
`

const Controls = styled.div<{ $compact?: boolean }>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  pointer-events: none;
  position: fixed;
  right: 0;
  top: 0;

  ${({ $compact }) =>
    $compact
      ? css`
          padding: max(12px, min(24px, 10vw));
        `
      : css`
          padding: max(12px, min(32px, 10vw));
        `}
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
        <StoreProvider>
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
        </StoreProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}
