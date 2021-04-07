import React, { useMemo } from 'react'

import { useStore } from '../../contexts/Store'
import NodeList from '../NodeList'
import StreamrClientProvider from '../StreamrClientProvider'

import NodeStats from '../NodeStats'

type Props = {
  id?: string,
}

const TopologyList = ({ id }: Props) => {
  const { nodes } = useStore()

  const currentNode = useMemo(() => nodes.find(({ id: nodeId }) => nodeId === id), [nodes, id])

  return currentNode ? (
    <NodeList>
      <StreamrClientProvider>
        <NodeList.Node
          nodeId={currentNode.id}
          title={currentNode.title}
          placeName={currentNode.placeName}
          isActive
        >
          <NodeStats key={currentNode.id} id={currentNode.id} />
        </NodeList.Node>
      </StreamrClientProvider>
    </NodeList>
  ) : null
}

export default TopologyList
