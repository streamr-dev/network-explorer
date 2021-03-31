import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react'
import styled, { css } from 'styled-components/macro'
import useResizeObserver from 'use-resize-observer'

import { SM } from '../utils/styled'
import { useStore } from '../contexts/Store'
import useIsMounted from '../hooks/useIsMounted'

import ControlBox from './ControlBox'
import NodeList from './NodeList'

const Backdrop = styled.div`
  position: absolute;
  background: rgba(0, 0, 0, ${({ theme }) => theme.activeView === 'list' ? '0.2' : '0'});
  transition: all 180ms ease-in-out;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`

const LayoutComponent = styled.div`
  position: absolute;
  width: 375px;
  z-index: 2;

  ${NodeList.Inner} {
    overflow-y: scroll;
    max-height: calc(100vh - 245px);
  }

  @media (min-width: ${SM}px) {
    top: 32px !important;
    left: 32px !important;
    div > ${ControlBox} + * {
      margin-top: 24px;
    }
  }

  @media (max-width: ${SM}px) {
    overflow: hidden;
    left: 0;
    width: 100%;
    bottom: 0;
    background: #FCFCFC;
    border-radius: 8px 8px 0 0;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.08);
    transition: all 300ms ease-in-out;

    div > ${ControlBox} + * {
      display: none;
    }

    ${ControlBox} {
      border: 1px solid #E7E7E7;
      box-shadow: none;
      border: 0;
      border-radius: 0;
    }

    ${ControlBox} + ${ControlBox} {
      border-top: 1px solid #EFEFEF;
    }

    ${({ theme }) => theme.activeView === 'list' && css`
      top: 40px;

      div > ${ControlBox} + * {
        display: block;
      }
    `}
  }
`

type Props = {
  children: React.ReactNode
}

const defaultTop = -170

const Layout = ({ children, ...props }: Props) => {
  const { activeView, searchResults } = useStore()
  const [top, setTopState] = useState<number>(defaultTop)
  const ref = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const { height } = useResizeObserver({ ref })

  const isMounted = useIsMounted()

  const setTop = useCallback((y: number) => {
    if (isMounted()) {
      setTopState(-Math.max(y, 170))
    }
  }, [isMounted])

  const onTouchStart = (startEvent: React.TouchEvent) => {
    const { current: el } = dragRef
    if (!el) { return }
    const currentTop = el.offsetHeight

    const y0 = startEvent.touches[0].clientY

    const onMove = (moveEvent: TouchEvent) => {
      setTop(currentTop + (y0 - moveEvent.touches[0].clientY))
    }

    const onUp = () => {
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }

    window.addEventListener('touchmove', onMove)
    window.addEventListener('touchend', onUp)
  }

  useEffect(() => {
    setTop(height || 0)
  }, [height, setTop])

  const currentTop = useMemo(() => {
    if (activeView === 'list') {
      return '40px'
    }

    return top > 0 ? `${top}px` : `calc(100vh - min(100vh - 40px, ${-top}px))`
  }, [activeView, top])

  return (
    <>
      <Backdrop
        theme={{
          activeView,
        }}
      />
      <LayoutComponent
        theme={{
          activeView,
          top,
          hasResults: !!(searchResults && searchResults.length),
        }}
        ref={dragRef}
        onTouchStart={onTouchStart}
        style={{
          top: currentTop,
        }}
        {...props}
      >
        <div ref={ref}>
          {children}
        </div>
      </LayoutComponent>
    </>
  )
}

export default Layout
