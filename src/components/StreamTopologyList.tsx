import React from 'react'
import { useParams } from 'react-router-dom'
import { useNavigateToNodeCallback } from '../hooks'
import { useOperatorNodesForStreamQuery } from '../utils/nodes'
import { truncate } from '../utils/text'
import { TopologyList } from './TopologyList'
import { useStore } from '../Store'

export function StreamTopologyList() {
  const { streamId } = useParams<{ streamId: string }>()

  const navigateToNode = useNavigateToNodeCallback()

  const { chainId } = useStore()

  const { data: nodes = [] } = useOperatorNodesForStreamQuery(chainId, streamId || undefined)

  const { selectedNode } = useStore()

  if (!streamId) {
    return null
  }

  return (
    <TopologyList
      highlightPointsOnHover
      nodes={nodes}
      title={
        <>
          Showing <strong>{nodes.length}</strong> nodes carrying the stream{' '}
          <strong title={streamId}>{truncate(streamId)}</strong>
        </>
      }
      onNodeClick={(nodeId) => {
        navigateToNode(selectedNode?.id === nodeId ? '' : nodeId, { replace: true })
      }}
    />
  )
}
