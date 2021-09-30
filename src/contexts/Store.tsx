import React, {
  useMemo, useContext, useCallback, useReducer, useRef,
} from 'react'
import { schema, normalize, denormalize } from 'normalizr'
import mergeWith from 'lodash/mergeWith'
import * as trackerApi from '../utils/api/tracker'
import * as streamrApi from '../utils/api/streamr'
import * as mapboxApi from '../utils/api/mapbox'
import { getEnvironment } from '../utils/config'
import { SearchResult } from '../utils/api/streamr'

const locationSchema = new schema.Entity('locations')
const locationsSchema = [locationSchema]
const nodeSchema = new schema.Entity('nodes', {
  location: locationSchema,
})
const nodesSchema = [nodeSchema]
const streamSchema = new schema.Entity('streams')
const searchResultSchema = new schema.Entity('searchResults')
const searchResultsSchema = [searchResultSchema]

export enum ActiveRoute {
  Network = 'network',
  Stream = 'stream'
}

export enum ActiveView {
  Map = 'map',
  List = 'list',
}

export type Topology = Record<string, string[]>

export enum ConnectionsMode {
  Auto = 'auto',
  Always = 'always',
  Off = 'off',
}

type Store = {
  env: string | undefined
  activeRoute: ActiveRoute
  activeView: ActiveView
  search: string
  searchResults: Array<SearchResult>
  nodes: string[]
  trackers: string[]
  fetchedLocations: string[],
  latencies: trackerApi.Topology
  streamId: string | undefined
  activeNodeId: string | undefined
  entities: { [key: string]: any } // eslint-disable-line @typescript-eslint/no-explicit-any
  showConnections: ConnectionsMode
  updateMap: boolean,
}

type SetTopology = {
  latencies: trackerApi.Topology,
  updateMap?: boolean,
}

type ContextProps = {
  env: string | undefined
  activeRoute: ActiveRoute
  setActiveRoute: (activeRoute: ActiveRoute) => void
  activeView: ActiveView
  setActiveView: (activeView: ActiveView) => void
  search: string
  updateSearch: (search: string) => void
  searchResults: Array<SearchResult>
  addSearchResults: (results: Array<SearchResult>) => void
  resetSearchResults: () => void
  nodes: trackerApi.Node[]
  setNodes: (nodes: trackerApi.Node[]) => void
  trackers: string[]
  setTrackers: (trackers: string[]) => void
  updateLocations: (locations: mapboxApi.Location[]) => void
  topology: Topology
  showConnections: ConnectionsMode
  toggleShowConnections: () => void
  latencies: trackerApi.Topology
  setTopology: (params: SetTopology) => void
  setActiveNodeId: (activeNodeId?: string) => void
  visibleNodes: trackerApi.Node[]
  activeNode: trackerApi.Node | undefined
  streamId: string | undefined
  stream: streamrApi.Stream | undefined
  setStream: (stream: streamrApi.Stream | undefined) => void
  store: Store
  resetStore: Function,
  updateMap: boolean,
}

const StoreContext = React.createContext<ContextProps | undefined>(undefined)

const getInitialState = (): Store => ({
  env: getEnvironment(),
  activeRoute: ActiveRoute.Network,
  activeView: ActiveView.Map,
  search: '',
  searchResults: [],
  nodes: [],
  trackers: [],
  fetchedLocations: [],
  latencies: {},
  streamId: undefined,
  activeNodeId: undefined,
  entities: {
    nodes: {},
    streams: {},
    searchResults: {},
    locations: {},
  },
  showConnections: ConnectionsMode.Auto,
  updateMap: false,
})

