import React, {
  useMemo,
  useContext,
  useCallback,
  useReducer,
  useRef,
} from 'react'
import { schema, normalize, denormalize } from 'normalizr'
import mergeWith from 'lodash/mergeWith'
import * as trackerApi from '../utils/api/tracker'
import * as streamrApi from '../utils/api/streamr'
import { getEnvironment } from '../utils/config'
import { SearchResult } from '../utils/api/streamr'

const nodeSchema = new schema.Entity('nodes')
const nodesSchema = [nodeSchema]
const streamSchema = new schema.Entity('streams')
const searchResultSchema = new schema.Entity('searchResults')
const searchResultsSchema = [searchResultSchema]

export enum ActiveView {
  Map = 'map',
  List = 'list'
}

export type Topology = Record<string, string[]>

export enum ConnectionsMode {
  Auto = 'auto',
  Always = 'always',
  Off = 'off',
}

type Store = {
  env: string | undefined,
  activeView: ActiveView,
  search: string,
  searchResults: Array<SearchResult>,
  nodes: string[],
  trackers: string[],
  latencies: trackerApi.Topology,
  streamId: string | undefined,
  activeNodeId: string | undefined,
  activeLocationId: string | undefined,
  entities: { [key: string]: any }, // eslint-disable-line @typescript-eslint/no-explicit-any
  showConnections: ConnectionsMode,
}

type ContextProps = {
  env: string | undefined,
  activeView: ActiveView,
  toggleActiveView: () => void,
  setActiveView: (activeView: ActiveView) => void,
  search: string,
  updateSearch: (search: string) => void,
  searchResults: Array<SearchResult>,
  addSearchResults: (results: Array<SearchResult>) => void,
  resetSearchResults: () => void,
  nodes: trackerApi.Node[],
  addNodes: (nodes: trackerApi.Node[]) => void,
  trackers: string[],
  setTrackers: (trackers: string[]) => void,
  topology: Topology,
  showConnections: ConnectionsMode
  toggleShowConnections: () => void,
  latencies: trackerApi.Topology,
  setTopology: (topology: trackerApi.Topology) => void,
  setActiveNodeId: (activeNodeId?: string) => void,
  setActiveLocationId: (activeLocationId?: string) => void,
  visibleNodes: trackerApi.Node[],
  activeNode: trackerApi.Node | undefined,
  activeLocation: SearchResult,
  streamId: string | undefined,
  stream: streamrApi.Stream | undefined,
  setStream: (stream: streamrApi.Stream | undefined) => void,
  store: Store,
  resetStore: Function,
}

const StoreContext = React.createContext<ContextProps | undefined>(undefined)

const getInitialState = (): Store => ({
  env: getEnvironment(),
  activeView: ActiveView.Map,
  search: '',
  searchResults: [],
  nodes: [],
  trackers: [],
  latencies: {},
  streamId: undefined,
  activeNodeId: undefined,
  activeLocationId: undefined,
  entities: {
    nodes: {},
    streams: {},
    searchResults: {},
  },
  showConnections: ConnectionsMode.Auto,
})

type Action =
 | { type: 'setTrackers', trackers: string[] }
 | { type: 'addNodes', nodes: string[] }
 | { type: 'updateEntities', entities: { [key: string]: any } } // eslint-disable-line @typescript-eslint/no-explicit-any
 | { type: 'setTopology', latencies: trackerApi.Topology, }
 | { type: 'setActiveNode', activeNodeId: string | undefined }
 | { type: 'setActiveLocation', activeLocationId: string | undefined }
 | { type: 'setStream', streamId: string | undefined }
 | { type: 'setActiveView', activeView: ActiveView }
 | { type: 'toggleActiveView' }
 | { type: 'toggleShowConnections' }
 | { type: 'updateSearch', search: string }
 | { type: 'addSearchResults', ids: Array<any> } // eslint-disable-line @typescript-eslint/no-explicit-any
 | { type: 'resetSearchResults' }
 | { type: 'reset' }

