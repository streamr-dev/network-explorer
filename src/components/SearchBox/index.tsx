import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components/macro'
import { Link } from 'react-router-dom'
import { useSubscription } from 'streamr-client-react'

import ControlBox from '../ControlBox'
import { Stats, Stat } from '../Stats'
import EventsPerSecond from '../Graphs/EventsPerSecond'
import { useStore } from '../../contexts/Store'
import { usePending } from '../../contexts/Pending'
import { useController } from '../../contexts/Controller'
import useIsMounted from '../../hooks/useIsMounted'
import StreamrClientProvider from '../StreamrClientProvider'

import StreamrLogo from './StreamrLogo'
import SearchInput from './SearchInput'
import SearchResults from './SearchResults'
import useSearch from './useSearch'

const StyledControlBox = styled(ControlBox)`
  background: #ffffff;
`

const Search = styled.div`
  height: 64px;
  display: grid;
  grid-template-columns: 64px 1fr;
  border-bottom: 1px solid #EFEFEF;
`

const LogoContainer = styled.div`
  border-right: 1px solid #EFEFEF;
`

const SearchInputContainer = styled.div`
  width: 100%;
`

const GraphContainer = styled.div`
  border-top: 1px solid #EFEFEF;
`

const SearchBox = () => {
  const [selectedStat, setSelectedStat] = useState<string | null>(null)
  const [messagesPerSecond, setMessagesPersecond] = useState<number | undefined>(undefined)
  const [searchText, setSearchText] = useState<string>('')
  const { nodes, streamId, stream } = useStore()
  const { results, updateResults } = useSearch()
  const { hasLoaded } = useController()
  const [searchActive, setSearchActive] = useState<boolean>(false)
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

  useEffect(() => {
    if (searchActive) {
      updateResults({ search: searchText })
    }
  }, [updateResults, searchText, searchActive])

  const hasStream = !!streamId
  const isDisabled = hasStream && !!isStreamLoading
  const streamTitle = stream && stream.id || ''

  useEffect(() => {
    if (!isDisabled) {
      setSearchActive(false)
      setSearchText(hasStream ? streamTitle : '')
    }
  }, [hasStream, isDisabled, streamTitle])

  const onClear = useCallback(() => {
    setSearchActive(false)
    setSearchText('')
    updateResults({ search: '' })
  }, [updateResults])

  const onSearch = useCallback((value: string) => {
    setSearchText(value)
    setSearchActive(true)
  }, [])

  const onSelectedStatChanged = useCallback((name) => {
    setSelectedStat((prev) => prev !== name && name)
  }, [])

  useEffect(() => {
    updateResults({ search: '' })
  }, [streamId, updateResults])

  return (
    <StyledControlBox>
      <Search>
        <LogoContainer>
          <Link to="/">
            <StreamrLogo />
          </Link>
        </LogoContainer>
        <SearchInputContainer>
          <SearchInput
            value={searchText}
            onChange={onSearch}
            onClear={onClear}
            disabled={!!isDisabled}
            onBlur={() => setSearchActive(false)}
          />
        </SearchInputContainer>
      </Search>
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
      {results.length > 0 && (
        <GraphContainer>
          <SearchResults results={results} />
        </GraphContainer>
      )}
      {results.length === 0 && selectedStat === 'eventsPerSecond' && (
        <GraphContainer>
          <EventsPerSecond />
        </GraphContainer>
      )}
    </StyledControlBox>
  )
}

export default () => (
  <StreamrClientProvider>
    <SearchBox />
  </StreamrClientProvider>
)
