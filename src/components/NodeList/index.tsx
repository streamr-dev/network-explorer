import React, { useCallback } from 'react'
import styled from 'styled-components/macro'

import ControlBox from '../ControlBox'

import NodeListItem from './NodeListItem'
import * as api from '../../utils/api/tracker'
import { SANS, MEDIUM } from '../../utils/styled'

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

const Header = styled.div`
  font-family: ${SANS};
  color: #A3A3A3;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  & + * {
    margin-top: 16px;
  }

  strong {
    font-weight: ${MEDIUM};
  }
`

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

NodeList.Header = Header

export default NodeList
