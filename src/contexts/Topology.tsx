import React, {
  useCallback,
  useMemo,
  useContext,
} from 'react'

import { usePending } from './Pending'
import { useStore } from './Store'
import useIsMounted from '../hooks/useIsMounted'
import * as api from '../utils/api/tracker'

type ContextProps = {
  loadTopology: Function,
  resetTopology: Function,
}

const TopologyContext = React.createContext<ContextProps | undefined>(undefined)

function useTopologyContext() {
  const { setTopology } = useStore()
  const { wrap: wrapTopology } = usePending('topology')
  const isMounted = useIsMounted()

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
    wrapTopology(async () => {
      const newTopology = await loadTopologyFromApi({ id: streamId })

      if (!isMounted()) { return }

      setTopology(newTopology)
    })
  ), [wrapTopology, loadTopologyFromApi, setTopology, isMounted])

  const resetTopology = useCallback(() => {
    setTopology({})
  }, [setTopology])

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
