import React, { useCallback } from 'react'
import styled from 'styled-components/macro'
import { useParams, useHistory } from 'react-router-dom'

import { useTopology } from '../../contexts/Topology'
import { useStream } from '../../contexts/Stream'
import { SANS, MEDIUM } from '../../utils/styled'
import NodeList from '../NodeList'

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

type Props = {
  id: string,
}

const TopologyList = ({ id }: Props) => {
  const { visibleNodes } = useTopology()
  const { stream } = useStream()
  const { nodeId: activeNodeId } = useParams()
  const history = useHistory()

  const toggleNode = useCallback((nodeId) => {
    let path = `/streams/${id}`

    if (activeNodeId !== nodeId) {
      path += `/nodes/${nodeId}`
    }

    history.replace(path)
  }, [id, history, activeNodeId])

  const streamTitle = stream && stream.name || id

  return (
    <NodeList
      nodes={visibleNodes}
      activeNodeId={activeNodeId}
      onNodeClick={toggleNode}
    >
      <Header>
        Showing
        {' '}
        <strong>{visibleNodes.length}</strong>
        {' '}
        nodes carrying the stream
        {' '}
        <strong title={id}>{streamTitle}</strong>
      </Header>
    </NodeList>
  )
}

export default TopologyList
