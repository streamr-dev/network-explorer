import React from 'react'
import styled, { keyframes } from 'styled-components/macro'

import { useLoading } from '../../contexts/Loading'

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
  position: fixed;
  top: 0;
  width: 100%;
  height: 4px;
  z-index: 1;
  background-color: transparent;
  will-change: opacity;
  transition: opacity 0.3s ease-out;

  ::after {
    content: '';
    display: block;
    height: 4px;
    background: #0424FF;
    position: absolute;
    left: 0;
    right: 100%;
    animation: 1200ms infinite;
    animation-name: ${animation};
    will-change: left, right;
  }
`

const LoadingIndicator = () => {
  const { loading } = useLoading()

  return (
    <LoadingBar
      style={{
        opacity: loading ? '1' : '0',
      }}
    />
  )
}

export default LoadingIndicator
