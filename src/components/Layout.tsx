import React from 'react'
import styled, { css } from 'styled-components/macro'

import { SM } from '../utils/styled'
import { useStore, ActiveView } from '../contexts/Store'

import ControlBox from './ControlBox'
import MobileViewChanger from './MobileViewChanger'

const LayoutComponent = styled.div`
  position: absolute;
  top: 32px;
  left: 32px;
  width: 375px;
  z-index: 2;

  @media (min-width: ${SM}px) {
    > ${ControlBox} + * {
      margin-top: 24px;
    }
  }

  @media (max-width: ${SM}px) {
    ${({ theme }) => theme === 'map' && css`
      top: 16px;
      left: 16px;
      width: calc(100% - 32px);

      ${ControlBox}:last-child {
        display: none;
      }
    `}

    ${({ theme }) => theme === 'list' && css`
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      background: #FCFCFC;

      ${ControlBox} {
        border-radius: 0;
        box-shadow: none;
      }
    `}
  }
`

type Props = {
  children: React.ReactNode
}

const Layout = ({ children, ...props }: Props) => {
  const { activeView } = useStore()

  return (
    <LayoutComponent
      theme={activeView === ActiveView.Map ? 'map' : 'list'}
      {...props}
    >
      {children}
      <MobileViewChanger />
    </LayoutComponent>
  )
}

export default Layout
