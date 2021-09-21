import React, { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useStore } from '../../contexts/Store'
import { useController } from '../../contexts/Controller'

import TopologyList from './TopologyList'

type StreamProps = {
  id: string
}

const SearchTextSetter = ({ id }: StreamProps) => {
  const { updateSearch } = useStore()

  useEffect(() => {
    updateSearch(id)
  }, [updateSearch, id])

  return null
}

const TopologyLoader = ({ id }: StreamProps) => {
  const { loadTopology, resetTopology } = useController()

  useEffect(() => {
    loadTopology({ streamId: id })

    return () => {
      resetTopology()
    }
  }, [loadTopology, resetTopology, id])

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
  id: string
}

const ActiveNodeSetter = ({ id }: NodeProps) => {
  const { setActiveNodeId } = useStore()

  useEffect(() => {
    setActiveNodeId(id)

    return () => setActiveNodeId(undefined)
  }, [id, setActiveNodeId])

  return null
}

interface ParamTypes {
  nodeId: string
  streamId: string
}

export default () => {
  const { streamId: encodedStreamId, nodeId: encodedNodeId } = useParams<ParamTypes>()

  const streamId = useMemo(() => decodeURIComponent(encodedStreamId), [encodedStreamId])
  const nodeId = useMemo(() => decodeURIComponent(encodedNodeId), [encodedNodeId])

  if (!streamId) {
    return null
  }

  return (
    <>
      <SearchTextSetter id={streamId} />
      <TopologyLoader id={streamId} />
      <StreamLoader id={streamId} />
      <ActiveNodeSetter id={nodeId} />
      <TopologyList id={streamId} />
    </>
  )
}
