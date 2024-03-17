import React from 'react'
import styled, { css } from 'styled-components'

type NodeMarkerContainerProps = {
  active: boolean
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
  background-color: #0324ff;
  border-radius: 50%;

  ${({ active }) =>
    !active &&
    css`
      :hover {
        width: 12px;
        height: 12px;
      }
    `}

  ${({ active }) =>
    !!active &&
    css`
      width: 24px;
      height: 24px;

      ${InnerBlip} {
        width: 8px;
        height: 8px;
      }
    `}
`

type NodeMarkerProps = {
  id: string
  isActive?: boolean
  onClick: () => void
}

export const NodeMarker = ({ id, isActive, onClick }: NodeMarkerProps) => (
  <NodeMarkerContainer onClick={onClick} active={!!isActive}>
    <InnerBlip />
  </NodeMarkerContainer>
)