const reducer = (state: Store, action: Action) => {
  switch (action.type) {
    case 'setTrackers': {
      return {
        ...state,
        nodes: [],
        trackers: action.trackers,
      }
    }

    case 'addNodes': {
      const nextNodes = new Set([
        ...state.nodes,
        ...action.nodes,
      ])

      return {
        ...state,
        nodes: [...nextNodes],
      }
    }

    case 'updateEntities': {
      return {
        ...state,
        entities: mergeWith({}, state.entities, action.entities),
      }
    }

    case 'setTopology': {
      return {
        ...state,
        latencies: action.latencies,
      }
    }

    case 'setActiveNode': {
      return {
        ...state,
        activeNodeId: action.activeNodeId,
      }
    }

    case 'setActiveLocation': {
      return {
        ...state,
        activeLocationId: action.activeLocationId,
      }
    }

    case 'setStream': {
      return {
        ...state,
        streamId: action.streamId,
      }
    }

    case 'toggleActiveView': {
      return {
        ...state,
        activeView: state.activeView === ActiveView.Map ? ActiveView.List : ActiveView.Map,
      }
    }

    case 'toggleShowConnections': {
      // handle initial special case
      if (state.showConnections === ConnectionsMode.Auto) {
        return {
          ...state,
          showConnections: state.streamId ? ConnectionsMode.Off : ConnectionsMode.Always,
        }
      }

      return {
        ...state,
        showConnections: (state.showConnections !== ConnectionsMode.Off) ?
          ConnectionsMode.Off :
          ConnectionsMode.Always,
      }
    }

    case 'setActiveView': {
      return {
        ...state,
        activeView: action.activeView,
      }
    }

    case 'updateSearch': {
      return {
        ...state,
        search: action.search,
      }
    }

    case 'addSearchResults': {
      const nextResults = new Set([
        ...state.searchResults,
        ...action.ids,
      ])

      return {
        ...state,
        searchResults: [...nextResults],
      }
    }

    case 'resetSearchResults': {
      return {
        ...state,
        searchResults: [],
      }
    }

    case 'reset': {
      return {
        ...getInitialState(),
      }
    }
  }

  return state
}

