import React from 'react'
import styled, { css } from 'styled-components/macro'
import Identicon from 'react-identicons'

import { SANS } from '../../utils/styled'

const NodeIconSvg = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M16 0C27.8241 0 32 4.19557 32 16C32 27.7598 27.7545 32 16 32C4.28014 32 0 27.7054 0 16C0 4.24975 4.21033 0 16 0Z"
    />
  </svg>
)

const NodeIcon = styled(NodeIconSvg)`
  fill: white;
  overflow: visible; // need this to render stroke without clipping
`

const ClusterContainer = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
  cursor: pointer;
  transform: translate(-50%, -50%);
  font-family: ${SANS};
  font-weight: bold;
  font-size: 10px;
  line-height: 24px;

  span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #0324FF;
  }
`

export const ClusterMarker = ({ size, onClick }: { size: number, onClick: () => void }) => (
  <ClusterContainer onClick={onClick}>
    <NodeIcon />
    <span>{size}</span>
  </ClusterContainer>
)

type NodeMarkerContainerProps = {
  active: boolean,
}

const NodeMarkerContainer = styled.div<NodeMarkerContainerProps>`
  position: relative;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: all 100ms ease-in-out;

  canvas {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  ${({ active }) => !!active && css`
    width: 32px;
    height: 32px;

    path {
      stroke: #0324FF;
      stroke-width: 1px;
    }
  `}
`

type NodeMarkerProps = {
  id: string,
  isActive?: boolean,
  onClick: () => void,
}

export const NodeMarker = ({ id, isActive, onClick }: NodeMarkerProps) => (
  <NodeMarkerContainer onClick={onClick} active={!!isActive}>
    <NodeIcon />
    <Identicon
      string={id}
      size={14}
    />
  </NodeMarkerContainer>
)
