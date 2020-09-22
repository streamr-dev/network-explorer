import React, { useCallback } from 'react'
import styled from 'styled-components/macro'
import { useParams, useHistory } from 'react-router-dom'

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
  const { visibleNodes } = useNodes()
  const { nodeId: activeNodeId } = useParams()
  const history = useHistory()

  const toggleNode = useCallback((nodeId) => {
    let path = `/streams/${id}`

    if (activeNodeId !== nodeId) {
      path += `/nodes/${nodeId}`
    }

    history.replace(path)
  }, [id, history, activeNodeId])

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
            active={activeNodeId === nodeId}
            onClick={() => toggleNode(nodeId)}
          />
        ))}
      </Wrapper>
    </ControlBox>
  )
}

export default TopologyList