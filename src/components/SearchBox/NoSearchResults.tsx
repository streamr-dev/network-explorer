import React from 'react'
import styled from 'styled-components/macro'

import ControlBox from '../ControlBox'
import { MEDIUM } from '../../utils/styled'

const Container = styled(ControlBox)`
  font-size: 12px;
  line-height: 56px;
  color: #AEAEAE;
  padding: 0 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  strong {
    font-weight: ${MEDIUM};
  }
`

type Props = {
  search: string
}

const UnstyledNoResults = ({ search }: Props) => (
  <Container>
    No results found for <strong>{search}</strong>
  </Container>
)

const NoResults = styled(UnstyledNoResults)`
`

export default NoResults
