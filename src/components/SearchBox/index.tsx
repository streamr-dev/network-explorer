import React, { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components/macro'
import { Link } from 'react-router-dom'

import ControlBox from '../ControlBox'
import Stats from '../Stats'
import Graphs from '../Graphs'
import { useNodes } from '../../contexts/Nodes'
import { useStream } from '../../contexts/Stream'

import StreamrLogo from './StreamrLogo'
import SearchInput from './SearchInput'
import SearchResults, { SearchResult } from './SearchResults'

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

  const results = useMemo<SearchResult[]>(() => {
    if (searchText.length === 0) {
      return []
    }

    const fakeResults = [...Array(10).keys()].map((k) => ({
      name: `${searchText} ${k}`,
      type: Math.floor(Math.random() * 3),
      nodeCount: k,
    }))

    return fakeResults.splice(0, 5)
  }, [searchText])

  const stats = {
    'Msgs/sec': 123,
    'Nodes': nodes && nodes.length,
    'Latency ms': 25,
  }

  const hasStream = !!activeStreamId
  const isDisabled = hasStream && !stream
  const streamTitle = stream && stream.name || ''

  useEffect(() => {
    if (!isDisabled) {
      setSearchText(hasStream ? streamTitle : '')
    }
  }, [hasStream, isDisabled, streamTitle])

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
            onChange={setSearchText}
            onClear={() => setSearchText('')}
            disabled={!!isDisabled}
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
