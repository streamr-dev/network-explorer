import React, { useMemo, useRef } from 'react'
import styled, { css } from 'styled-components/macro'
import { ActiveView } from '../contexts/Store'
import { SM } from '../utils/styled'
import { useStore } from '../hooks/useStore'
import ControlBox from './ControlBox'
import NodeList from './NodeList'

const Backdrop = styled.div`
  position: absolute;
  background: rgba(0, 0, 0, ${({ theme }) => (theme.activeView === 'list' ? '0.2' : '0')});
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
    max-height: calc(100% - 245px);
  }

  @media (min-width: ${SM}px) {
    top: 32px !important;
    left: 32px !important;

    div > ${ControlBox} + * {
      margin-top: 24px;
    }

    ${NodeList.Inner} {
      max-height: calc(100vh - 245px);
    }
  }

  @media (max-width: ${SM}px) {
    overflow: hidden;
    left: 0;
    width: 100%;
    bottom: 0;
    background: #fcfcfc;
    border-radius: 8px 8px 0 0;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.08);
    transition: all 300ms ease-in-out;

    div > ${ControlBox} + * {
      display: none;
    }

    ${ControlBox} {
      border: 1px solid #e7e7e7;
      box-shadow: none;
      border: 0;
      border-radius: 0;
    }

    ${ControlBox} + ${ControlBox} {
      border-top: 1px solid #efefef;
    }

    ${({ theme }) =>
      theme.activeView === ActiveView.List &&
      css`
        top: ${searchPadding}px;
        // bottom: 0;

        div > ${ControlBox} + * {
          display: block;
        }
      `}
  }
`

const LayoutComponentWrapper = styled.div`
  height: 100%;
  touch-action: none;
`

type Props = {
  children: React.ReactNode
}

const searchPadding = 70
const searchElementHeight = 164

const Layout = ({ children, ...props }: Props) => {
  const { activeView } = useStore()
  const ref = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)

  const currentTop = useMemo(() => {
    if (activeView === ActiveView.List) {
      return `${searchPadding}px`
    }

    return `calc(100% - ${searchElementHeight}px)`
  }, [activeView])

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
        }}
        ref={dragRef}
        style={{
          top: currentTop,
        }}
        {...props}
      >
        <LayoutComponentWrapper ref={ref}>{children}</LayoutComponentWrapper>
      </LayoutComponent>
    </>
  )
}

export default Layout
