import React, { useCallback } from 'react'
import { useParams, useHistory } from 'react-router-dom'

import { useStore } from '../../contexts/Store'
import NodeList from '../NodeList'

type Props = {
  id: string,
}

const TopologyList = ({ id }: Props) => {
  const { visibleNodes, stream } = useStore()
  const { nodeId: activeNodeId } = useParams()
  const history = useHistory()

  const toggleNode = useCallback((nodeId) => {
    let path = `/streams/${encodeURIComponent(id)}`

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
      <NodeList.Header>
        Showing
        {' '}
        <strong>{visibleNodes.length}</strong>
        {' '}
        nodes carrying the stream
        {' '}
        <strong title={id}>{streamTitle}</strong>
      </NodeList.Header>
    </NodeList>
  )
}

export default TopologyList
