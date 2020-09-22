import React from 'react'
import styled from 'styled-components/macro'

import { StreamIcon, NodeIcon, LocationIcon } from './Icons'

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

export enum ResultType {
  Stream,
  Node,
  Location
}

export type SearchResult = {
  name: string,
  type: ResultType,
  nodeCount?: number,
}

type Props = {
  results: Array<SearchResult>,
}

const SearchResults = ({ results }: Props) => (
  <Container>
    {results.map((result, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <Row key={index}>
        <Icon>
          {result.type === ResultType.Stream && <StreamIcon />}
          {result.type === ResultType.Node && <NodeIcon />}
          {result.type === ResultType.Location && <LocationIcon />}
        </Icon>
        <Description>
          {result.name}
        </Description>
      </Row>
    ))}
  </Container>
)

export default SearchResults
