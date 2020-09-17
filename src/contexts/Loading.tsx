import React, {
  useState,
  useMemo,
  useContext,
} from 'react'

type ContextProps = {
  loading: boolean,
  setLoading: Function,
}

const LoadingContext = React.createContext<ContextProps | undefined>(undefined)

function useLoadingContext() {
  const [loading, setLoading] = useState<boolean>(false)

  return useMemo(() => ({
    loading,
    setLoading,
  }), [
    loading,
    setLoading,
  ])
}

interface Props  {
  children: React.ReactNode
}

const LoadingProvider = ({ children }: Props) => (
  <LoadingContext.Provider value={useLoadingContext()}>
    {children || null}
  </LoadingContext.Provider>
)

const useLoading = () => {
  const context = useContext(LoadingContext)

  if (!context) {
    throw new Error('LoadingContext must be inside a Provider with a value')
  }

  return context
}

export {
  LoadingProvider as Provider,
  LoadingContext as Context,
  useLoading,
}
