import React, { useEffect, useCallback } from 'react'
import { withRouter } from 'react-router-dom'

import { useNodes } from '../../contexts/Nodes'
import { usePending } from '../../contexts/Pending'
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
  const { wrap } = usePending('stream')

  const loadStreamTopology = useCallback(async (streamId: string) => (
    wrap(async () => {
      const newTopology = await loadTopology({ id: streamId })

      setTopology(newTopology)
    })
  ), [wrap, loadTopology, setTopology])

  useEffect(() => {
    loadStreamTopology(id)
  }, [loadStreamTopology, id])

  return null
}

export default withRouter(({ match }) => {
  const { params: { id } } = match || {}
  const { isPending } = usePending('nodes')

  if (!id || !!isPending) {
    return null
  }

  return (
    <TopologyProvider key={id}>
      <StreamLoadEffect id={id} />
    </TopologyProvider>
  )
})
