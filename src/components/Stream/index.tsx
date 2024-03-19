import React, { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useController } from '../../contexts/Controller'
import { useStore } from '../../hooks/useStore'
import { ActiveRoute } from '../../types'
import TopologyList from './TopologyList'

type StreamProps = {
  id: string
}

const ActiveRouteSetter = () => {
  const { setActiveRoute } = useStore()

  useEffect(() => {
    setActiveRoute(ActiveRoute.Stream)
  }, [setActiveRoute])

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

export function Stream() {
  const { streamId: encodedStreamId = '', nodeId: encodedNodeId = '' } = useParams<{
    nodeId: string
    streamId: string
  }>()

  const streamId = useMemo(() => decodeURIComponent(encodedStreamId), [encodedStreamId])

  const nodeId = useMemo(() => decodeURIComponent(encodedNodeId), [encodedNodeId])

  if (!streamId) {
    return null
  }

  return (
    <>
      <ActiveRouteSetter />
      <TopologyLoader id={streamId} />
      <StreamLoader id={streamId} />
      <ActiveNodeSetter id={nodeId} />
      <TopologyList id={streamId} />
    </>
  )
}
