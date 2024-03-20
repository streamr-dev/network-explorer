import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../contexts/Store'
import { OperatorNode } from '../types'
import { useAllOperatorNodesQuery } from '../utils/nodes'
import { TopologyList } from './TopologyList'

const EmptyNodes: OperatorNode[] = []

export function NodeTopologyList() {
  const nodes = useAllOperatorNodesQuery().data || EmptyNodes

  const { selectedNode } = useStore()

  const roommates = useMemo(() => {
    if (!selectedNode) {
      return []
    }

    return nodes
      .filter((node) => areRoommates(node, selectedNode))
      .sort(({ title: a }, { title: b }) => a.localeCompare(b))
  }, [nodes, selectedNode])

  const navigate = useNavigate()

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
        navigate(`/nodes/${nodeId}`, { replace: true })
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
