import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../contexts/Store'
import { useStreamNodesQuery } from '../utils'
import { truncate } from '../utils/text'
import { TopologyList } from './TopologyList'

export function StreamTopologyList() {
  const { streamId = null } = useParams<{ streamId: string }>()

  const navigate = useNavigate()

  const { selectedNode } = useStore()

  const nodes = useStreamNodesQuery(streamId)

  if (!streamId || !nodes.length) {
    return
  }

  return (
    <TopologyList
      nodes={nodes}
      title={
        <>
          Showing <strong>{nodes.length}</strong> nodes carrying the stream{' '}
          <strong title={streamId}>{truncate(streamId)}</strong>
        </>
      }
      onNodeClick={(nodeId) => {
        navigate(
          nodeId === selectedNode?.id
            ? `/streams/${streamId}/`
            : `/streams/${streamId}/nodes/${nodeId}`,
          { replace: true },
        )
      }}
    />
  )
}
