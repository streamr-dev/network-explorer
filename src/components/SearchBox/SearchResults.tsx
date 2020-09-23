import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components/macro'

import { StreamIcon, NodeIcon, LocationIcon } from './Icons'
import { SearchResult } from '../../utils/api/streamr'

const Container = styled.div`
  display: grid;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr;
  height: 40px;
  font-size: 12px;
  line-height: 16px;
  cursor: pointer;

  &:hover {
    background: #F5F5F5;
  }
`

const Icon = styled.div`
  align-self: center;
  justify-self: center;
`

const Description = styled.div`
  align-self: center;
`

type Props = {
  results: Array<SearchResult>,
}

const Stream = ({ id, type, name }: SearchResult) => (
  <Row as={Link} to={`/streams/${id}`}>
    <Icon>
      <StreamIcon />
    </Icon>
    <Description>
      {name}
    </Description>
  </Row>
)

const Node = ({ id, type, name }: SearchResult) => (
  <Row>
    <Icon>
      <NodeIcon />
    </Icon>
    <Description>
      {name}
    </Description>
  </Row>
)

const Location = ({ id, type, name }: SearchResult) => (
  <Row>
    <Icon>
      <LocationIcon />
    </Icon>
    <Description>
      {name}
    </Description>
  </Row>
)

const SearchResults = ({ results }: Props) => (
  <Container>
    {results.map((result) => {
      switch (result.type) {
        case 'streams':
          return <Stream key={result.id} {...result} />

        case 'locations':
          return <Location key={result.id} {...result} />

        case 'nodes':
          return <Node key={result.id} {...result} />

        default:
          return null
      }
    })}
  </Container>
)

export default SearchResults
