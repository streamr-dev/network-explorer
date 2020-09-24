import React, {
  useState,
  useMemo,
  useContext,
  useCallback,
  useEffect,
} from 'react'

import * as api from '../utils/api/tracker'
import { usePending } from './Pending'
import { useIsMounted } from '../hooks/useIsMounted'

type ContextProps = {
  nodes: api.Node[],
  setNodes: (nodes: api.Node[]) => void,
  updateTrackers: () => Promise<void>,
}

const NodesContext = React.createContext<ContextProps | undefined>(undefined)

function useNodesContext() {
  const [trackers, setTrackers] = useState<string[]>([])
  const [nodes, setNodes] = useState<api.Node[]>([])
  const { wrap } = usePending('nodes')
  const isMounted = useIsMounted()

  const updateTrackers = useCallback(async () => {
    const nextTrackers = await api.getTrackers()

    if (!isMounted()) { return }

    setNodes([])
    setTrackers(nextTrackers)
  }, [isMounted])

  const loadNodes = useCallback(async (url: string) => {
    const nextNodes = await api.getNodes(url)

    if (!isMounted()) { return }

    setNodes((prevNodes) => ([
      ...prevNodes,
      ...nextNodes,
    ]))
  }, [isMounted])

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
    nodes,
    setNodes,
    updateTrackers,
  }), [
    nodes,
    setNodes,
    updateTrackers,
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
