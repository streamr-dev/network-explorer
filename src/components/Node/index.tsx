import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useStore } from '../../contexts/Store'
import TopologyList from './TopologyList'

type NodeProps = {
  activeNodeId: string,
}

const AllNodes = ({ activeNodeId }: NodeProps) => {
  const { setTopology } = useStore()
  const { nodes } = useStore()

  useEffect(() => {
    const topology = nodes.reduce((result, { id }) => ({
      ...result,
      [id]: [],
    }), {})

    setTopology(topology, activeNodeId)

    return () => {
      setTopology({})
    }
  }, [nodes, setTopology, activeNodeId])

  return null
}

export default () => {
  const { nodeId } = useParams()
  const { nodes } = useStore()

  if (!nodes || nodes.length < 1) {
    return null
  }

  return (
    <div>
      <AllNodes activeNodeId={nodeId} />
      <TopologyList id={nodeId} />
    </div>
  )
}
