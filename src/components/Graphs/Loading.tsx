import React from 'react'
import styled, { css } from 'styled-components/macro'
import UnstyledLoadingIndicator from '../LoadingIndicator'

type LoadingProps = {
  loading?: boolean
  row?: number
}

const LoadingIndicator = styled(UnstyledLoadingIndicator)`
  position: absolute;

  ${({ theme }) =>
    !!theme.row &&
    css`
      grid-row: ${theme.row};
    `}
`

const Loading = ({ row, loading, ...props }: LoadingProps) => (
  <LoadingIndicator
    {...props}
    loading={loading}
    theme={{
      row,
    }}
  />
)

export default Loading
