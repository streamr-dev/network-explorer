import { useState, useCallback, useMemo } from 'react'

import { useThrottled } from '../../hooks/wrapCallback'

export type SearchResult = {
  type: 'streams' | 'nodes' | 'locations',
  id: string,
  name: string,
}

const useSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([])

  const updateResults = useThrottled(useCallback(({ search }: { search: string }) => {
    if (!search) {
      setResults([])
    } else {
      setResults([{
        id: '1',
        type: 'streams',
        name: 'asd',
      }])
    }
  }, []), 250)

  return useMemo(() => ({
    updateResults,
    results,
  }), [
    updateResults,
    results,
  ])
}

export default useSearch
