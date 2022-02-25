import {
  useReducer,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react'
import mergeWith from 'lodash/mergeWith'
import axios from 'axios'
import { schema, normalize, denormalize } from 'normalizr'
import { useClient } from 'streamr-client-react'

import { SearchResult } from '../../utils/api/streamr'
import * as mapApi from '../../utils/api/mapbox'
import { useDebounced } from '../../hooks/wrapCallback'

import useIsMounted from '../../hooks/useIsMounted'
import useEffectAfterMount from '../../hooks/useEffectAfterMount'

const searchResultSchema = new schema.Entity('searchResults')
const searchResultsSchema = [searchResultSchema]

type Action =
  | { type: 'updateSearch'; search: string }
  | { type: 'addSearchResults'; results: Array<SearchResult>, entitiesOnly?: boolean }
  | { type: 'resetSearchResults' }
  | { type: 'reset' }

type SearchState = {
  search: string | undefined
  ids: Array<SearchResult>
  entities: { [key: string]: any } // eslint-disable-line @typescript-eslint/no-explicit-any
}

const initialState = {
  search: undefined,
  ids: [],
  entities: {
    searchResults: {},
  },
}

const reducer = (state: SearchState, action: Action) => {
  switch (action.type) {
    case 'updateSearch': {
      return {
        ...state,
        search: action.search,
      }
    }

    case 'addSearchResults': {
      const { result: ids, entities } = normalize(action.results, searchResultsSchema)

      const nextIds = action.entitiesOnly ? state.ids : [...(new Set([...state.ids, ...ids]))]

      return {
        ...state,
        ids: nextIds,
        entities: mergeWith({}, state.entities, entities),
      }
    }

    case 'resetSearchResults': {
      return {
        ...state,
        ids: [],
      }
    }

    case 'reset': {
      return {
        ...state,
        search: undefined,
        ids: [],
      }
    }
  }

  return state
}

type UseSearch = {
  search?: string,
  onStart?: Function,
  onEnd?: Function,
  existingResults?: SearchResult[],
}

function useSearch({
  search: searchProp = '',
  onStart,
  onEnd,
  existingResults,
}: UseSearch = {}) {
  const [{ search, ids: resultIds, entities }, dispatch] = useReducer(reducer, initialState)
  const isMounted = useIsMounted()
  const client = useClient()

  const searchRequests = useRef(0)
  const searchStarted = useRef(false)
  const entitiesRef = useRef(entities)
  entitiesRef.current = entities

  // Adds any existing entities to cached results so they can be searched fast
  useEffect(() => {
    if (!existingResults || existingResults.length <= 0) {
      return
    }

    dispatch({
      type: 'addSearchResults',
      results: existingResults,
      entitiesOnly: true,
    })
  }, [existingResults])

  const updateSearch = useDebounced(
    useCallback(
      async ({ search: searchedValue }: { search: string }) => {
        if (isMounted()) {
          dispatch({
            type: 'updateSearch',
            search: searchedValue,
          })
        }
      },
      [isMounted, dispatch],
    ),
    1000,
  )

  const searchStreams = useCallback(async (query) => {
    const results = []
    const gen = client.searchStreams(query)

    try {
      // eslint-disable-next-line no-restricted-syntax
      for await (const stream of gen) {
        const item = {
          type: 'streams',
          id: stream.id,
          name: stream.id,
          description: stream.description,
        } as SearchResult
        results.push(item)
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }

    return results
  }, [client])

  useEffectAfterMount(() => {
    if (!searchStarted.current && onStart && typeof onStart === 'function') {
      searchStarted.current = true
      onStart()
    }

    updateSearch({ search: searchProp })

    return () => {
      updateSearch.cancel()
    }
  }, [searchProp, updateSearch, onStart])

  useEffectAfterMount(() => {
    let didCancel = false
    const source = axios.CancelToken.source()

    const searchFetch = async () => {
      const query = (search || '').trim().toLowerCase()

      searchRequests.current += 1

      if (query.length <= 0) {
        return Promise.resolve()
      }

      // search from cached entities
      const entitiesPromise = new Promise<void>((resolve) => {
        const { searchResults } = entitiesRef.current || {}
        const values = (Object.values(searchResults || {}) as SearchResult[])

        if (values.length > 0) {
          const results = []

          for (let i = 0; i < values.length; ++i) {
            try {
              const { name, description } = values[i]
              const haystack = `${name}::${description}`.trim().toLowerCase()

              if (haystack.indexOf(query) >= 0) {
                results.push(values[i])
              }
            } catch (e) {
              // ignore error
            }
          }

          dispatch({
            type: 'addSearchResults',
            results,
          })
        }

        resolve()
      })

      // fetch new streams
      const streamPromise = new Promise<void>((resolve) => {
        return searchStreams(query).then((nextResults) => {
          if (isMounted() && !didCancel) {
            dispatch({
              type: 'addSearchResults',
              results: nextResults,
            })
          }
          resolve()
        }, resolve)
      })

      // fetch places
      const mapPromise = new Promise<void>((resolve) => {
        return mapApi.getLocations({
          search: query,
          cancelToken: source.token,
        }).then((nextResults) => {
          if (isMounted() && !didCancel) {
            dispatch({
              type: 'addSearchResults',
              results: nextResults,
            })
          }
          resolve()
        }, resolve)
      })

      return Promise.all([entitiesPromise, streamPromise, mapPromise])
    }

    dispatch({
      type: 'resetSearchResults',
    })

    searchFetch()
      .then(() => {
        searchRequests.current = Math.max(searchRequests.current - 1, 0)

        if (searchRequests.current === 0) {
          searchStarted.current = false

          if (onEnd && typeof onEnd === 'function') {
            onEnd()
          }
        }
      })

    return () => {
      didCancel = true
      source.cancel()
    }
  }, [search, isMounted, dispatch, onEnd])

  const reset = useCallback(() => {
    updateSearch.cancel()

    dispatch({
      type: 'reset',
    })
  }, [updateSearch, dispatch])

  const searchResults = useMemo(
    () => denormalize(resultIds, searchResultsSchema, entitiesRef.current) || [],
    [resultIds],
  )

  return useMemo(() => ({
    reset,
    results: searchResults,
  }), [
    reset,
    searchResults,
  ])
}

export default useSearch
