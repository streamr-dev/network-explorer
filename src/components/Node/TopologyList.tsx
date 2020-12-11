import React, { useCallback } from 'react'
import { useHistory } from 'react-router-dom'

import { useStore } from '../../contexts/Store'
import NodeList from '../NodeList'

type Props = {
  id?: string,
}

const TopologyList = ({ id }: Props) => {
  const { nodes, env } = useStore()

  const history = useHistory()

  const onNodeClick = useCallback((nodeId) => {
    let path = '/'

    if (id !== nodeId) {
      path += `nodes/${nodeId}`
    }

    history.replace(path)
  }, [id, history])

  return (
    <NodeList
      nodes={nodes}
      activeNodeId={id}
      onNodeClick={onNodeClick}
    >
      <NodeList.Header>
        Showing all
        {' '}
        <strong>{nodes.length}</strong>
        {' '}
        nodes in the
        {' '}
        <strong>{env && env.toUpperCase()}</strong>
        {' '}
        network
      </NodeList.Header>
    </NodeList>
  )
}

export default TopologyList
