import React, { useMemo } from 'react'

import { useStore } from '../../contexts/Store'
import NodeList from '../NodeList'

type Props = {
  id?: string,
}

const TopologyList = ({ id }: Props) => {
  const { nodes } = useStore()

  const currentNode = useMemo(() => nodes.find(({ id: nodeId }) => nodeId === id), [nodes, id])

  return (
    <NodeList
      nodes={currentNode ? [currentNode] : []}
      activeNodeId={id}
    />
  )
}

export default TopologyList
