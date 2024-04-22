import React, { ReactNode, RefObject } from 'react'
import styled from 'styled-components'
import ControlBox from '../ControlBox'
import Pager from './Pager'
import { SANS, MEDIUM } from '../../utils/styled'

export const NodeListInner = styled.div`
  padding: 16px;
  font-size: 12px;

  > * + ${Pager},
  > ${Pager} + * {
    margin-top: 12px;
    scroll-margin-top: 12px;
  }
`

export const NodeListHeader = styled.div`
  font-family: ${SANS};
  color: #a3a3a3;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  & + * {
    margin-top: 16px;
  }

  strong {
    font-weight: ${MEDIUM};
  }
`

interface NodeListProps{
  children?: ReactNode
  innerRef?: RefObject<HTMLDivElement>
}

export function NodeList({ innerRef, children }: NodeListProps) {
  return <ControlBox ref={innerRef}>
    <NodeListInner>{children}</NodeListInner>
  </ControlBox>
}