type Action =
  | { type: 'setTrackers'; trackers: string[] }
  | { type: 'setNodes'; nodes: string[] }
  | { type: 'addFetchedLocations'; locations: string[] }
  | { type: 'updateEntities'; entities: { [key: string]: any } } // eslint-disable-line @typescript-eslint/no-explicit-any
  | { type: 'setTopology'; latencies: trackerApi.Topology, updateMap: boolean }
  | { type: 'setActiveNode'; activeNodeId: string | undefined }
  | { type: 'setStream'; streamId: string | undefined }
  | { type: 'setActiveRoute'; activeRoute: ActiveRoute }
  | { type: 'setActiveView'; activeView: ActiveView }
  | { type: 'toggleShowConnections' }
  | { type: 'updateSearch'; search: string }
  | { type: 'addSearchResults'; ids: Array<any> } // eslint-disable-line @typescript-eslint/no-explicit-any
  | { type: 'resetSearchResults' }
  | { type: 'reset' }

const reducer = (state: Store, action: Action) => {
  switch (action.type) {
    case 'setTrackers': {
      return {
        ...state,
        trackers: action.trackers,
      }
    }

    case 'setNodes': {
      const nextNodes = new Set([...action.nodes])

      return {
        ...state,
        nodes: [...nextNodes],
      }
    }

    case 'addFetchedLocations': {
      const nextLocations = new Set([...state.fetchedLocations, ...action.locations])

      return {
        ...state,
        fetchedLocations: [...nextLocations],
      }
    }

    case 'updateEntities': {
      const entities = {
        ...action.entities,
      }

      // filter out locations that have been fetched already
      if (entities.locations) {
        const keys = Object.keys(entities.locations)

        const nextLocations: Record<string, mapboxApi.Location> = {}
        for (let i = 0; i < keys.length; ++i) {
          const { isReverseGeoCoded } = state.entities.locations[keys[i]] || {}

          if (!isReverseGeoCoded) {
            nextLocations[keys[i]] = {
              ...entities.locations[keys[i]],
            }
          }
        }

        entities.locations = nextLocations
      }

      return {
        ...state,
        entities: mergeWith({}, state.entities, entities),
      }
    }

    case 'setTopology': {
      return {
        ...state,
        latencies: action.latencies,
        updateMap: action.updateMap,
      }
    }

    case 'setActiveNode': {
      return {
        ...state,
        activeNodeId: action.activeNodeId,
      }
    }

    case 'setStream': {
      return {
        ...state,
        streamId: action.streamId,
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
        showConnections:
          state.showConnections !== ConnectionsMode.Off
            ? ConnectionsMode.Off
            : ConnectionsMode.Always,
      }
    }

    case 'setActiveRoute': {
      return {
        ...state,
        activeRoute: action.activeRoute,
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
      const nextResults = new Set([...state.searchResults, ...action.ids])

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

  const setNodes = useCallback(
    (nodes: trackerApi.Node[]) => {
      const { result: nextNodes, entities } = normalize(nodes, nodesSchema)

      dispatch({
        type: 'updateEntities',
        entities,
      })
      dispatch({
        type: 'setNodes',
        nodes: nextNodes,
      })
    },
    [dispatch],
  )

  const updateLocations = useCallback(
    (locations: mapboxApi.Location[]) => {
      const { result: nextLocations, entities } = normalize(locations, locationsSchema)

      dispatch({
        type: 'updateEntities',
        entities,
      })
      dispatch({
        type: 'addFetchedLocations',
        locations: nextLocations,
      })
    },
    [dispatch],
  )

  const setTrackers = useCallback(
    (trackers: string[]) => {
      dispatch({
        type: 'setTrackers',
        trackers,
      })
    },
    [dispatch],
  )

  const setTopology = useCallback(
    ({ latencies, updateMap }: SetTopology) => {
      dispatch({
        type: 'setTopology',
        latencies,
        updateMap: !!updateMap,
      })
    },
    [dispatch],
  )

  const setActiveNodeId = useCallback(
    (activeNodeId?: string) => {
      dispatch({
        type: 'setActiveNode',
        activeNodeId,
      })
    },
    [dispatch],
  )

  const setStream = useCallback(
    (stream: streamrApi.Stream | undefined) => {
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
    },
    [dispatch],
  )

  const setActiveRoute = useCallback((activeRoute: ActiveRoute) => {
    dispatch({
      type: 'setActiveRoute',
      activeRoute,
    })
  }, [])

  const setActiveView = useCallback((activeView: ActiveView) => {
    dispatch({
      type: 'setActiveView',
      activeView,
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

  const updateSearch = useCallback(
    (search: string) => {
      dispatch({
        type: 'updateSearch',
        search,
      })
    },
    [dispatch],
  )

  const resetSearchResults = useCallback(() => {
    dispatch({
      type: 'resetSearchResults',
    })
  }, [dispatch])

  const addSearchResults = useCallback(
    (results: Array<SearchResult>) => {
      const { result: ids, entities } = normalize(results, searchResultsSchema)

      dispatch({
        type: 'updateEntities',
        entities,
      })

      dispatch({
        type: 'addSearchResults',
        ids,
      })
    },
    [dispatch],
  )

  const {
    env,
    activeRoute,
    activeView,
    search,
    searchResults: searchResultIds,
    activeNodeId,
    streamId,
    nodes: nodeIds,
    trackers,
    fetchedLocations,
    latencies,
    entities,
    showConnections,
    updateMap,
  } = store

  // Use ref to avoid unnecessary redraws when entities update
  const entitiesRef = useRef(entities)
  entitiesRef.current = entities

  const nodes = useMemo(() => (
    denormalize(nodeIds, nodesSchema, entitiesRef.current) || []
  ), [nodeIds])

  const topology = useMemo(
    () => {
      const result: Topology = {}

      const keys = Object.keys(latencies || {})

      for (let i = 0; i < keys.length; ++i) {
        result[keys[i]] = Object.keys(latencies[keys[i]])
      }

      return result
    },
    [latencies],
  )

  const visibleNodes = useMemo(
    () => {
      const newNodes = denormalize(Object.keys(topology), nodesSchema, entitiesRef.current) || []
      // Hotfix to filter out undefined entries, which may appear due to inconsistencies in tracker output
      return newNodes.filter(Boolean)
    },
    // Update visible nodes when topology and locations change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [topology, fetchedLocations],
  )

  const activeNode = useMemo(() => denormalize(activeNodeId, nodeSchema, entitiesRef.current),
    // Update active node also when nodes change so that we will update
    // activeNode after activeNodeId was set but nodes were not loaded yet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeNodeId, nodes],
  )

  const stream = useMemo(() => denormalize(streamId, streamSchema, entitiesRef.current), [streamId])

  const searchResults = useMemo(
    () => denormalize(searchResultIds, searchResultsSchema, entitiesRef.current) || [],
    [searchResultIds],
  )

  return useMemo(
    () => ({
      env,
      activeRoute,
      setActiveRoute,
      activeView,
      setActiveView,
      search,
      updateSearch,
      searchResults,
      addSearchResults,
      resetSearchResults,
      nodes,
      setNodes,
      trackers,
      setTrackers,
      updateLocations,
      topology,
      latencies,
      setTopology,
      visibleNodes,
      showConnections,
      toggleShowConnections,
      activeNode,
      setActiveNodeId,
      streamId,
      stream,
      setStream,
      store,
      resetStore,
      updateMap,
    }),
    [
      env,
      activeRoute,
      setActiveRoute,
      activeView,
      setActiveView,
      search,
      updateSearch,
      searchResults,
      addSearchResults,
      resetSearchResults,
      nodes,
      setNodes,
      trackers,
      setTrackers,
      updateLocations,
      topology,
      latencies,
      setTopology,
      visibleNodes,
      showConnections,
      toggleShowConnections,
      activeNode,
      setActiveNodeId,
      streamId,
      stream,
      setStream,
      store,
      resetStore,
      updateMap,
    ],
  )
}

interface Props {
  children: React.ReactNode
}

const StoreProvider = ({ children }: Props) => (
  <StoreContext.Provider value={useStoreContext()}>{children || null}</StoreContext.Provider>
)

const useStore = () => {
  const context = useContext(StoreContext)

  if (!context) {
    throw new Error('StoreContext must be inside a Provider with a value')
  }

  return context
}

export { StoreProvider as Provider, StoreContext as Context, useStore }
