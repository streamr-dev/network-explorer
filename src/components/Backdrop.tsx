import React from 'react'
import styled from 'styled-components'
import { useStore } from '../Store'
import { ActiveView } from '../types'

export function Backdrop() {
  const { activeView } = useStore()

  return <BackdropRoot $active={activeView === ActiveView.List} />
}

const BackdropRoot = styled.div<{ $active?: boolean }>`
  position: absolute;
  background: rgba(0, 0, 0, ${({ $active = false }) => ($active ? '0.2' : '0')});
  transition: all 180ms ease-in-out;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`
