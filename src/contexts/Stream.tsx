import React, {
  useCallback,
  useMemo,
  useContext,
} from 'react'

import { usePending } from './Pending'
import { useStore } from './Store'
import useIsMounted from '../hooks/useIsMounted'

import * as api from '../utils/api/streamr'

type ContextProps = {
  loadStream: Function,
  resetStream: Function,
}

const StreamContext = React.createContext<ContextProps | undefined>(undefined)

function useStreamContext() {
  const { setStream } = useStore()
  const { wrap: wrapStreams } = usePending('streams')
  const isMounted = useIsMounted()

  const loadStream = useCallback(async (streamId: string) => (
    wrapStreams(async () => {
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
  ), [wrapStreams, isMounted, setStream])

  const resetStream = useCallback(() => {
    setStream(undefined)
  }, [setStream])

  return useMemo(() => ({
    loadStream,
    resetStream,
  }), [
    loadStream,
    resetStream,
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
