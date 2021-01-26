import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useStore } from '../../contexts/Store'
import { useController } from '../../contexts/Controller'
import TopologyList from './TopologyList'

const NodeConnectionsLoader = () => {
  const { loadTopology, resetTopology } = useController()

  useEffect(() => {
    loadTopology()

    return () => {
      resetTopology()
    }
  }, [loadTopology, resetTopology])

  return null
}

type NodeProps = {
  id: string,
}

const ActiveNodeSetter = ({ id }: NodeProps) => {
  const { setActiveNodeId } = useStore()

  useEffect(() => {
    setActiveNodeId(id)

    return () => setActiveNodeId(undefined)
  }, [id, setActiveNodeId])

  return null
}

export default () => {
  const { nodeId } = useParams()
  const { nodes } = useStore()

  if (!nodes || nodes.length < 1) {
    return null
  }

  return (
    <>
      <NodeConnectionsLoader />
      <ActiveNodeSetter id={nodeId} />
      {!!nodeId && (
        <TopologyList id={nodeId} />
      )}
    </>
  )
}
