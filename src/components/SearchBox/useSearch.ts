import {
  useReducer,
  useMemo,
  useCallback,
} from 'react'
import axios from 'axios'

import { SearchResult } from '../../utils/api/streamr'
import * as streamrApi from '../../utils/api/streamr'
import * as mapApi from '../../utils/api/mapbox'
import { useDebounced } from '../../hooks/wrapCallback'

import useIsMounted from '../../hooks/useIsMounted'
import useEffectAfterMount from '../../hooks/useEffectAfterMount'

type Action =
  | { type: 'updateSearch'; search: string }
  | { type: 'addSearchResults'; results: Array<SearchResult> }
  | { type: 'resetSearchResults' }
  | { type: 'reset' }

type SearchState = {
  search: string | undefined
  results: Array<SearchResult>
}

const initialState = {
  search: undefined,
  results: [],
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
      return {
        ...state,
        results: [...state.results, ...action.results],
      }
    }

    case 'resetSearchResults': {
      return {
        ...state,
        results: [],
      }
    }

    case 'reset': {
      return initialState
    }
  }

  return state
}

type UseSearch = {
  search: string,
  onStart?: Function,
  onEnd?: Function,
}

function useSearch({
  search: searchProp,
  onStart,
  onEnd,
}: UseSearch) {
  const [{ search, results }, dispatch] = useReducer(reducer, initialState)
  const isMounted = useIsMounted()

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

  useEffectAfterMount(() => {
    if (onStart && typeof onStart === 'function') {
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
      const query = search || ''

      if (query.length <= 0) {
        return Promise.resolve()
      }

      // fetch new streams
      const streamPromise = new Promise((resolve) => {
        return streamrApi.searchStreams({
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

      // fetch places
      const mapPromise = new Promise((resolve) => {
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

      return Promise.all([streamPromise, mapPromise])
    }

    dispatch({
      type: 'resetSearchResults',
    })

    searchFetch()
      .then(() => {
        if (isMounted() && !didCancel && onEnd && typeof onEnd === 'function') {
          onEnd()
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

  return useMemo(() => ({
    reset,
    results,
  }), [
    reset,
    results,
  ])
}

export default useSearch
