import React, {
  useState,
  useMemo,
  useContext,
  useCallback,
} from 'react'

type Node = {
  id: number,
  latitude: number,
  longitude: number,
}

type ContextProps = {
  visibleNodes: Node[],
  setVisibleNodes: Function,
  loadNodes: Function,
}

const NodesContext = React.createContext<ContextProps | undefined>(undefined)

function useNodesContext() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [currentNodes, setCurrentNodes] = useState<number[]>([])

  const loadNodes = useCallback(() => {
    setNodes([
      {
        id: 1,
        latitude: 20.15952,
        longitude: 44.93545,
      },
      {
        id: 2,
        latitude: 20.15852,
        longitude: 44.94545,
      },
      {
        id: 3,
        latitude: 20.18952,
        longitude: 44.91545,
      },
      {
        id: 4,
        latitude: 20.19952,
        longitude: 44.92545,
      },
      {
        id: 5,
        latitude: 60.15952,
        longitude: 24.93545,
      },
      {
        id: 6,
        latitude: 60.15852,
        longitude: 24.94545,
      },
      {
        id: 7,
        latitude: 60.18952,
        longitude: 24.91545,
      },
      {
        id: 8,
        latitude: 60.19952,
        longitude: 24.92545,
      },
      {
        id: 9,
        latitude: 60.17952,
        longitude: 24.92545,
      },
      {
        id: 10,
        latitude: 30.15952,
        longitude: 54.93545,
      },
      {
        id: 11,
        latitude: 30.15852,
        longitude: 54.94545,
      },
    ])
  }, [])

  const nodeSet = useMemo(() => new Set<number>(currentNodes), [currentNodes])
  const visibleNodes = useMemo(() => nodes.filter(({ id }) => nodeSet.has(id)), [nodes, nodeSet])

  const setVisibleNodes = useCallback((nextNodes) => {
    const nextNodeSet = new Set<number>(nextNodes)

    setCurrentNodes([...nextNodeSet])
  }, [])

  return useMemo(() => ({
    visibleNodes,
    setVisibleNodes,
    loadNodes,
  }), [
    visibleNodes,
    setVisibleNodes,
    loadNodes,
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
