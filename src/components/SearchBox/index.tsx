import React, { useCallback, useRef, useEffect } from 'react'
import { useHistory } from 'react-router-dom'

import { useStore, ActiveView } from '../../contexts/Store'
import { usePending } from '../../contexts/Pending'
import { useController } from '../../contexts/Controller'

import Search from './Search'
import StreamStats from '../StreamStats'
import NetworkStats from '../NetworkStats'

const SearchBox = () => {
  const {
    streamId,
    activeView,
    setActiveView,
    setActiveLocationId,
    search,
    updateSearch: updateSearchText,
    searchResults,
    resetSearchResults,
    env,
  } = useStore()
  const { updateSearch } = useController()
  const { isPending: isStreamLoading } = usePending('streams')
  const history = useHistory()
  const searchRef = useRef<HTMLDivElement>(null)

  const hasStream = !!streamId
  const isDisabled = hasStream && !!isStreamLoading

  const onClear = useCallback(() => {
    updateSearchText('')
    resetSearchResults()
    history.push('/')
  }, [history, updateSearchText, resetSearchResults])

  const onSearch = useCallback(
    (value: string) => {
      updateSearch({ search: value })
    },
    [updateSearch],
  )

  const onResultClick = useCallback(
    ({ id, type }) => {
      setActiveView(ActiveView.Map)
      switch (type) {
        case 'streams':
          resetSearchResults()
          history.push(`/streams/${encodeURIComponent(id)}`)
          break

        case 'nodes':
          resetSearchResults()
          history.push(`/nodes/${encodeURIComponent(id)}`)
          break

        case 'locations':
          setActiveLocationId(id)
          break

        default:
          break
      }
    },
    [history, setActiveView, setActiveLocationId, resetSearchResults],
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

  return (
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
        value={search}
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
        <Search.Results results={searchResults} onClick={onResultClick} highlight={search} />
      )}
    </Search>
  )
}

export default SearchBox
