import React, { useState } from 'react'
import styled from 'styled-components/macro'

import ControlBox from '../ControlBox'
import Stats from '../Stats'
import Graphs from '../Graphs'

import StreamrLogo from './StreamrLogo'
import SearchInput from './SearchInput'

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

  const stats = {
    'Msgs/sec': 123,
    'Nodes': 45,
    'Latency ms': 25,
  }

  return (
    <StyledControlBox>
      <Search>
        <LogoContainer>
          <StreamrLogo />
        </LogoContainer>
        <SearchInputContainer>
          <SearchInput />
        </SearchInputContainer>
      </Search>
      <Stats
        values={stats}
        onSelectedStatChanged={(name) => {
          setSelectedStat(name)
        }}
      />
      <GraphContainer hidden={selectedStat == null}>
        <Graphs name={selectedStat} />
      </GraphContainer>
    </StyledControlBox>
  )
}

export default SearchBox
