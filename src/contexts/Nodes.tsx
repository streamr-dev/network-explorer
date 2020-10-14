import React, {
  useMemo,
  useContext,
  useCallback,
  useEffect,
} from 'react'

import * as api from '../utils/api/tracker'
import { usePending } from './Pending'
import { useStore } from './Store'
import useIsMounted from '../hooks/useIsMounted'

type ContextProps = {
  loadTrackers: () => Promise<void>,
}

const NodesContext = React.createContext<ContextProps | undefined>(undefined)

function useNodesContext() {
  const { trackers, setTrackers, addNodes } = useStore()
  const { wrap } = usePending('nodes')
  const isMounted = useIsMounted()

  const loadTrackers = useCallback(async () => {
    const nextTrackers = await api.getTrackers()

    if (!isMounted()) { return }

    setTrackers(nextTrackers)
  }, [isMounted, setTrackers])

  const loadNodes = useCallback(async (url: string) => {
    const nextNodes = await api.getNodes(url)

    if (!isMounted()) { return }

    addNodes(nextNodes)
  }, [isMounted, addNodes])

  const doLoadTrackers = useCallback(async (urls: string[]) => (
    wrap(async () => {
      await Promise.all(urls.map((url) => loadNodes(url)))
    })
  ), [wrap, loadNodes])

  useEffect(() => {
    if (trackers && trackers.length > 0) {
      doLoadTrackers(trackers)
    }
  }, [trackers, loadNodes, doLoadTrackers])

  return useMemo(() => ({
    loadTrackers,
  }), [
    loadTrackers,
  ])
}

interface Props  {
  children: React.ReactNode
}

const NodesProvider = ({ children }: Props) => (
  <NodesContext.Provider value={useNodesContext()}>
    {children || null}
  </NodesContext.Provider>
)

const useNodes = () => {
  const context = useContext(NodesContext)

  if (!context) {
    throw new Error('NodesContext must be inside a Provider with a value')
  }

  return context
}

export {
  NodesProvider as Provider,
  NodesContext as Context,
  useNodes,
}
