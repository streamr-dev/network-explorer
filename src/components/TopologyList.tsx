import React, { ReactNode } from 'react'
import { useStore } from '../Store'
import { usePaginatedItems } from '../hooks'
import { OperatorNode } from '../types'
import { NodeList, NodeListHeader } from './NodeList'
import { NodeListItem } from './NodeList/NodeListItem'
import Pager from './NodeList/Pager'
import NodeStats from './NodeStats'
import { Place } from './Place'

interface TopologyListProps {
  nodes: OperatorNode[]
  onNodeClick?(nodeId: string): void
  title?: ReactNode
}

export function TopologyList({ onNodeClick, nodes, title }: TopologyListProps) {
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
          title={node.title}
          placeName={
            <Place longitude={node.location.longitude} latitude={node.location.latitude} />
          }
          onClick={onNodeClick}
          isActive={selectedNode?.id === node.id}
        >
          <NodeStats id={node.id} />
        </NodeListItem>
      ))}
    </NodeList>
  )
}
