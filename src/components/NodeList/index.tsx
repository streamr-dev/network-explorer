import React from 'react'
import styled from 'styled-components/macro'

import ControlBox from '../ControlBox'

import NodeListItem from './NodeListItem'
import { SANS, MEDIUM } from '../../utils/styled'

const Inner = styled.div`
  padding: 16px;
  font-size: 12px;
`

type Props = {
  children?: React.ReactNode
}

const Header = styled.div`
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

const NodeList = ({ children }: Props) => (
  <ControlBox>
    <Inner>{children}</Inner>
  </ControlBox>
)

export default Object.assign(NodeList, {
  Inner,
  Header,
  Node: NodeListItem,
})
