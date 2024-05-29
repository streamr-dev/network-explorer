import React from 'react'
import styled from 'styled-components'
import { MEDIUM } from '../../utils/styled'

export function NoSearchResults({ search = '' }) {
  return (
    <NoSearchResultsRoot>
      No results found for <strong>{search}</strong>
    </NoSearchResultsRoot>
  )
}

const NoSearchResultsRoot = styled.div`
  background: #ffffff;
  border-top: 1px solid #efefef;
  border-radius: 0 0 4px 4px;
  color: #aeaeae;
  font-size: 12px;
  line-height: normal;
  overflow: hidden;
  padding: 20px 16px;
  text-overflow: ellipsis;
  white-space: nowrap;

  strong {
    font-weight: ${MEDIUM};
  }
`
