import React, { useState, useMemo, useContext } from 'react'

export type Interval = 'realtime' | '24hours' | '1month' | '3months' | 'all'

type ContextProps = {
  interval: Interval | undefined
  setInterval: (interval: Interval | undefined) => void
}

const GraphContext = React.createContext<ContextProps | undefined>(undefined)

type Props = {
  children: React.ReactNode
  defaultInterval?: Interval
}

const GraphProvider = ({ children, defaultInterval }: Props) => {
  const [interval, setInterval] = useState<Interval | undefined>(defaultInterval)

  const value = useMemo(() => {
    return {
      interval,
      setInterval,
    }
  }, [interval, setInterval])

  return <GraphContext.Provider value={value}>{children || null}</GraphContext.Provider>
}

const useGraphContext = () => {
  const context = useContext(GraphContext)

  if (!context) {
    throw new Error('GraphContext must be inside a Provider with a value')
  }

  return context
}

export { GraphProvider as Provider, useGraphContext }
