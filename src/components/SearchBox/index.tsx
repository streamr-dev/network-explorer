import React, { useCallback } from 'react'
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

  const hasStream = !!streamId
  const isDisabled = hasStream && !!isStreamLoading

  const onClear = useCallback(() => {
    updateSearchText('')
    resetSearchResults()
    history.push('/')
  }, [history, updateSearchText, resetSearchResults])

  const onSearch = useCallback((value: string) => {
    updateSearch({ search: value })
  }, [updateSearch])

  const onResultClick = useCallback(({ id, type }) => {
    setActiveView(ActiveView.Map)
    switch (type) {
      case 'streams':
        resetSearchResults()
        history.push(`/streams/${encodeURIComponent(id)}`)
        break

      case 'nodes':
        resetSearchResults()
        history.push(`/nodes/${id}`)
        break

      case 'locations':
        setActiveLocationId(id)
        break

      default:
        break
    }
  }, [setActiveView, history, setActiveLocationId, resetSearchResults])

  return (
    <Search
      theme={{
        activeView,
        resultsActive: searchResults.length > 0,
        hasStats: true,
      }}
      key={env}
    >
      <Search.SlideHandle />
      <Search.Input
        value={search}
        onChange={onSearch}
        onClear={onClear}
        disabled={!!isDisabled}
        onFocus={() => setActiveView(ActiveView.List)}
      />
      {!!hasStream && (
        <StreamStats />
      )}
      {!hasStream && (
        <NetworkStats />
      )}
      {searchResults.length > 0 && (
        <Search.Results
          results={searchResults}
          onClick={onResultClick}
          highlight={search}
        />
      )}
    </Search>
  )
}

export default SearchBox
