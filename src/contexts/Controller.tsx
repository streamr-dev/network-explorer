import React, {
  useMemo,
  useContext,
  useCallback,
  useEffect,
} from 'react'

import * as trackerApi from '../utils/api/tracker'
import * as streamrApi from '../utils/api/streamr'
import { usePending } from './Pending'
import { useStore } from './Store'
import useIsMounted from '../hooks/useIsMounted'

type ContextProps = {
  loadTrackers: () => Promise<void>,
  loadStream: Function,
  resetStream: Function,
  loadTopology: Function,
  resetTopology: Function,
}

const ControllerContext = React.createContext<ContextProps | undefined>(undefined)

function useControllerContext() {
  const {
    trackers,
    setTrackers,
    addNodes,
    setTopology,
    setStream,
  } = useStore()
  const { wrap } = usePending('nodes')
  const { wrap: wrapTopology } = usePending('topology')
  const { wrap: wrapStreams } = usePending('streams')
  const isMounted = useIsMounted()

  const loadTrackers = useCallback(async () => {
    const nextTrackers = await trackerApi.getTrackers()

    if (!isMounted()) { return }

    setTrackers(nextTrackers)
  }, [isMounted, setTrackers])

  const loadNodes = useCallback(async (url: string) => {
    const nextNodes = await trackerApi.getNodes(url)

    if (!isMounted()) { return }

    addNodes(nextNodes)
  }, [isMounted, addNodes])

  const doLoadTrackers = useCallback(async (urls: string[]) => (
    wrap(async () => {
      await Promise.all(urls.map((url) => loadNodes(url)))
    })
  ), [wrap, loadNodes])

  useEffect(() => {
    if (trackers && trackers.length > 0) {
      doLoadTrackers(trackers)
    }
  }, [trackers, loadNodes, doLoadTrackers])

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

  const loadTopology = useCallback(async (streamId: string) => (
    wrapTopology(async () => {
      const newTopology = await loadTopologyFromApi({ id: streamId })

      if (!isMounted()) { return }

      setTopology(newTopology)
    })
  ), [wrapTopology, loadTopologyFromApi, setTopology, isMounted])

  const resetTopology = useCallback(() => {
    setTopology({})
  }, [setTopology])

  return useMemo(() => ({
    loadTrackers,
    loadStream,
    resetStream,
    loadTopology,
    resetTopology,
  }), [
    loadTrackers,
    loadStream,
    resetStream,
    loadTopology,
    resetTopology,
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