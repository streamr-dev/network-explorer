import React, { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { useStore } from '../Store'
import { ActiveView } from '../types'
import { useHud } from '../utils'
import { SANS, TabletMedia } from '../utils/styled'
import {
  ControlBoxBorderRadius,
  ControlBoxShadow,
  DefaultControlBoxBackgroundColor,
} from './ControlBox'
import { SearchBox } from './SearchBox'

export function Sidebar() {
  const { activeView, setActiveView } = useStore()

  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(
    function handleInteractionsOutsideSidebar() {
      function onMouseDown(e: MouseEvent) {
        const { current: sidebarRoot } = sidebarRef

        if (!sidebarRoot || !(e.target instanceof Element) || !sidebarRoot.contains(e.target)) {
          setActiveView(ActiveView.Map)
        }
      }

      window.addEventListener('mousedown', onMouseDown)

      return () => {
        window.removeEventListener('mousedown', onMouseDown)
      }
    },
    [setActiveView],
  )

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

  const { showSearch, showNodeList, compact } = useHud()

  if (!showSearch && !showNodeList) {
    return null
  }

  return (
    <SidebarRoot $animate={animate} $expand={activeView === ActiveView.List} $compact={compact}>
      <SidebarOuter>
        <SidebarInner ref={sidebarRef}>
          {showSearch && <SearchBox />}
          {showNodeList && (
            <OutletWrap>
              <Outlet />
            </OutletWrap>
          )}
        </SidebarInner>
      </SidebarOuter>
    </SidebarRoot>
  )
}

const OutletWrap = styled.div`
  background: ${DefaultControlBoxBackgroundColor};
  box-shadow: ${ControlBoxShadow};
  border-radius: ${ControlBoxBorderRadius}px;
  font-family: ${SANS};
  display: none;

  @media ${TabletMedia} {
    display: block;
    overflow: hidden;
  }
`

const SidebarOuter = styled.div`
  height: 100%;
  width: 100%;
`

const SidebarInner = styled.div`
  height: 100%;
  width: 100%;

  @media ${TabletMedia} {
    display: flex;
    gap: 16px;
    flex-direction: column;
  }
`

const SidebarRoot = styled.div<{ $expand?: boolean; $animate?: boolean; $compact?: boolean }>`
  box-sizing: border-box;
  height: 100%;
  left: 0;
  overflow: hidden;
  pointer-events: none;
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 100001;

  ${SidebarOuter} {
    height: 100%;
    width: 100%;
  }

  ${({ $compact = false }) =>
    $compact
      ? css`
          padding-top: min(calc(40px + 20vw), 88px);

          @media ${TabletMedia} {
            padding: 24px;
          }
        `
      : css`
          padding-top: min(calc(40px + 20vw), 104px);

          @media ${TabletMedia} {
            padding: 32px;
          }
        `}

  ${({ $expand = false }) =>
    !$expand &&
    css`
      ${SidebarOuter} {
        transform: translateY(100%) translateY(-168px);
      }
    `}

${({ $animate = false }) =>
    $animate &&
    css`
      ${SidebarOuter} {
        transition: 0.3s ease-in-out transform;
      }
    `}

  @media ${TabletMedia} {
    width: min(460px, max(400px, 50vw));

    ${SidebarOuter} {
      transform: translateY(0);
    }
  }
`
