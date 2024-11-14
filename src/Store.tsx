import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { useParams } from 'react-router-dom'
import { DefaultViewState } from './consts'
import { useGlobalKeyDownEffect, useMap, useStreamIdParam } from './hooks'
import { ActiveView, ConnectionsMode, OperatorNode } from './types'
import { useHud } from './utils'
import { useOperatorNodesForStreamQuery } from './utils/nodes'
import { truncate } from './utils/text'
import { DEFAULT_CHAIN_ID, SUPPORTED_CHAIN_IDS } from './utils/chains'

interface Store {
  chainId: number
  activeView: ActiveView
  connectionsMode: ConnectionsMode
  displaySearchPhrase: string
  invalidateLocationParamKey(): void
  invalidateNodeIdParamKey(): void
  locationParamKey: number
  nodeIdParamKey: number
  publishers: Record<string, string | undefined>
  searchPhrase: string
  selectedNode: OperatorNode | null
  setChainId(value: number): void
  setActiveView(value: ActiveView): void
  setConnectionsMode: Dispatch<SetStateAction<ConnectionsMode>>
  setPublishers: Dispatch<SetStateAction<Record<string, string | undefined>>>
  setSearchPhrase(value: string): void
}

const StoreContext = createContext<Store>({
  chainId: DEFAULT_CHAIN_ID,
  activeView: ActiveView.Map,
  connectionsMode: ConnectionsMode.Auto,
  displaySearchPhrase: '',
  invalidateLocationParamKey: () => {},
  invalidateNodeIdParamKey: () => {},
  locationParamKey: -1,
  nodeIdParamKey: -1,
  publishers: {},
  searchPhrase: '',
  selectedNode: null,
  setChainId: () => {},
  setActiveView: () => {},
  setConnectionsMode: () => {},
  setPublishers: () => ({}),
  setSearchPhrase: () => {},
})

interface StoreProviderProps {
  children?: ReactNode
}

// Add a constant for the storage key
const CHAIN_ID_STORAGE_KEY = 'network-explorer-chain-id'

export function StoreProvider(props: StoreProviderProps) {
  const selectedNode = useNodeByNodeIdParam()

  const [locationParamKey, invalidateLocationParamKey] = useReducer((x: number) => x + 1, 0)

  const [nodeIdParamKey, invalidateNodeIdParamKey] = useReducer((x: number) => x + 1, 0)

  const map = useMap()

  useGlobalKeyDownEffect('0', () => {
    map?.flyTo({
      center: [DefaultViewState.longitude, DefaultViewState.latitude],
      zoom: DefaultViewState.zoom,
    })
  })

  // Initialize chainId from localStorage
  const [chainId, setChainId] = useState(() => {
    const stored = localStorage.getItem(CHAIN_ID_STORAGE_KEY)

    // Check if the stored value is a valid network chainId
    if (stored && SUPPORTED_CHAIN_IDS.includes(parseInt(stored, 10))) {
      return parseInt(stored, 10)
    }

    return DEFAULT_CHAIN_ID
  })

  const [activeView, setActiveView] = useState<ActiveView>(ActiveView.Map)

  const [rawSearchPhrase, setRawSearchPhrase] = useState('')

  const [displaySearchPhrase, setDisplaySearchPhrase] = useState('')

  const setSearchPhrase = useCallback((value: string) => {
    setRawSearchPhrase(value)

    setDisplaySearchPhrase(truncate(value))
  }, [])

  const [publishers, setPublishers] = useState<Record<string, string | undefined>>({})

  const [connectionsMode, setConnectionsMode] = useState(ConnectionsMode.Auto)

  const { showConnections } = useHud()

  useEffect(
    function applyShowConnectionsParam() {
      if (showConnections) {
        setConnectionsMode(ConnectionsMode.Always)
      }
    },
    [showConnections],
  )

  // Persist chainId changes
  useEffect(() => {
    localStorage.setItem(CHAIN_ID_STORAGE_KEY, chainId.toString())
    console.log('Store: Chain ID changed:', chainId)
  }, [chainId])

  return (
    <StoreContext.Provider
      {...props}
      value={{
        chainId,
        activeView,
        connectionsMode,
        displaySearchPhrase,
        invalidateLocationParamKey,
        invalidateNodeIdParamKey,
        locationParamKey,
        nodeIdParamKey,
        publishers,
        searchPhrase: rawSearchPhrase,
        selectedNode,
        setChainId,
        setActiveView,
        setConnectionsMode,
        setPublishers,
        setSearchPhrase,
      }}
    />
  )
}

export function useStore() {
  return useContext(StoreContext)
}

function useNodeByNodeIdParam() {
  const streamId = useStreamIdParam()

  const { data: nodes } = useOperatorNodesForStreamQuery(streamId || undefined)

  const { nodeId: activeNodeId = null } = useParams<{ nodeId: string }>()

  return useMemo(
    function findNodeById() {
      if (!nodes || !activeNodeId) {
        return null
      }

      return nodes.find(({ id }) => id === activeNodeId) || null
    },
    [activeNodeId, nodes],
  )
}
