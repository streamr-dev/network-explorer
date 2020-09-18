import React, { useEffect } from 'react'
import { withRouter } from 'react-router-dom'

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

export default withRouter(({ match }) => {
  const { params: { id } } = match || {}
  const { nodes } = useNodes()

  if (!id || !nodes || nodes.length < 1) {
    return null
  }

  return (
    <TopologyProvider key={id}>
      <LoadTopologyEffect id={id} />
      <TopologyList id={id} />
    </TopologyProvider>
  )
})
