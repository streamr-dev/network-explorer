import React, { useMemo } from 'react'

import { useStore } from '../../contexts/Store'
import NodeList from '../NodeList'

import Error from '../Error'

type Props = {
  id?: string,
}

const TopologyList = ({ id }: Props) => {
  const { nodes } = useStore()

  const currentNode = useMemo(() => nodes.find(({ id: nodeId }) => nodeId === id), [nodes, id])

  return currentNode ? (
    <NodeList>
      <NodeList.Node
        nodeId={currentNode.id}
        title={currentNode.title}
        placeName={currentNode.placeName}
      >
        <Error>
          Couldn’t load node metrics
        </Error>
      </NodeList.Node>
    </NodeList>
  ) : null
}

export default TopologyList
