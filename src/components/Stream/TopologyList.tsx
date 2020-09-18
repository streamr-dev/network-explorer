import React, { useCallback } from 'react'
import styled from 'styled-components/macro'

import { useNodes } from '../../contexts/Nodes'
import ControlBox from '../ControlBox'
import { SANS, MEDIUM } from '../../utils/styled'

import Node from './Node'

const Wrapper = styled.div`
  padding: 16px;
  font-size: 12px;
`

const Header = styled.div`
  font-family: ${SANS};
  color: #A3A3A3;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 16px;

  strong {
    font-weight: ${MEDIUM};
  }
`

type Props = {
  id: string,
}

const TopologyList = ({ id }: Props) => {
  const { visibleNodes, selectedNode, setSelectedNode } = useNodes()

  const toggleNode = useCallback((nodeId) => {
    setSelectedNode((prevNode: string) => {
      if (prevNode === nodeId) {
        return undefined
      }

      return nodeId
    })
  }, [setSelectedNode])

  return (
    <ControlBox>
      <Wrapper>
        <Header>
          Showing
          {' '}
          <strong>{visibleNodes.length}</strong>
          {' '}
          nodes carrying the stream
          {' '}
          <strong title={id}>{id}</strong>
        </Header>
        {visibleNodes.map(({ id: nodeId, title }) => (
          <Node
            key={nodeId}
            nodeId={nodeId}
            title={title}
            active={selectedNode === nodeId}
            onClick={() => toggleNode(nodeId)}
          />
        ))}
      </Wrapper>
    </ControlBox>
  )
}

export default TopologyList
