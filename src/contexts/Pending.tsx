import React, {
  useState,
  useMemo,
  useContext,
  useCallback,
} from 'react'

type ContextProps = {
  isPending: (name: string) => boolean,
  setPending: (name: string, value: boolean) => void,
}

const PendingContext = React.createContext<ContextProps | undefined>(undefined)

function usePendingContext() {
  const [pending, setPendingState] = useState<Record<string, boolean>>({})

  const isPending = useCallback((name: string) => !!pending[name], [pending])

  const setPending = useCallback((name: string, value: boolean) => {
    setPendingState((prevPending) => ({
      ...prevPending,
      [name]: !!value,
    }))
  }, [])

  return useMemo(() => ({
    isPending,
    setPending,
  }), [
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

const usePending = (name: string) => {
  const context = useContext(PendingContext)

  if (!context) {
    throw new Error('PendingContext must be inside a Provider with a value')
  }

  const { isPending, setPending } = context

  const start = useCallback(() => {
    setPending(name, true)
  }, [name, setPending])

  const end = useCallback(() => {
    setPending(name, false)
  }, [name, setPending])

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
  usePending,
}
