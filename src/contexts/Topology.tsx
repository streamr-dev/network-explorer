import React, {
  useCallback,
  useMemo,
  useContext,
  useState,
} from 'react'

import { usePending } from './Pending'
import { useNodes } from './Nodes'
import { useIsMounted } from '../hooks/useIsMounted'
import * as api from '../utils/api/tracker'

type ContextProps = {
  loadTopology: Function,
  resetTopology: Function,
  visibleNodes: api.Node[],
  nodeConnections: Array<string[]>,
  setTopology: Function,
  activeNode: api.Node | undefined,
  setActiveNodeId: Function,
}

const TopologyContext = React.createContext<ContextProps | undefined>(undefined)

function useTopologyContext() {
  const [activeNodeId, setActiveNodeId] = useState<string | undefined>(undefined)
  const [topology, setTopology] = useState<api.Topology>({})
  const { nodes } = useNodes()
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
    setActiveNodeId(undefined)
  }, [setTopology, setActiveNodeId])

  const nodeSet = useMemo(() => new Set<string>(Object.keys(topology)), [topology])
  const visibleNodes: api.Node[] = useMemo(() => (
    nodes.filter(({ id }) => nodeSet.has(id))
  ), [nodes, nodeSet])

  // Convert topology to a list of node connection pairs
  const nodeConnections = useMemo(() => (
    Object.keys(topology).flatMap((key) => {
      const nodeList = topology[key]
      return nodeList.map((n) => [key, n])
    })
  ), [topology])

  const activeNode = useMemo(() => (
    visibleNodes.find(({ id }) => activeNodeId === id)
  ), [visibleNodes, activeNodeId])

  return useMemo(() => ({
    loadTopology,
    resetTopology,
    visibleNodes,
    nodeConnections,
    setTopology,
    activeNode,
    setActiveNodeId,
  }), [
    loadTopology,
    resetTopology,
    visibleNodes,
    nodeConnections,
    setTopology,
    activeNode,
    setActiveNodeId,
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
