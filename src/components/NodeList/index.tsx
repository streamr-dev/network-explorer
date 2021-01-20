import React from 'react'
import styled from 'styled-components/macro'

import ControlBox from '../ControlBox'

import NodeListItem from './NodeListItem'
import { SANS, MEDIUM } from '../../utils/styled'

const Wrapper = styled.div`
  padding: 16px;
  font-size: 12px;
`

type Props = {
  children?: React.ReactNode,
}

const Header = styled.div`
  font-family: ${SANS};
  color: #A3A3A3;
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
    <Wrapper>
      {children}
    </Wrapper>
  </ControlBox>
)

export default Object.assign(NodeList, {
  Header,
  Node: NodeListItem,
})
