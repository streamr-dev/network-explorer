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
import { DefaultViewState } from './consts'
import { useGlobalKeyDownEffect, useMap } from './hooks'
import { ActiveView, ConnectionsMode, OperatorNode } from './types'
import { useHud } from './utils'
import { useOperatorNodesForStreamQuery } from './utils/nodes'
import { truncate } from './utils/text'
import { DEFAULT_CHAIN_ID, getPersistedChainId, persistChainId } from './utils/chains'

interface UrlParams {
  nodeId: string | null
  streamId: string | null
}

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
  urlParams: UrlParams
  setUrlParams(value: UrlParams): void
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
  urlParams: { nodeId: null, streamId: null },
  setUrlParams: () => {},
  setChainId: () => {},
  setActiveView: () => {},
  setConnectionsMode: () => {},
  setPublishers: () => ({}),
  setSearchPhrase: () => {},
})

interface StoreProviderProps {
  children?: ReactNode
}

export function StoreProvider(props: StoreProviderProps) {
  const [urlParams, setUrlParams] = useState<UrlParams>({
    nodeId: null,
    streamId: null,
  })

  const [locationParamKey, invalidateLocationParamKey] = useReducer((x: number) => x + 1, 0)

  const [nodeIdParamKey, invalidateNodeIdParamKey] = useReducer((x: number) => x + 1, 0)

  const map = useMap()

  useGlobalKeyDownEffect('0', () => {
    map?.flyTo({
      center: [DefaultViewState.longitude, DefaultViewState.latitude],
      zoom: DefaultViewState.zoom,
    })
  })

  const [chainId, setChainId] = useState(getPersistedChainId())

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

  useEffect(() => {
    persistChainId(chainId)
  }, [chainId])

  const { streamId, nodeId: activeNodeId } = urlParams
  const { data: nodes } = useOperatorNodesForStreamQuery(chainId, streamId || undefined)

  const selectedNode = useMemo(
    function findNodeById() {
      if (!nodes || !activeNodeId) {
        return null
      }

      return nodes.find(({ id }) => id === activeNodeId) || null
    },
    [activeNodeId, nodes],
  )

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
        urlParams,
        setUrlParams,
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
