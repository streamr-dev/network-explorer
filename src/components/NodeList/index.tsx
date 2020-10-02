import React, { useCallback } from 'react'
import styled from 'styled-components/macro'

import ControlBox from '../ControlBox'

import NodeListItem from './NodeListItem'
import * as api from '../../utils/api/tracker'

const Wrapper = styled.div`
  padding: 16px;
  font-size: 12px;
`

type Props = {
  nodes: api.Node[],
  activeNodeId?: string,
  onNodeClick?: (v: string) => void,
  children?: React.ReactNode,
}

const NodeList = ({
  nodes,
  activeNodeId,
  onNodeClick: onNodeClickProp,
  children,
}: Props) => {
  const onNodeClick = useCallback((nodeId: string) => {
    if (onNodeClickProp) {
      onNodeClickProp(nodeId)
    }
  }, [onNodeClickProp])

  return (
    <ControlBox>
      <Wrapper>
        {children}
        {nodes.map(({ id: nodeId, title, placeName }) => (
          <NodeListItem
            key={nodeId}
            nodeId={nodeId}
            title={title}
            placeName={placeName}
            active={activeNodeId === nodeId}
            onClick={() => onNodeClick(nodeId)}
          />
        ))}
      </Wrapper>
    </ControlBox>
  )
}

export default NodeList
