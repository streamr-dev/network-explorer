import React, {
  useState,
  useMemo,
  useContext,
  useCallback,
  useEffect,
} from 'react'

import * as api from '../utils/api'
import { usePending } from './Pending'

type ContextProps = {
  nodes: api.Node[],
  visibleNodes: api.Node[],
  nodeConnections: Array<string[]>,
  updateTrackers: Function,
  setTopology: Function,
}

const NodesContext = React.createContext<ContextProps | undefined>(undefined)

function useNodesContext() {
  const [trackers, setTrackers] = useState<string[]>([])
  const [nodes, setNodes] = useState<api.Node[]>([])
  const [topology, setTopology] = useState<api.Topology>({})
  const { start, end } = usePending('nodes')

  const updateTrackers = useCallback(async () => {
    const nextTrackers = await api.getTrackers()

    setNodes([])
    setTopology({})
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
      start()

      doLoadTrackers().then(() => {
        end()
      })
    }
  }, [trackers, loadNodes, start, end])

  const nodeSet = useMemo(() => new Set<string>(Object.keys(topology)), [topology])
  const visibleNodes: api.Node[] = useMemo(() => (
    nodes.filter(({ id }) => nodeSet.has(id))
  ), [nodes, nodeSet])

  const nodeConnections: Array<string[]> = useMemo(() => Object.values(topology), [topology])

  return useMemo(() => ({
    nodes,
    visibleNodes,
    nodeConnections,
    updateTrackers,
    setTopology,
  }), [
    nodes,
    visibleNodes,
    nodeConnections,
    updateTrackers,
    setTopology,
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
