import React from 'react'
import styled from 'styled-components/macro'

const Container = styled.div`
  position: absolute;
  left: 32px;
  top: 32px;
  width: 375px;
  background: #ffffff;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.08);
  border-radius: 4px;
`

const Search = styled.div`
  height: 64px;
  display: grid;
  grid-template-columns: 64px 1fr;
`

const Logo = styled.div`
  content: 'LOGO';
`

const SearchInput = styled.div`
  width: 100%;
`

const Statistics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
`

const Stat = styled.div`
  height: 64px;
  color: #323232;
`

const Graph = styled.div`
  height: 264px;
`

const SearchBox = () => {
  return (
    <Container>
      <Search>
        <Logo />
        <SearchInput />
      </Search>
      <Statistics>
        <Stat>123</Stat>
        <Stat>456</Stat>
        <Stat>789</Stat>
      </Statistics>
      <Graph />
    </Container>
  )
}

export default SearchBox
