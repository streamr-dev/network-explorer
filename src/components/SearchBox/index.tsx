import React, { useState, useCallback } from 'react'
import { useSubscription } from 'streamr-client-react'

import { Stats, Stat } from '../Stats'
import EventsPerSecond from '../Graphs/EventsPerSecond'
import { useStore, ActiveView } from '../../contexts/Store'
import { usePending } from '../../contexts/Pending'
import { useController } from '../../contexts/Controller'
import useIsMounted from '../../hooks/useIsMounted'
import StreamrClientProvider from '../StreamrClientProvider'

import Search from './Search'

const SearchBox = () => {
  const [selectedStat, setSelectedStat] = useState<string | null>(null)
  const [messagesPerSecond, setMessagesPersecond] = useState<number | undefined>(undefined)
  const {
    nodes,
    streamId,
    activeView,
    setActiveView,
    search,
    updateSearch: updateSearchText,
    searchResults,
    resetSearchResults,
  } = useStore()
  const { hasLoaded, updateSearch } = useController()
  const { isPending: isStreamLoading } = usePending('streams')
  const isMounted = useIsMounted()

  const onMessagesPerSecond = useCallback(({
    eventsPerSecond,
  }) => {
    if (isMounted()) {
      setMessagesPersecond(eventsPerSecond)
    }
  }, [isMounted])

  useSubscription({
    stream: 'Y1gWr4X9S8mQdg5mzBq1dA',
    resend: {
      last: 1,
    },
  }, onMessagesPerSecond)

  const hasStream = !!streamId
  const isDisabled = hasStream && !!isStreamLoading

  const onClear = useCallback(() => {
    updateSearchText('')
    resetSearchResults()
  }, [updateSearchText, resetSearchResults])

  const onSearch = useCallback((value: string) => {
    updateSearch({ search: value })
  }, [updateSearch])

  const onSelectedStatChanged = useCallback((name) => {
    setSelectedStat((prev) => prev !== name && name)
  }, [])

  const onBack = useCallback(() => {
    setActiveView(ActiveView.Map)
  }, [setActiveView])

  return (
    <Search
      theme={{
        activeView,
      }}
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
      <Stats>
        <Stat
          label="Msgs/sec"
          value={messagesPerSecond}
          onClick={() => onSelectedStatChanged('eventsPerSecond')}
          active={selectedStat === 'eventsPerSecond'}
        />
        <Stat
          label="Nodes"
          value={hasLoaded ? nodes.length : undefined}
        />
        <Stat
          label="Latency ms"
          value={undefined}
        />
      </Stats>
      {searchResults.length === 0 && selectedStat === 'eventsPerSecond' && (
        <EventsPerSecond />
      )}
      {searchResults.length > 0 && (
        <Search.Results results={searchResults} />
      )}
    </Search>
  )
}

export default () => (
  <StreamrClientProvider>
    <SearchBox />
  </StreamrClientProvider>
)