function useStoreContext() {
  const [store, dispatch] = useReducer(reducer, getInitialState())

  const addNodes = useCallback((nodes: trackerApi.Node[]) => {
    const { result: nextNodes, entities } = normalize(nodes, nodesSchema)

    dispatch({
      type: 'updateEntities',
      entities,
    })
    dispatch({
      type: 'addNodes',
      nodes: nextNodes,
    })
  }, [dispatch])

  const setTrackers = useCallback((trackers: string[]) => {
    dispatch({
      type: 'setTrackers',
      trackers,
    })
  }, [dispatch])

  const setTopology = useCallback((latencies: trackerApi.Topology) => {
    dispatch({
      type: 'setTopology',
      latencies,
    })
  }, [dispatch])

  const setActiveNodeId = useCallback((activeNodeId?: string) => {
    dispatch({
      type: 'setActiveNode',
      activeNodeId,
    })
  }, [dispatch])

  const setActiveLocationId = useCallback((activeLocationId?: string) => {
    dispatch({
      type: 'setActiveLocation',
      activeLocationId,
    })
  }, [dispatch])

  const setStream = useCallback((stream: streamrApi.Stream | undefined) => {
    if (stream) {
      const { entities } = normalize(stream, streamSchema)

      dispatch({
        type: 'updateEntities',
        entities,
      })
    }

    dispatch({
      type: 'setStream',
      streamId: stream && stream.id,
    })
  }, [dispatch])

  const setActiveView = useCallback((activeView: ActiveView) => {
    dispatch({
      type: 'setActiveView',
      activeView,
    })
  }, [])

  const toggleActiveView = useCallback(() => {
    dispatch({
      type: 'toggleActiveView',
    })
  }, [])

  const toggleShowConnections = useCallback(() => {
    dispatch({
      type: 'toggleShowConnections',
    })
  }, [])

  const resetStore = useCallback(() => {
    dispatch({
      type: 'reset',
    })
  }, [dispatch])

  const updateSearch = useCallback((search: string) => {
    dispatch({
      type: 'updateSearch',
      search,
    })
  }, [dispatch])

  const resetSearchResults = useCallback(() => {
    dispatch({
      type: 'resetSearchResults',
    })
  }, [dispatch])

  const addSearchResults = useCallback((results: Array<SearchResult>) => {
    const { result: ids, entities } = normalize(results, searchResultsSchema)

    dispatch({
      type: 'updateEntities',
      entities,
    })

    dispatch({
      type: 'addSearchResults',
      ids,
    })
  }, [dispatch])

  const {
    env,
    activeView,
    search,
    searchResults: searchResultIds,
    activeNodeId,
    activeLocationId,
    streamId,
    nodes: nodeIds,
    trackers,
    latencies,
    entities,
    showConnections,
  } = store

  // Use ref to avoid unnecessary redraws when entities update
  const entitiesRef = useRef(entities)
  entitiesRef.current = entities

  const nodes = useMemo(() => (
    denormalize(nodeIds, nodesSchema, entitiesRef.current) || []
  ), [nodeIds])

  const topology = useMemo(() => (
    Object.keys(latencies || {}).reduce((flattened, nodeId) => ({
      ...flattened,
      [nodeId]: Object.keys(latencies[nodeId]),
    }), {})
  ), [latencies])

  const visibleNodes = useMemo(() => (
    denormalize(Object.keys(topology), nodesSchema, entitiesRef.current) || []
  ), [topology])

  const activeNode = useMemo(() => (
    denormalize(activeNodeId, nodeSchema, entitiesRef.current)
  ), [activeNodeId])

  const activeLocation = useMemo(() => (
    denormalize(activeLocationId, searchResultSchema, entitiesRef.current)
  ), [activeLocationId])

  const stream = useMemo(() => (
    denormalize(streamId, streamSchema, entitiesRef.current)
  ), [streamId])

  const searchResults = useMemo(() => (
    denormalize(searchResultIds, searchResultsSchema, entitiesRef.current) || []
  ), [searchResultIds])

  return useMemo(() => ({
    env,
    activeView,
    toggleActiveView,
    setActiveView,
    search,
    updateSearch,
    searchResults,
    addSearchResults,
    resetSearchResults,
    nodes,
    addNodes,
    trackers,
    setTrackers,
    topology,
    latencies,
    setTopology,
    visibleNodes,
    showConnections,
    toggleShowConnections,
    activeNode,
    activeLocation,
    setActiveNodeId,
    setActiveLocationId,
    streamId,
    stream,
    setStream,
    store,
    resetStore,
  }), [
    env,
    activeView,
    toggleActiveView,
    setActiveView,
    search,
    updateSearch,
    searchResults,
    addSearchResults,
    resetSearchResults,
    nodes,
    addNodes,
    trackers,
    setTrackers,
    topology,
    latencies,
    setTopology,
    visibleNodes,
    showConnections,
    toggleShowConnections,
    activeNode,
    activeLocation,
    setActiveNodeId,
    setActiveLocationId,
    streamId,
    stream,
    setStream,
    store,
    resetStore,
  ])
}

interface Props  {
  children: React.ReactNode
}

const StoreProvider = ({ children }: Props) => (
  <StoreContext.Provider value={useStoreContext()}>
    {children || null}
  </StoreContext.Provider>
)

const useStore = () => {
  const context = useContext(StoreContext)

  if (!context) {
    throw new Error('StoreContext must be inside a Provider with a value')
  }

  return context
}

export {
  StoreProvider as Provider,
  StoreContext as Context,
  useStore,
}
