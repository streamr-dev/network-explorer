import React, {
  useMemo, useContext, useCallback, useRef, useState,
} from 'react'
import {
  ViewportProps,
  FlyToInterpolator,
  LinearInterpolator,
  TRANSITION_EVENTS,
} from 'react-map-gl'
import { useHistory } from 'react-router-dom'

import * as trackerApi from '../utils/api/tracker'
import * as streamrApi from '../utils/api/streamr'
import * as mapApi from '../utils/api/mapbox'
import { usePending } from './Pending'
import { useStore } from './Store'
import useIsMounted from '../hooks/useIsMounted'
import { useDebounced } from '../hooks/wrapCallback'
import { setEnvironment } from '../utils/config'

type FocusLocationParams = {
  longitude: number
  latitude: number
}

type ContextProps = {
  changeEnv: Function
  viewport: ViewportProps
  setViewport: React.Dispatch<React.SetStateAction<ViewportProps>>
  zoomIn: () => void
  zoomOut: () => void
  reset: () => void
  focusLocation: (location: FocusLocationParams) => void
  showNode: Function
  loadTrackers: () => Promise<void>
  loadStream: Function
  resetStream: Function
  loadTopology: Function
  resetTopology: Function
  loadNodeLocations: Function
}

const ControllerContext = React.createContext<ContextProps | undefined>(undefined)

const defaultViewport = {
  width: 0,
  height: 0,
  latitude: 53.86859,
  longitude: -0.36616,
  zoom: 3,
  bearing: 0,
  pitch: 0,
  altitude: 0,
  maxZoom: 15,
  minZoom: 2,
  maxPitch: 60,
  minPitch: 0,
}

const LINEAR_TRANSITION_PROPS = {
  transitionDuration: 300,
  transitionEasing: (t: number) => t,
  transitionInterpolator: new LinearInterpolator(),
  transitionInterruption: TRANSITION_EVENTS.BREAK,
}

function useControllerContext() {
  const {
    nodes,
    updateLocations,
    setTrackers,
    setNodes,
    setTopology,
    setStream,
    resetStore,
    streamId: activeStreamId,
  } = useStore()
  const [viewport, setViewport] = useState<ViewportProps>({
    ...defaultViewport,
    transitionInterpolator: new FlyToInterpolator({
      speed: 3,
    }),
    transitionDuration: 2000,
  })
  const history = useHistory()
  const { wrap: wrapNodes } = usePending('nodes')
  const { wrap: wrapTopology } = usePending('topology')
  const { wrap: wrapStreams } = usePending('streams')
  const isMounted = useIsMounted()
  const nodesRef = useRef(nodes)
  nodesRef.current = nodes
  const trackersLoadedOnce = useRef<boolean>(false)

  const showNode = useCallback(
    (nodeId?: string) => {
      let path = '/'

      if (activeStreamId) {
        path += `streams/${encodeURIComponent(activeStreamId)}/`
      }

      if (nodeId) {
        path += `nodes/${encodeURIComponent(nodeId)}`
      }

      history.replace(path)
    },
    [activeStreamId, history],
  )

  const debouncedSetViewport = useDebounced(
    useCallback(async (nextViewport: ViewportProps) => setViewport(nextViewport), []),
    250,
  )

  const zoomIn = useCallback(() => {
    debouncedSetViewport((prev: ViewportProps) => ({
      ...prev,
      zoom: (prev.zoom || 0) + 1,
      LINEAR_TRANSITION_PROPS,
    }))
  }, [debouncedSetViewport])

  const zoomOut = useCallback(() => {
    debouncedSetViewport((prev: ViewportProps) => ({
      ...prev,
      zoom: (prev.zoom || 0) - 1,
      LINEAR_TRANSITION_PROPS,
    }))
  }, [debouncedSetViewport])

  const reset = useCallback(() => {
    debouncedSetViewport((prev: ViewportProps) => {
      const nextViewport = defaultViewport
      return {
        ...prev,
        ...nextViewport,
        LINEAR_TRANSITION_PROPS,
      }
    })
  }, [debouncedSetViewport])

  const focusLocation = useCallback(({ latitude, longitude }: FocusLocationParams) => {
    debouncedSetViewport((prev: ViewportProps) => ({
      ...prev,
      longitude,
      latitude,
      zoom: 10,
      LINEAR_TRANSITION_PROPS,
    }))
  }, [debouncedSetViewport])

  const loadTrackers = useCallback(
    async () =>
      wrapNodes(async () => {
        const nextTrackers = await trackerApi.getTrackers()

        if (!isMounted()) {
          return undefined
        }

        const nextNodes = await Promise.all(nextTrackers.map((url) => trackerApi.getNodes(url)))

        if (!isMounted()) {
          return undefined
        }

        return {
          trackers: nextTrackers,
          nodes: nextNodes.flat(),
        }
      }),
    [wrapNodes, isMounted],
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

  const loadNodeConnectionsFromApi = useCallback(async () => {
    try {
      const nextTopology = await trackerApi.getNodeConnections()

      return nextTopology
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e)
      throw e
    }
  }, [])

  const loadTopology = useCallback(
    async (options: { streamId?: string, showConnections?: boolean } = {}) =>
      wrapTopology(async () => {
        const { streamId, showConnections } = options || {}

        let newTopology: trackerApi.Topology = {}
        let newTrackers
        let newNodes
        let didChange = false
        let didFetchTrackers = false

        // Load stream topology
        if (streamId) {
          newTopology = await loadTopologyFromApi({ id: streamId })
        } else if (showConnections) {
          // Load all node connections only when necessary
          newTopology = await loadNodeConnectionsFromApi()
        } else {
          // Otherwise load all nodes and set empty node connections
          const {
            trackers: nextTrackers,
            nodes: nextNodes,
          } = await loadTrackers()

          if (!isMounted()) {
            return
          }

          newNodes = nextNodes
          newTrackers = nextTrackers
          didFetchTrackers = true

          for (let i = 0; i < nextNodes.length; ++i) {
            newTopology[nextNodes[i].id] = {}
          }
        }

        // Load trackers again if topology changes
        if (trackersLoadedOnce.current) {
          const incomingNodes = new Set(Object.keys(newTopology))
          const existingNodes = new Set(nodesRef.current.map(({ id }) => id))

          const missingNodes = new Set([...incomingNodes].filter(
            (nodeId) => !existingNodes.has(nodeId)),
          )
          didChange = !!(missingNodes.size > 0)
        } else {
          didChange = true
        }

        if (didChange) {
          if (!didFetchTrackers) {
            const {
              trackers: nextTrackers,
              nodes: nextNodes,
            } = await loadTrackers()

            newNodes = nextNodes
            newTrackers = nextTrackers
          }

          setTrackers(newTrackers)
          setNodes(newNodes)

          trackersLoadedOnce.current = true
        }

        setTopology({
          latencies: newTopology,
          updateMap: didChange,
        })
      }),
    [
      wrapTopology,
      loadTopologyFromApi,
      loadNodeConnectionsFromApi,
      setNodes,
      setTrackers,
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

  return useMemo(
    () => ({
      changeEnv,
      viewport,
      setViewport,
      zoomIn,
      zoomOut,
      reset,
      focusLocation,
      showNode,
      loadTrackers,
      loadStream,
      resetStream,
      loadTopology,
      resetTopology,
      loadNodeLocations,
    }),
    [
      changeEnv,
      viewport,
      setViewport,
      zoomIn,
      zoomOut,
      reset,
      focusLocation,
      showNode,
      loadTrackers,
      loadStream,
      resetStream,
      loadTopology,
      resetTopology,
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
