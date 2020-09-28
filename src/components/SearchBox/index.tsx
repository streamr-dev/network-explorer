import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components/macro'
import { Link } from 'react-router-dom'

import ControlBox from '../ControlBox'
import Stats from '../Stats'
import Graphs from '../Graphs'
import { useNodes } from '../../contexts/Nodes'
import { useStream } from '../../contexts/Stream'
import { usePending } from '../../contexts/Pending'

import StreamrLogo from './StreamrLogo'
import SearchInput from './SearchInput'
import SearchResults from './SearchResults'
import useSearch from './useSearch'

const StyledControlBox = styled(ControlBox)`
  background: #ffffff;
  border-radius: 4px;
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
  const [searchText, setSearchText] = useState<string>('')
  const { nodes } = useNodes()
  const { activeStreamId, stream } = useStream()
  const { results, updateResults } = useSearch()
  const [searchActive, setSearchActive] = useState<boolean>(false)
  const { isPending: isStreamLoading } = usePending('streams')

  useEffect(() => {
    if (searchActive) {
      updateResults({ search: searchText })
    }
  }, [updateResults, searchText, searchActive])

  const stats = {
    'Msgs/sec': 123,
    'Nodes': nodes && nodes.length,
    'Latency ms': 25,
  }

  const hasStream = !!activeStreamId
  const isDisabled = hasStream && !!isStreamLoading
  const streamTitle = stream && stream.name || ''

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
      <Stats
        values={stats}
        onSelectedStatChanged={(name) => {
          setSelectedStat(name)
        }}
        disabled={results.length > 0}
      />
      {results.length > 0 && (
        <GraphContainer>
          <SearchResults results={results} />
        </GraphContainer>
      )}
      {results.length === 0 && selectedStat != null && (
        <GraphContainer>
          <Graphs name={selectedStat} />
        </GraphContainer>
      )}
    </StyledControlBox>
  )
}

export default SearchBox
