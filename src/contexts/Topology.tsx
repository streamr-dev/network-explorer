import React, {
  useCallback,
  useMemo,
  useContext,
} from 'react'

import * as api from '../utils/api'

type ContextProps = {
  loadTopology: Function,
}

const TopologyContext = React.createContext<ContextProps | undefined>(undefined)

function useTopologyContext() {
  const loadTopology = useCallback(async ({ id }) => {
    try {
      const nextTopology = await api.getTopology({ id })

      return nextTopology
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e)
      throw e
    }
  }, [])

  return useMemo(() => ({
    loadTopology,
  }), [
    loadTopology,
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
