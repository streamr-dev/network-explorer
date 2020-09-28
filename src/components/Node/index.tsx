import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useNodes } from '../../contexts/Nodes'
import { useTopology } from '../../contexts/Topology'
import TopologyList from './TopologyList'

type NodeProps = {
  id: string,
}

const ActiveNode = ({ id }: NodeProps) => {
  const { setActiveNodeId, setTopology, resetTopology } = useTopology()

  useEffect(() => {
    setActiveNodeId(id)
    setTopology({
      [id]: [],
    })

    return () => {
      setActiveNodeId(undefined)
      resetTopology()
    }
  }, [id, setActiveNodeId, setTopology, resetTopology])

  return null
}

export default () => {
  const { nodeId } = useParams()
  const { nodes } = useNodes()

  if (!nodeId || !nodes || nodes.length < 1) {
    return null
  }

  return (
    <div>
      <ActiveNode id={nodeId} />
      <TopologyList id={nodeId} />
    </div>
  )
}
