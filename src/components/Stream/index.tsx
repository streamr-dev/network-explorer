import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useStore } from '../../contexts/Store'
import { useTopology } from '../../contexts/Topology'
import { useStream } from '../../contexts/Stream'

import TopologyList from './TopologyList'

type StreamProps = {
  id: string,
}

const TopologyLoader = ({ id }: StreamProps) => {
  const { loadTopology, resetTopology } = useTopology()

  useEffect(() => {
    loadTopology(id)

    return () => {
      resetTopology()
    }
  }, [loadTopology, resetTopology, id])

  return null
}

const StreamLoader = ({ id }: StreamProps) => {
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

const ActiveNode = ({ id }: NodeProps) => {
  const { setActiveNodeId } = useStore()

  useEffect(() => {
    setActiveNodeId(id)

    return () => setActiveNodeId(undefined)
  }, [id, setActiveNodeId])

  return null
}

export default () => {
  const { streamId, nodeId } = useParams()
  const { nodes } = useStore()

  if (!streamId || !nodes || nodes.length < 1) {
    return null
  }

  return (
    <div>
      <TopologyLoader id={streamId} />
      <StreamLoader id={streamId} />
      <ActiveNode id={nodeId} />
      <TopologyList id={streamId} />
    </div>
  )
}
