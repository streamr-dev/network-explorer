import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useNodes } from '../../contexts/Nodes'
import { useTopology } from '../../contexts/Topology'
import { useStream } from '../../contexts/Stream'

import TopologyList from './TopologyList'

type StreamProps = {
  id: string,
}

const LoadTopologyEffect = ({ id }: StreamProps) => {
  const { loadTopology, resetTopology } = useTopology()

  useEffect(() => {
    loadTopology(id)

    return () => {
      resetTopology()
    }
  }, [loadTopology, resetTopology, id])

  return null
}

const LoadStreamEffect = ({ id }: StreamProps) => {
  const { loadStream, resetStream } = useStream()

  useEffect(() => {
    loadStream(id)

    return () => {
      resetStream()
    }
  }, [loadStream, resetStream, id])

  return null
}

type NodeProps = {
  id: string,
}

const SetActiveNodeEffect = ({ id }: NodeProps) => {
  const { setActiveNodeId } = useTopology()

  useEffect(() => {
    setActiveNodeId(id)

    return () => setActiveNodeId(undefined)
  }, [id, setActiveNodeId])

  return null
}

export default () => {
  const { streamId, nodeId } = useParams()
  const { nodes } = useNodes()

  if (!streamId || !nodes || nodes.length < 1) {
    return null
  }

  return (
    <div key={streamId}>
      <LoadTopologyEffect id={streamId} />
      <LoadStreamEffect id={streamId} />
      <SetActiveNodeEffect id={nodeId} />
      <TopologyList id={streamId} />
    </div>
  )
}
