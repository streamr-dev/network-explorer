import React, { useEffect, useCallback } from 'react'
import { withRouter } from 'react-router-dom'

import { useNodes } from '../../contexts/Nodes'
import { useLoading } from '../../contexts/Loading'
import { Provider as TopologyProvider, useTopology } from '../../contexts/Topology'

type StreamProps = {
  id: string,
}

interface Props  {
  children: React.ReactNode
}

const StreamLoadEffect = ({ id }: StreamProps) => {
  const { loadTopology } = useTopology()
  const { setTopology } = useNodes()
  const { setLoading } = useLoading()

  const loadStreamTopology = useCallback(async (streamId: string) => {
    setLoading(true)
    const newTopology = await loadTopology({ id: streamId })

    setLoading(false)
    setTopology(newTopology)
  }, [loadTopology, setTopology, setLoading])

  useEffect(() => {
    loadStreamTopology(id)
  }, [loadStreamTopology, id])

  return null
}

export default withRouter(({ match }) => {
  const { params: { id } } = match || {}
  const { nodes } = useNodes()

  if (!id || !nodes || nodes.length <= 1) {
    return null
  }

  return (
    <TopologyProvider key={id}>
      <StreamLoadEffect id={id} />
    </TopologyProvider>
  )
})
