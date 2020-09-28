import React from 'react'

import { useTopology } from '../../contexts/Topology'
import NodeList from '../NodeList'

type Props = {
  id: string,
}

const TopologyList = ({ id }: Props) => {
  const { visibleNodes } = useTopology()

  return (
    <NodeList
      nodes={visibleNodes}
      activeNodeId={id}
      onNodeClick={() => {}}
    />
  )
}

export default TopologyList
