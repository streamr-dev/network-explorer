import React, { useState } from 'react'
import styled from 'styled-components/macro'

import { SANS } from '../../utils/styled'

import StreamrLogo from './StreamrLogo'
import SearchInput from './SearchInput'
import Stats from './Stats'
import Graphs from './Graphs'

const Container = styled.div`
  position: absolute;
  left: 32px;
  top: 32px;
  width: 375px;
  background: #ffffff;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  font-family: ${SANS};
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
    <Container>
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
    </Container>
  )
}

export default SearchBox
