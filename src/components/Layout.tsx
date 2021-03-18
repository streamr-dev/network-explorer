import React, { useState, useEffect } from 'react'
import styled, { css } from 'styled-components/macro'

import { SM } from '../utils/styled'
import { useStore } from '../contexts/Store'

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
  top: 32px;
  left: 32px;
  width: 375px;
  z-index: 2;

  ${NodeList.Inner} {
    overflow-y: scroll;
    max-height: calc(100vh - 245px);
  }

  @media (min-width: ${SM}px) {
    > ${ControlBox} + * {
      margin-top: 24px;
    }
  }

  @media (max-width: ${SM}px) {
    overflow: hidden;
    top: ${({ theme }) => theme.top};
    left: 0;
    bottom: 0;
    width: 100%;
    background: #FCFCFC;
    border-radius: 8px 8px 0 0;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.08);
    transition: all 300ms ease-in-out;

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
    `}
  }
`

type Props = {
  children: React.ReactNode
}

const defaultTop = 'calc(100vh - 170px)'

const Layout = ({ children, ...props }: Props) => {
  const { activeView, searchResults } = useStore()
  const [top, setTop] = useState<string>(defaultTop)

  useEffect(() => {
    setTop(activeView === 'list' ? '40px' : defaultTop)
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
          top,
          hasResults: !!(searchResults && searchResults.length),
        }}
        {...props}
      >
        {children}
      </LayoutComponent>
    </>
  )
}

export default Layout
