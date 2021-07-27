import React, { useMemo } from 'react'

import { useStore } from '../../contexts/Store'
import NodeList from '../NodeList'

import NodeStats from '../NodeStats'

type Props = {
  id?: string
}

const TopologyList = ({ id }: Props) => {
  const { nodes } = useStore()

  const currentNode = useMemo(() => nodes.find(({ id: nodeId }) => nodeId === id), [nodes, id])
  const { title } = (currentNode || {}).location || {}

  return currentNode ? (
    <NodeList>
      <NodeList.Node
        nodeId={currentNode.id}
        title={currentNode.title}
        address={currentNode.address}
        placeName={title || ''}
        isActive
      >
        <NodeStats key={currentNode.id} id={currentNode.address} />
      </NodeList.Node>
    </NodeList>
  ) : null
}

export default TopologyList
