import React from 'react'
import { Marker } from 'react-map-gl'
import { NodeMarker } from './Markers'
import { Node } from '../../utils/api/tracker'

type Props = {
  nodes: Node[]
  activeNode?: string
  onNodeClick?: (v: string) => void
}

const MarkerLayer = ({ nodes, activeNode, onNodeClick }: Props) => (
  <>
    {nodes.map(({ id, location }) => (
      <Marker key={`node-${id}`} latitude={location.latitude} longitude={location.longitude}>
        <NodeMarker
          id={id}
          isActive={activeNode === id}
          onClick={() => onNodeClick && onNodeClick(id)}
        />
      </Marker>
    ))}
  </>
)

export default MarkerLayer
