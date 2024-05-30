import { QueryClientProvider } from '@tanstack/react-query'
import 'mapbox-gl/dist/mapbox-gl.css'
import React, { HTMLAttributes, useEffect, useRef, useState } from 'react'
import { MapProvider } from 'react-map-gl'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { StoreProvider, useStore } from '../Store'
import {
  useMap,
  useSelectedNodeLocationEffect,
  useSelectedPlaceLocationEffect,
  useStreamIdParam,
} from '../hooks'
import { ActiveView } from '../types'
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
import { SearchBox } from './SearchBox'
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

  const { showNetworkSelector, showSearch, showNodeList, compact } = useHud()

  return (
    <StoreProvider>
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
        {(showSearch || showNodeList) && (
          <SidebarContainer $compact={compact}>
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
      </ErrorBoundary>
    </StoreProvider>
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

const OutletWrap = styled.div`
  display: none;

  @media ${TabletMedia} {
    display: block;
  }
`

const SidebarContainer = styled.div<{ $compact?: boolean }>`
  box-sizing: border-box;
  height: 100vh;
  left: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100vw;

  ${({ $compact = false }) =>
    $compact
      ? css`
          padding-top: min(calc(40px + 20vw), 72px);
        `
      : css`
          padding-top: min(calc(40px + 20vw), 104px);
        `}

  @media ${TabletMedia} {
    overflow: auto;
    padding-top: 0;
  }
`

function Sidebar(props: HTMLAttributes<HTMLDivElement>) {
  const { activeView, setActiveView } = useStore()

  const sidebarRootRef = useRef<HTMLDivElement>(null)

  useEffect(function handleInteractionsOutsideSidebar() {
    function onMouseDown(e: MouseEvent) {
      const { current: sidebarRoot } = sidebarRootRef

      if (!sidebarRoot || !(e.target instanceof Element) || !sidebarRoot.contains(e.target)) {
        setActiveView(ActiveView.Map)
      }
    }

    window.addEventListener('mousedown', onMouseDown)

    return () => {
      window.removeEventListener('mousedown', onMouseDown)
    }
  }, [])

  const [animate, setAnimate] = useState(true)

  useEffect(function temporarilySuppressAnimationsOnResize() {
    /**
     * Disable animation during a resize to avoid lenghty transition
     * between mobile sidebar (drawer) and desktop sidebar.
     */

    let timeoutId: number | undefined

    let mounted = true

    function clearTimeout() {
      if (timeoutId != null) {
        window.clearTimeout(timeoutId)

        timeoutId = undefined
      }
    }

    function onWindowResize() {
      setAnimate(false)

      clearTimeout()

      timeoutId = window.setTimeout(() => {
        if (mounted) {
          setAnimate(true)
        }
      }, 1000)
    }

    window.addEventListener('resize', onWindowResize)

    return () => {
      mounted = false

      clearTimeout()

      window.removeEventListener('resize', onWindowResize)
    }
  }, [])

  const { compact } = useHud()

  return (
    <SidebarRoot
      {...props}
      ref={sidebarRootRef}
      $animate={animate}
      $expand={activeView === ActiveView.List}
      $compact={compact}
    />
  )
}

const SidebarRoot = styled.div<{ $expand?: boolean; $animate?: boolean; $compact?: boolean }>`
  box-sizing: border-box;
  max-height: 100%;
  pointer-events: auto;
  height: 100%;

  ${({ $animate = false }) =>
    $animate &&
    css`
      transition: 0.3s ease-in-out transform;
    `}

  ${({ $expand = false }) =>
    !$expand &&
    css`
      transform: translateY(100%) translateY(-168px);
    `}

  &:empty {
    display: none;
  }

  > * + * {
    margin-top: 16px;
  }

  @media ${TabletMedia} {
    box-sizing: content-box;
    transform: translateY(0);
    height: auto;
    width: min(460px, max(360px, 50vw));
  }

  ${({ $compact = false }) =>
    $compact
      ? css`
          @media ${TabletMedia} {
            padding: 16px;
          }
        `
      : css`
          @media ${TabletMedia} {
            padding: 32px;
          }
        `}
`

const Controls = styled.div<{ $compact?: boolean }>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100vh;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;

  ${({ $compact }) =>
    $compact
      ? css`
          padding: max(12px, min(16px, 10vw));
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
