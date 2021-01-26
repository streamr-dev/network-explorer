import React, { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useStore } from '../../contexts/Store'
import { useController } from '../../contexts/Controller'

import TopologyList from './TopologyList'

type StreamProps = {
  id: string,
}

const TopologyLoader = ({ id }: StreamProps) => {
  const { loadTopology, resetTopology } = useController()
  const { updateSearch } = useStore()

  useEffect(() => {
    updateSearch(id)
    loadTopology({
      streamId: id,
    })

    return () => {
      resetTopology()
    }
  }, [loadTopology, resetTopology, updateSearch, id])

  return null
}

const StreamLoader = ({ id }: StreamProps) => {
  const { loadStream, resetStream } = useController()

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

const ActiveNodeSetter = ({ id }: NodeProps) => {
  const { setActiveNodeId } = useStore()

  useEffect(() => {
    setActiveNodeId(id)

    return () => setActiveNodeId(undefined)
  }, [id, setActiveNodeId])

  return null
}

export default () => {
  const { streamId: encodedStreamId, nodeId } = useParams()
  const { nodes } = useStore()

  const streamId = useMemo(() => decodeURIComponent(encodedStreamId), [encodedStreamId])

  if (!streamId || !nodes || nodes.length < 1) {
    return null
  }

  return (
    <>
      <TopologyLoader id={streamId} />
      <StreamLoader id={streamId} />
      <ActiveNodeSetter id={nodeId} />
      <TopologyList id={streamId} />
    </>
  )
}
