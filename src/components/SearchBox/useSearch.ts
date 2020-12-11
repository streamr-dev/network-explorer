import {
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react'
import orderBy from 'lodash/orderBy'

import { useDebounced } from '../../hooks/wrapCallback'
import useIsMounted from '../../hooks/useIsMounted'
import { usePending } from '../../contexts/Pending'
import { useStore } from '../../contexts/Store'
import * as streamrApi from '../../utils/api/streamr'
import * as mapApi from '../../utils/api/mapbox'

const useSearch = () => {
  const [results, setResults] = useState<streamrApi.SearchResult[]>([])
  const [incomingResults, setIncomingResults] = useState<streamrApi.SearchResult[] | undefined>([])
  const isMounted = useIsMounted()
  const { start, end } = usePending('search')
  const { nodes } = useStore()

  useEffect(() => {
    if (incomingResults) {
      setResults(orderBy(incomingResults, 'name'))
    }
  }, [incomingResults])

  const searchNodes = useCallback((search: string): streamrApi.SearchResult[] => nodes
    .filter(({ id, title }) => (
      id.toLowerCase().indexOf(search) >= 0 || title.toLowerCase().indexOf(search) >= 0
    ))
    .map(({ id, title }) => ({
      id,
      type: 'nodes',
      name: title,
      description: id,
    })), [nodes])

  const debouncedUpdateResults = useDebounced(
    useCallback(async ({ search: rawSearchString }: { search: string }) => {
      const search = rawSearchString.toLowerCase()

      if (!search) {
        setIncomingResults([])
        end()
      } else {
        try {
          setIncomingResults(undefined)

          setIncomingResults((prevResults) => ([
            ...(prevResults || []),
            ...searchNodes(search),
          ]))

          const streamPromise = new Promise<streamrApi.SearchResult[]>((resolve) => (
            streamrApi.searchStreams({ search }).then(resolve, () => resolve([]))
          ))
            .then((nextResults) => {
              if (!isMounted()) { return }

              setIncomingResults((prevResults) => ([
                ...(prevResults || []),
                ...nextResults,
              ]))
            })

          const mapPromise = new Promise<streamrApi.SearchResult[]>((resolve) => (
            mapApi.getLocations({ search }).then(resolve, () => resolve([]))
          ))
            .then((nextResults) => {
              if (!isMounted()) { return }

              setIncomingResults((prevResults) => ([
                ...(prevResults || []),
                ...nextResults,
              ]))
            })

          // wait for all searches to complete before ending progress status
          await Promise.all([
            streamPromise,
            mapPromise,
          ])
          if (!isMounted()) { return }
        } catch (e) {
          // todo
        } finally {
          end()
        }
      }
    }, [isMounted, end, searchNodes]),
    250,
  )

  const updateResults = useCallback(({ search }: { search: string }) => {
    start()
    debouncedUpdateResults({ search })
  }, [start, debouncedUpdateResults])

  return useMemo(() => ({
    updateResults,
    results,
  }), [
    updateResults,
    results,
  ])
}

export default useSearch
