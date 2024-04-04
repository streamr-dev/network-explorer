import React, { ReactNode } from 'react'
import { useStore } from '../Store'
import { usePaginatedItems } from '../hooks'
import { OperatorNode } from '../types'
import { getNodeLocationId } from '../utils/map'
import { NodeList, NodeListHeader } from './NodeList'
import { NodeListItem } from './NodeList/NodeListItem'
import Pager from './NodeList/Pager'
import { Place } from './Place'
import { NodeStats } from './Stats'

interface TopologyListProps {
  highlightPointsOnHover?: boolean
  nodes: OperatorNode[]
  onNodeClick?(nodeId: string): void
  title?: ReactNode
}

export function TopologyList({
  highlightPointsOnHover = false,
  nodes,
  onNodeClick,
  title,
}: TopologyListProps) {
  const { selectedNode } = useStore()

  const pagedNodes = usePaginatedItems(nodes, {
    selectedId: selectedNode?.id,
  })

  return (
    <NodeList>
      {!!title && <NodeListHeader>{title}</NodeListHeader>}
      {pagedNodes.totalPages > 1 && (
        <Pager
          currentPage={pagedNodes.page}
          lastPage={pagedNodes.totalPages}
          onChange={pagedNodes.setPage}
        />
      )}
      {pagedNodes.items.map((node) => (
        <NodeListItem
          key={node.id}
          nodeId={node.id}
          nodeLocationId={getNodeLocationId(node.location)}
          title={node.title}
          placeName={
            <Place longitude={node.location.longitude} latitude={node.location.latitude} />
          }
          onClick={onNodeClick}
          isActive={selectedNode?.id === node.id}
          highlightPointOnHover={highlightPointsOnHover}
        >
          <NodeStats nodeId={node.id} />
        </NodeListItem>
      ))}
    </NodeList>
  )
}
