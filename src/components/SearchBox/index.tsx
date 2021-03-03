import React, { useCallback } from 'react'
import { useHistory } from 'react-router-dom'

import { useStore, ActiveView } from '../../contexts/Store'
import { usePending } from '../../contexts/Pending'
import { useController } from '../../contexts/Controller'
import StreamrClientProvider from '../StreamrClientProvider'

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

  const onBack = useCallback(() => {
    setActiveView(ActiveView.Map)
  }, [setActiveView])

  const onResultClick = useCallback(({ id, type }) => {
    switch (type) {
      case 'streams':
        updateSearchText(id)
        resetSearchResults()
        history.push(`/streams/${encodeURIComponent(id)}`)
        break

      case 'nodes':
        updateSearchText('')
        resetSearchResults()
        history.push(`/nodes/${id}`)
        break

      case 'locations':
        setActiveLocationId(id)
        break

      default:
        break
    }
  }, [history, setActiveLocationId, updateSearchText, resetSearchResults])

  return (
    <Search
      theme={{
        activeView,
        resultsActive: searchResults.length > 0,
      }}
      key={env}
    >
      <Search.Input
        value={search}
        onChange={onSearch}
        onClear={onClear}
        disabled={!!isDisabled}
        onFocus={() => setActiveView(ActiveView.List)}
        onBack={onBack}
        theme={{
          searchActive: activeView === ActiveView.List,
          showMobileBackButton: activeView === ActiveView.List,
        }}
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

export default () => (
  <StreamrClientProvider>
    <SearchBox />
  </StreamrClientProvider>
)
