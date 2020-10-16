import React from 'react'

import { useStore } from '../../contexts/Store'
import NodeList from '../NodeList'

type Props = {
  id: string,
}

const TopologyList = ({ id }: Props) => {
  const { visibleNodes } = useStore()

  return (
    <NodeList
      nodes={visibleNodes}
      activeNodeId={id}
      onNodeClick={() => {}}
    />
  )
}

export default TopologyList
