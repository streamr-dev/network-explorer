import React, {
  useMemo, useContext, useCallback, useRef,
} from 'react'
import axios from 'axios'

import * as trackerApi from '../utils/api/tracker'
import * as streamrApi from '../utils/api/streamr'
import * as mapApi from '../utils/api/mapbox'
import { usePending } from './Pending'
import { useStore } from './Store'
import useIsMounted from '../hooks/useIsMounted'
import { useDebounced } from '../hooks/wrapCallback'
import { setEnvironment } from '../utils/config'

type ContextProps = {
  changeEnv: Function
  loadTrackers: () => Promise<void>
  loadStream: Function
  resetStream: Function
  loadTopology: Function
  resetTopology: Function
  updateSearch: Function
  loadNodeLocations: Function
}

const ControllerContext = React.createContext<ContextProps | undefined>(undefined)

function useControllerContext() {
  const {
    nodes,
    visibleNodes,
    updateLocations,
    setTrackers,
    updateSearch: updateSearchText,
    resetSearchResults,
    addSearchResults,
    setNodes,
    setTopology,
    setStream,
    resetStore,
  } = useStore()
  const { wrap: wrapNodes } = usePending('nodes')
  const { wrap: wrapTopology } = usePending('topology')
  const { wrap: wrapStreams } = usePending('streams')
  const { start: startSearch, end: endSearch } = usePending('search')
  const isMounted = useIsMounted()
  const nodesRef = useRef(visibleNodes)
  nodesRef.current = visibleNodes
  const cancelRef = useRef<undefined | Function>()

  const loadTrackers = useCallback(
    async () =>
      wrapNodes(async () => {
        const nextTrackers = await trackerApi.getTrackers()

        if (!isMounted()) {
          return undefined
        }

        setTrackers(nextTrackers)

        const nextNodes = await Promise.all(nextTrackers.map((url) => trackerApi.getNodes(url)))

        if (!isMounted()) {
          return undefined
        }

        const combinedNodes = nextNodes.flat()

        setNodes(combinedNodes)

        return combinedNodes
      }),
    [wrapNodes, isMounted, setTrackers, setNodes],
  )

  const loadStream = useCallback(
    async (streamId: string) =>
      wrapStreams(async () => {
        try {
          const nextStream = await streamrApi.getStream({ id: streamId })

          if (!isMounted()) {
            return
          }

          setStream(nextStream)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn(e)
          throw e
        }
      }),
    [wrapStreams, isMounted, setStream],
  )

  const resetStream = useCallback(() => {
    setStream(undefined)
  }, [setStream])

  const loadTopologyFromApi = useCallback(async ({ id }) => {
    try {
      const nextTopology = await trackerApi.getTopology({ id })

      return nextTopology
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e)
      throw e
    }
  }, [])

  const loadTopology = useCallback(
    async (options: { streamId?: string } = {}) =>
      wrapTopology(async () => {
        const { streamId } = options || {}

        let newTopology: trackerApi.Topology = {}
        let didChange = false

        if (streamId) {
          newTopology = await loadTopologyFromApi({ id: streamId })

          if (!isMounted()) {
            return
          }

          // Load trackers again if topology changes
          const incomingNodes = new Set(Object.keys(newTopology))
          const existingNodes = new Set(nodesRef.current.map(({ id }) => id))

          const added = new Set([...incomingNodes].filter((nodeId) => !existingNodes.has(nodeId)))
          const removed = new Set([...existingNodes].filter((nodeId) => !incomingNodes.has(nodeId)))
          didChange = !!(added.size > 0 || removed.size > 0)

          if (didChange) {
            await loadTrackers()
          }
        } else {
          const nextNodes = await loadTrackers() || []

          if (!isMounted()) {
            return
          }

          for (let i = 0; i < nextNodes.length; ++i) {
            newTopology[nextNodes[i].id] = {}
          }
        }

        setTopology({
          latencies: newTopology,
          updateMap: didChange,
        })
      }),
    [
      wrapTopology,
      loadTopologyFromApi,
      setTopology,
      loadTrackers,
      isMounted,
    ],
  )

  const loadNodeLocations = useCallback(async (targetNodes: trackerApi.Node[]) => {
    if (!targetNodes || targetNodes.length < 1) {
      return
    }

    for (let i = 0; i < targetNodes.length; ++i) {
      const { location } = targetNodes[i]

      // eslint-disable-next-line no-await-in-loop
      const { region } = await mapApi.getReversedGeocodedLocation({
        longitude: location.longitude,
        latitude: location.latitude,
      })

      if (region) {
        updateLocations([{
          ...location,
          title: region,
          isReverseGeoCoded: true,
        }])
      }
    }
  }, [updateLocations])

  const resetTopology = useCallback(() => {
    setTopology({
      latencies: {},
    })
  }, [setTopology])

  const changeEnv = useCallback(
    (env: string) => {
      setEnvironment(env)
      resetStore()
    },
    [resetStore],
  )

  const searchNodes = useCallback(
    (rawSearchString: string): streamrApi.SearchResult[] => {
      const search = rawSearchString.toLowerCase()

      return nodes
        .filter(
          ({ id, title }) =>
            id.toLowerCase().indexOf(search) >= 0 || title.toLowerCase().indexOf(search) >= 0,
        )
        .map(({ id, title }) => ({
          id,
          type: 'nodes',
          name: title,
          description: id,
        }))
    },
    [nodes],
  )

  const debouncedUpdateSearch = useDebounced(
    useCallback(
      async ({ search }: { search: string }) => {
        resetSearchResults()

        if (cancelRef.current !== undefined) {
          cancelRef.current()
          cancelRef.current = undefined
        }

        if (!search) {
          endSearch()
        } else {
          try {
            addSearchResults(searchNodes(search))

            const source = axios.CancelToken.source()

            const streamPromise = new Promise<{
              results: streamrApi.SearchResult[],
              cancelled: boolean,
            }>((resolve, reject) => {
              return streamrApi.searchStreams({
                search,
                cancelToken: source.token,
              }).then((results) => {
                resolve({
                  results,
                  cancelled: false,
                })
              }, () => resolve({
                results: [],
                cancelled: true,
              }))
            }).then(({ results: nextResults, cancelled }) => {
              if (!isMounted() || cancelled) {
                return
              }

              addSearchResults(nextResults)
            })

            const mapPromise = new Promise<{
              results: streamrApi.SearchResult[],
              cancelled: boolean,
            }>((resolve, reject) => {
              return mapApi.getLocations({
                search,
                cancelToken: source.token,
              }).then((results) => {
                resolve({
                  results,
                  cancelled: false,
                })
              }, () => resolve({
                results: [],
                cancelled: true,
              }))
            }).then(({ results: nextResults, cancelled }) => {
              if (!isMounted() || cancelled) {
                return
              }

              addSearchResults(nextResults)
            })

            const cancelPromise = new Promise<undefined>((resolve, reject) => {
              cancelRef.current = () => {
                source.cancel()
                reject()
              }
            })

            // wait for all searches to complete before ending progress status
            await Promise.race([
              Promise.all([streamPromise, mapPromise]),
              cancelPromise,
            ])
            if (!isMounted()) {
              return
            }
          } catch (e) {
            // todo
          } finally {
            endSearch()
            cancelRef.current = undefined
          }
        }
      },
      [isMounted, endSearch, searchNodes, resetSearchResults, addSearchResults],
    ),
    250,
  )

  const updateSearch = useCallback(
    ({ search }: { search: string }) => {
      startSearch()
      updateSearchText(search)
      debouncedUpdateSearch({ search })
    },
    [startSearch, updateSearchText, debouncedUpdateSearch],
  )

  return useMemo(
    () => ({
      changeEnv,
      loadTrackers,
      loadStream,
      resetStream,
      loadTopology,
      resetTopology,
      updateSearch,
      loadNodeLocations,
    }),
    [
      changeEnv,
      loadTrackers,
      loadStream,
      resetStream,
      loadTopology,
      resetTopology,
      updateSearch,
      loadNodeLocations,
    ],
  )
}

interface Props {
  children: React.ReactNode
}

const ControllerProvider = ({ children }: Props) => (
  <ControllerContext.Provider value={useControllerContext()}>
    {children || null}
  </ControllerContext.Provider>
)

const useController = () => {
  const context = useContext(ControllerContext)

  if (!context) {
    throw new Error('ControllerContext must be inside a Provider with a value')
  }

  return context
}

export { ControllerProvider as Provider, ControllerContext as Context, useController }
