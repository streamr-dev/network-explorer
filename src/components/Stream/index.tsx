import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useNodes } from '../../contexts/Nodes'
import { Provider as TopologyProvider, useTopology } from '../../contexts/Topology'

import TopologyList from './TopologyList'

type StreamProps = {
  id: string,
}

interface Props  {
  children: React.ReactNode
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

type NodeProps = {
  id: string,
}

const SetActiveNodeEffect = ({ id }: NodeProps) => {
  const { setSelectedNode } = useNodes()

  useEffect(() => {
    setSelectedNode(id)

    return () => setSelectedNode(undefined)
  }, [id, setSelectedNode])

  return null
}

export default () => {
  const { streamId, nodeId } = useParams()
  const { nodes } = useNodes()

  if (!streamId || !nodes || nodes.length < 1) {
    return null
  }

  return (
    <TopologyProvider key={streamId}>
      <LoadTopologyEffect id={streamId} />
      <SetActiveNodeEffect id={nodeId} />
      <TopologyList id={streamId} />
    </TopologyProvider>
  )
}
