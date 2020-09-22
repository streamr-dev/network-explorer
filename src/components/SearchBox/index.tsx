import React, { useState, useCallback } from 'react'
import styled from 'styled-components/macro'

import ControlBox from '../ControlBox'
import Stats from '../Stats'
import Graphs from '../Graphs'
import { useNodes } from '../../contexts/Nodes'

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
  const [results, setResults] = useState<Array<SearchResult>>([])
  const { nodes } = useNodes()

  const search = useCallback((text: string) => {
    if (text.length === 0) {
      setResults([])
      return
    }

    const fakeResults = [...Array(10).keys()].map((k) => ({
      name: `${text} ${k}`,
      type: Math.floor(Math.random() * 3),
      nodeCount: k,
    }))
    setResults(fakeResults.splice(0, 5))
  }, [])

  const stats = {
    'Msgs/sec': 123,
    'Nodes': nodes && nodes.length,
    'Latency ms': 25,
  }

  return (
    <StyledControlBox>
      <Search>
        <LogoContainer>
          <StreamrLogo />
        </LogoContainer>
        <SearchInputContainer>
          <SearchInput
            onChange={(text) => search(text)}
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
