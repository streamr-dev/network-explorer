import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useStore } from '../../contexts/Store'
import TopologyList from './TopologyList'

type NodeProps = {
  id: string,
}

const ActiveNode = ({ id }: NodeProps) => {
  const { setTopology } = useStore()

  useEffect(() => {
    setTopology({
      [id]: [],
    }, id)

    return () => {
      setTopology({})
    }
  }, [id, setTopology])

  return null
}

export default () => {
  const { nodeId } = useParams()
  const { nodes } = useStore()

  if (!nodeId || !nodes || nodes.length < 1) {
    return null
  }

  return (
    <div>
      <ActiveNode id={nodeId} />
      <TopologyList id={nodeId} />
    </div>
  )
}
