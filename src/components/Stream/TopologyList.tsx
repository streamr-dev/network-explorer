import React, { useCallback } from 'react'
import { useParams, useHistory } from 'react-router-dom'

import { useStore } from '../../contexts/Store'
import { truncate } from '../../utils/text'
import NodeList from '../NodeList'
import Error from '../Error'

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
    <NodeList>
      <NodeList.Header>
        Showing
        {' '}
        <strong>{visibleNodes.length}</strong>
        {' '}
        nodes carrying the stream
        {' '}
        <strong title={id}>{truncate(streamTitle)}</strong>
      </NodeList.Header>
      {visibleNodes.map(({ id: nodeId, title, placeName }) => (
        <NodeList.Node
          key={nodeId}
          nodeId={nodeId}
          title={title}
          placeName={placeName}
          onClick={toggleNode}
          showAddress={activeNodeId === nodeId}
        >
          {activeNodeId === nodeId && (
            <Error>
              Couldn’t load node metrics
            </Error>
          )}
        </NodeList.Node>
      ))}
    </NodeList>
  )
}

export default TopologyList
