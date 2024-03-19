import React, { useMemo } from 'react'
import { useStore } from '../contexts/Store'
import { OperatorNode } from '../types'
import { useNodesQuery } from '../utils'
import { NodeList, NodeListHeader } from './NodeList'
import { NodeListItem } from './NodeList/NodeListItem'
import { useNavigate } from 'react-router-dom'
import NodeStats from './NodeStats'
import { usePaginatedItems } from '../hooks'
import Pager from './NodeList/Pager'

const EmptyNodes: OperatorNode[] = []

export function NodeTopologyList() {
  const nodes = useNodesQuery({}).data || EmptyNodes

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

  const pagedRoommates = usePaginatedItems(roommates, {
    selectedId: selectedNode?.id,
    pageSize: 5,
  })

  if (!selectedNode || !roommates.length) {
    return null
  }

  return (
    <NodeList>
      {roommates.length > 1 && (
        <NodeListHeader>
          There are <strong>{roommates.length}</strong> nodes in this location
        </NodeListHeader>
      )}
      {pagedRoommates.totalPages > 1 && (
        <Pager
          currentPage={pagedRoommates.page}
          lastPage={pagedRoommates.totalPages}
          onChange={pagedRoommates.setPage}
        />
      )}
      {pagedRoommates.items.map((node) => (
        <NodeListItem
          key={node.id}
          nodeId={node.id}
          title={node.title}
          address="N/A"
          placeName="N/A"
          onClick={(nodeId) => {
            navigate(`/nodes/${nodeId}`, { replace: true })
          }}
          isActive={selectedNode.id === node.id}
          data-node-id={node.id}
        >
          <NodeStats id={node.id} />
        </NodeListItem>
      ))}
    </NodeList>
  )
}

function areRoommates(nodeA: OperatorNode, nodeB: OperatorNode) {
  return (
    nodeA.location.longitude === nodeB.location.longitude &&
    nodeA.location.latitude === nodeB.location.latitude
  )
}
