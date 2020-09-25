import React, {
  useCallback,
  useMemo,
  useContext,
  useState,
} from 'react'

import { usePending } from './Pending'
import useIsMounted from '../hooks/useIsMounted'

import * as api from '../utils/api/streamr'

type ContextProps = {
  loadStream: Function,
  resetStream: Function,
  activeStreamId: string | undefined,
  setActiveStreamId: Function,
  stream: api.Stream | undefined,
}

const StreamContext = React.createContext<ContextProps | undefined>(undefined)

function useStreamContext() {
  const [stream, setStream] = useState<api.Stream | undefined>(undefined)
  const [activeStreamId, setActiveStreamId] = useState<string | undefined>(undefined)
  const { wrap: wrapStreams } = usePending('streams')
  const isMounted = useIsMounted()

  const loadStream = useCallback(async (streamId: string) => (
    wrapStreams(async () => {
      setActiveStreamId(streamId)

      try {
        const nextStream = await api.getStream({ id: streamId })

        if (!isMounted()) { return }

        setStream(nextStream)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e)
        throw e
      }
    })
  ), [wrapStreams, isMounted])

  const resetStream = useCallback(() => {
    setActiveStreamId(undefined)
    setStream(undefined)
  }, [])

  return useMemo(() => ({
    loadStream,
    resetStream,
    activeStreamId,
    setActiveStreamId,
    stream,
  }), [
    loadStream,
    resetStream,
    activeStreamId,
    setActiveStreamId,
    stream,
  ])
}

interface Props  {
  children: React.ReactNode
}

const StreamProvider = ({ children }: Props) => (
  <StreamContext.Provider value={useStreamContext()}>
    {children || null}
  </StreamContext.Provider>
)

const useStream = () => {
  const context = useContext(StreamContext)

  if (!context) {
    throw new Error('StreamContext must be inside a Provider with a value')
  }

  return context
}

export {
  StreamProvider as Provider,
  StreamContext as Context,
  useStream,
}
