import React from 'react'
import styled, { css } from 'styled-components/macro'

import { SANS } from '../../utils/styled'

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
    <span>{size}</span>
  </ClusterContainer>
)

type NodeMarkerContainerProps = {
  active: boolean,
}

const InnerBlip = styled.div`
  background-color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  transition: all 150ms ease-in-out;
  width: 0;
  height: 0;
`

const NodeMarkerContainer = styled.div<NodeMarkerContainerProps>`
  position: relative;
  width: 8px;
  height: 8px;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: all 150ms ease-in-out;
  background-color: #0324FF;
  border-radius: 50%;

  ${({ active }) => !active && css`
    :hover {
      width: 12px;
      height: 12px;
    }
  `}

  ${({ active }) => !!active && css`
    width: 24px;
    height: 24px;

    ${InnerBlip} {
      width: 8px;
      height: 8px;
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
    <InnerBlip />
  </NodeMarkerContainer>
)
