import React from 'react'
import styled, { keyframes } from 'styled-components/macro'

const animation = keyframes`
  0% {
    left: 0%;
    right: 100%;
  }

  33% {
    left: 0%;
    right: 0%;
  }

  67% {
    left: 0%;
    right: 0%;
  }

  100% {
    left: 100%;
    right: 0%;
  }
`

const LoadingBar = styled.div`
  width: 100%;
  height: ${({ theme }) => (theme.large ? '4' : '1')}px;
  background-color: transparent;
  will-change: opacity;
  transition: opacity 0.3s ease-out;
  opacity: ${({ theme }) => (theme.loading ? '1' : '0')};

  ::after {
    content: '';
    display: block;
    height: ${({ theme }) => (theme.large ? '4' : '1')}px;
    background: #0424ff;
    position: absolute;
    left: 0;
    right: 100%;
    animation: 1200ms infinite;
    animation-name: ${animation};
    will-change: left, right;
  }
`

type Props = {
  loading?: boolean
  large?: boolean
}

const LoadingIndicator = ({ loading, large, ...props }: Props) => (
  <LoadingBar
    {...props}
    theme={{
      loading: !!loading,
      large: !!large,
    }}
  />
)

export default LoadingIndicator
