import React, { useMemo } from 'react'
import { useStore } from '../Store'
import { useNavigateToNodeCallback } from '../hooks'
import { OperatorNode } from '../types'
import { useOperatorNodesForStreamQuery } from '../utils/nodes'
import { TopologyList } from './TopologyList'

const EmptyNodes: OperatorNode[] = []

export function NodeTopologyList() {
  const { chainId } = useStore()

  const nodes = useOperatorNodesForStreamQuery(chainId, undefined).data || EmptyNodes

  const { selectedNode } = useStore()

  const roommates = useMemo(() => {
    if (!selectedNode) {
      return []
    }

    return nodes
      .filter((node) => areRoommates(node, selectedNode))
      .sort(({ title: a }, { title: b }) => a.localeCompare(b))
  }, [nodes, selectedNode])

  const navigateToNode = useNavigateToNodeCallback()

  if (!roommates.length) {
    return null
  }

  return (
    <TopologyList
      title={
        roommates.length > 1 && (
          <>
            There are <strong>{roommates.length}</strong> nodes in this location
          </>
        )
      }
      nodes={roommates}
      onNodeClick={(nodeId) => {
        navigateToNode(nodeId, { replace: true })
      }}
    />
  )
}

function areRoommates(nodeA: OperatorNode, nodeB: OperatorNode) {
  return (
    nodeA.location.longitude === nodeB.location.longitude &&
    nodeA.location.latitude === nodeB.location.latitude
  )
}
