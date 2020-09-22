import React, {
  useCallback,
  useMemo,
  useContext,
} from 'react'

import { usePending } from './Pending'
import { useNodes } from './Nodes'
import * as api from '../utils/api'

type ContextProps = {
  loadTopology: Function,
  resetTopology: Function,
}

const TopologyContext = React.createContext<ContextProps | undefined>(undefined)

function useTopologyContext() {
  const { setTopology, setSelectedNode } = useNodes()
  const { wrap } = usePending('topology')

  const loadTopologyFromApi = useCallback(async ({ id }) => {
    try {
      const nextTopology = await api.getTopology({ id })

      return nextTopology
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e)
      throw e
    }
  }, [])

  const loadTopology = useCallback(async (streamId: string) => (
    wrap(async () => {
      const newTopology = await loadTopologyFromApi({ id: streamId })

      setTopology(newTopology)
    })
  ), [wrap, loadTopologyFromApi, setTopology])

  const resetTopology = useCallback(() => {
    setTopology([])
    setSelectedNode(undefined)
  }, [setTopology, setSelectedNode])

  return useMemo(() => ({
    loadTopology,
    resetTopology,
  }), [
    loadTopology,
    resetTopology,
  ])
}

interface Props  {
  children: React.ReactNode
}

const TopologyProvider = ({ children }: Props) => (
  <TopologyContext.Provider value={useTopologyContext()}>
    {children || null}
  </TopologyContext.Provider>
)

const useTopology = () => {
  const context = useContext(TopologyContext)

  if (!context) {
    throw new Error('TopologyContext must be inside a Provider with a value')
  }

  return context
}

export {
  TopologyProvider as Provider,
  TopologyContext as Context,
  useTopology,
}
