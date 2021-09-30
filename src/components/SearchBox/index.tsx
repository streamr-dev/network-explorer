import React, {
  useCallback,
  useRef,
  useEffect,
  useState,
} from 'react'
import { useHistory } from 'react-router-dom'

import { useStore, ActiveView, ActiveRoute } from '../../contexts/Store'
import { usePending } from '../../contexts/Pending'
import { useController } from '../../contexts/Controller'

import useSearch from './useSearch'
import Search from './Search'
import StreamStats from '../StreamStats'
import NetworkStats from '../NetworkStats'

const SearchBox = () => {
  const {
    streamId,
    activeRoute,
    activeView,
    setActiveView,
    env,
    activeNode,
  } = useStore()
  const { isPending: isStreamLoading } = usePending('streams')
  const { isPending: isSearchPending, start: startSearch, end: endSearch } = usePending('search')
  const [searchInputValue, setSearchInputValue] = useState<string>('')
  const { results: searchResults, reset } = useSearch({
    search: searchInputValue,
    onStart: startSearch,
    onEnd: endSearch,
  })
  const searchRef = useRef<HTMLDivElement>(null)
  const history = useHistory()
  const { focusLocation } = useController()

  const hasStream = !!(activeRoute === ActiveRoute.Stream)
  const isDisabled = hasStream && !!isStreamLoading
  const isNodeSelected = activeNode && search === activeNode.title

  const onClear = useCallback(() => {
    setSearchInputValue('')
    reset()
    endSearch()
    history.push('/')
  }, [history, reset, endSearch])

  const onSearch = useCallback(
    (value: string) => {
      setSearchInputValue(value)
      startSearch()
    },
    [startSearch],
  )

  const onResultClick = useCallback(
    ({ id, type, longitude, latitude }) => {
      setActiveView(ActiveView.Map)
      switch (type) {
        case 'streams':
          onClear()
          history.push(`/streams/${encodeURIComponent(id)}`)
          break

        case 'nodes':
          history.push(`/nodes/${encodeURIComponent(id)}`)
          break

        case 'locations':
          focusLocation({
            longitude,
            latitude,
          })
          break

        default:
          break
      }
    },
    [history, setActiveView, onClear, focusLocation],
  )

  useEffect(() => {
    if (activeView !== ActiveView.List || !searchRef.current) {
      return undefined
    }

    const onMouseDown = (e: MouseEvent) => {
      const { current: el } = searchRef

      if (!el) {
        return
      }

      if (!el.contains((e.target as Element))) {
        setActiveView(ActiveView.Map)
      }
    }

    window.addEventListener('mousedown', onMouseDown)

    return () => {
      window.removeEventListener('mousedown', onMouseDown)
    }
  }, [activeView, setActiveView])

  useEffect(() => {
    console.log(activeRoute)
  }, [activeRoute])

  return (
    <>
      <Search
        theme={{
          activeView,
          resultsActive: searchResults.length > 0,
          hasStats: true,
        }}
        key={env}
        ref={searchRef}
      >
        <Search.SlideHandle />
        <Search.Input
          value={searchInputValue}
          onChange={onSearch}
          onClear={onClear}
          disabled={!!isDisabled}
          onFocus={() => {
            setActiveView(ActiveView.List)

            // For mobile Safari 14 this scrollTo(0, 0) is needed to make input element
            // visible on screen. This has something to do with Safari calculating
            // element position at focus time but since we animate that position, it's
            // not correct after animation without this.
            setTimeout(() => {
              window.scrollTo(0, 0)
            }, 100)
          }}
        />
        {!!hasStream && <StreamStats />}
        {!hasStream && <NetworkStats />}
        {searchResults.length > 0 && (
          <Search.Results
            results={searchResults}
            onClick={onResultClick}
            highlight={searchInputValue}
          />
        )}
      </Search>
      {(!isSearchPending &&
        !isNodeSelected &&
        !hasStream &&
        search && search.length > 0 &&
        searchResults.length === 0) && (
          <Search.NoResults search={search} />
      )}
    </>
  )
}

export default SearchBox
