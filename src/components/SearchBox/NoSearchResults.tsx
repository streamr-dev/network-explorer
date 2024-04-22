import React from 'react'
import styled from 'styled-components'
import { MEDIUM } from '../../utils/styled'
import ControlBox from '../ControlBox'

export function NoSearchResults({ search = '' }) {
  return (
    <Container>
      No results found for <strong>{search}</strong>
    </Container>
  )
}

const Container = styled(ControlBox)`
  font-size: 12px;
  line-height: 56px;
  color: #aeaeae;
  padding: 0 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  strong {
    font-weight: ${MEDIUM};
  }
`
