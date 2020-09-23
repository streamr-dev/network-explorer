import React, {
  useState,
  useMemo,
  useContext,
  useCallback,
} from 'react'

import { useIsMounted } from '../hooks/useIsMounted'

type Pending = Record<string, boolean>
type ContextProps = {
  pending: Pending,
  isPending: (name: string) => boolean,
  setPending: (name: string, value: boolean) => void,
}

const PendingContext = React.createContext<ContextProps | undefined>(undefined)

function usePendingContext() {
  const [pending, setPendingState] = useState<Pending>({})

  const isPending = useCallback((name: string) => !!pending[name], [pending])

  const setPending = useCallback((name: string, value: boolean) => {
    setPendingState((prevPending) => ({
      ...prevPending,
      [name]: !!value,
    }))
  }, [])

  return useMemo(() => ({
    pending,
    isPending,
    setPending,
  }), [
    pending,
    isPending,
    setPending,
  ])
}

interface Props  {
  children: React.ReactNode
}

const PendingProvider = ({ children }: Props) => (
  <PendingContext.Provider value={usePendingContext()}>
    {children || null}
  </PendingContext.Provider>
)

const useAllPending  = () => {
  const context = useContext(PendingContext)

  if (!context) {
    throw new Error('PendingContext must be inside a Provider with a value')
  }

  return context
}

const usePending = (name: string) => {
  const { isPending, setPending } = useAllPending()
  const isMounted = useIsMounted()

  const start = useCallback(() => {
    if (isMounted()) { return }

    setPending(name, true)
  }, [name, setPending, isMounted])

  const end = useCallback(() => {
    if (isMounted()) { return }

    setPending(name, false)
  }, [name, setPending, isMounted])

  const wrap = useCallback(async (fn: Function) => {
    start()
    try {
      return await fn()
    } finally {
      end()
    }
  }, [start, end])

  const isCurrentPending = !!isPending(name)

  return useMemo(() => ({
    isPending: isCurrentPending,
    start,
    end,
    wrap,
  }), [isCurrentPending, start, end, wrap])
}

export {
  PendingProvider as Provider,
  PendingContext as Context,
  useAllPending,
  usePending,
}
