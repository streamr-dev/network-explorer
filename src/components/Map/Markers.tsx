import React from 'react'
import styled from 'styled-components/macro'

import { SANS } from '../../utils/styled'

// eslint-disable-next-line react/require-default-props
const NodeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M16 0C27.8241 0 32 4.19557 32 16C32 27.7598 27.7545 32 16 32C4.28014 32 0 27.7054 0 16C0 4.24975 4.21033 0 16 0Z"
      fill="#0324FF"
    />
  </svg>
)

const ClusterContainer = styled.div`
  position: relative;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transform: translate(-50%, -50%);
  font-family: ${SANS};
  font-weight: bold;
  font-size: 10px;
  line-height: 24px;

  & span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #ffffff;
  }
`

export const ClusterMarker = ({ size, onClick }: { size: number, onClick: () => void }) => (
  <ClusterContainer onClick={onClick}>
    <NodeIcon />
    <span>{size}</span>
  </ClusterContainer>
)

export const NodeMarker = styled(NodeIcon)`
  width: 32px;
  height: 32px;
  transform: translate(-50%, -50%);
`
