import React, {
  useMemo,
  useContext,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useHistory } from 'react-router-dom'

import * as trackerApi from '../utils/api/tracker'
import * as streamrApi from '../utils/api/streamr'
import { usePending } from './Pending'
import { useStore } from './Store'
import useIsMounted from '../hooks/useIsMounted'
import { setEnvironment } from '../utils/config'

type ContextProps = {
  changeEnv: Function,
  loadTrackers: () => Promise<void>,
  loadStream: Function,
  resetStream: Function,
  loadTopology: Function,
  resetTopology: Function,
  hasLoaded: boolean,
}

const ControllerContext = React.createContext<ContextProps | undefined>(undefined)

function useControllerContext() {
  const {
    trackers,
    setTrackers,
    addNodes,
    setTopology,
    setStream,
    resetStore,
  } = useStore()
  const { wrap: wrapTrackers } = usePending('trackers')
  const { wrap: wrapNodes } = usePending('nodes')
  const { wrap: wrapTopology } = usePending('topology')
  const { wrap: wrapStreams } = usePending('streams')
  const [hasLoaded, setHasLoaded] = useState(false)
  const isMounted = useIsMounted()
  const history = useHistory()

  const loadTrackers = useCallback(() => (
    wrapTrackers(async () => {
      const nextTrackers = await trackerApi.getTrackers()

      if (!isMounted()) { return }

      setTrackers(nextTrackers)
    })
  ), [wrapTrackers, isMounted, setTrackers])

  const loadNodes = useCallback(async (url: string) => {
    const nextNodes = await trackerApi.getNodes(url)

    if (!isMounted()) { return }

    addNodes(nextNodes)
  }, [isMounted, addNodes])

  const doLoadNodes = useCallback(async (urls: string[]) => (
    wrapNodes(async () => {
      await Promise.all(urls.map((url) => loadNodes(url)))
    })
  ), [wrapNodes, loadNodes])

  useEffect(() => {
    if (trackers && trackers.length > 0) {
      doLoadNodes(trackers)
        .then(() => {
          if (isMounted()) {
            setHasLoaded(true)
          }
        })
    }
  }, [isMounted, trackers, doLoadNodes])

  const loadStream = useCallback(async (streamId: string) => (
    wrapStreams(async () => {
      try {
        const nextStream = await streamrApi.getStream({ id: streamId })

        if (!isMounted()) { return }

        setStream(nextStream)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e)
        throw e
      }
    })
  ), [wrapStreams, isMounted, setStream])

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

  const loadTopology = useCallback(async (options: { streamId?: string } = {}) => (
    wrapTopology(async () => {
      const { streamId } = options || {}

      let newTopology

      if (streamId) {
        newTopology = await loadTopologyFromApi({ id: streamId })
      } else {
        newTopology = await loadNodeConnectionsFromApi()
      }

      if (!isMounted()) { return }

      setTopology(newTopology)
    })
  ), [wrapTopology, loadTopologyFromApi, loadNodeConnectionsFromApi, setTopology, isMounted])

  const resetTopology = useCallback(() => {
    setTopology({})
  }, [setTopology])

  const changeEnv = useCallback((env: string) => {
    setEnvironment(env)
    resetStore()
    setHasLoaded(false)
    history.push('/')
    loadTrackers()
  }, [resetStore, loadTrackers, history])

  return useMemo(() => ({
    changeEnv,
    loadTrackers,
    loadStream,
    resetStream,
    loadTopology,
    resetTopology,
    hasLoaded,
  }), [
    changeEnv,
    loadTrackers,
    loadStream,
    resetStream,
    loadTopology,
    resetTopology,
    hasLoaded,
  ])
}

interface Props  {
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

export {
  ControllerProvider as Provider,
  ControllerContext as Context,
  useController,
}
