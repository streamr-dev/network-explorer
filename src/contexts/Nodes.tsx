import React, {
  useState,
  useMemo,
  useContext,
  useCallback,
  useEffect,
} from 'react'

import * as api from '../utils/api'
import { useLoading } from './Loading'

type ContextProps = {
  visibleNodes: api.Node[],
  setVisibleNodes: Function,
  updateTrackers: Function,
}

const NodesContext = React.createContext<ContextProps | undefined>(undefined)

function useNodesContext() {
  const [trackers, setTrackers] = useState<string[]>([])
  const [nodes, setNodes] = useState<api.Node[]>([])
  const [currentNodes, setCurrentNodes] = useState<string[]>([])
  const { setLoading } = useLoading()

  const updateTrackers = useCallback(async () => {
    const nextTrackers = await api.getTrackers()

    setNodes([])
    setCurrentNodes([])
    setTrackers(nextTrackers)
  }, [])

  const loadNodes = useCallback(async (url: string) => {
    const nextNodes = await api.getNodes(url)

    setNodes((prevNodes) => ([
      ...prevNodes,
      ...nextNodes,
    ]))
  }, [])

  useEffect(() => {
    const doLoadTrackers = async () => {
      await Promise.all(trackers.map((url) => loadNodes(url)))
    }

    if (trackers && trackers.length > 0) {
      setLoading(true)

      doLoadTrackers().then(() => {
        setLoading(false)
      })
    }
  }, [trackers, loadNodes, setLoading])

  const nodeSet = useMemo(() => new Set<string>(currentNodes), [currentNodes])
  const visibleNodes: api.Node[] = useMemo(() => (
    nodes.filter(({ id }) => nodeSet.has(id))
  ), [nodes, nodeSet])

  const setVisibleNodes = useCallback((nextNodes) => {
    const nextNodeSet = new Set<string>(nextNodes)

    setCurrentNodes([...nextNodeSet])
  }, [])

  return useMemo(() => ({
    visibleNodes,
    setVisibleNodes,
    updateTrackers,
  }), [
    visibleNodes,
    setVisibleNodes,
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
