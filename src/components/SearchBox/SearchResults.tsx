import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components/macro'

import { StreamIcon, NodeIcon, LocationIcon } from './Icons'
import { SearchResult } from '../../utils/api/streamr'

const Container = styled.div`
  display: grid;
  max-height: 280px;
  overflow: scroll;

  a,
  a:hover,
  a:active,
  a:visited {
    text-decoration: none;
  }
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 64px 1fr;
  height: 64px;
  font-size: 12px;
  line-height: 16px;
  cursor: pointer;
  color: #CDCDCD;

  &:hover {
    background: #F5F5F5;
  }
`

const Icon = styled.div`
  align-self: center;
  justify-self: center;
`

const Item = styled.div`
  align-self: center;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 12px;
  white-space: nowrap;

  span:first-child {
      color: #323232;
      font-weight: 500;
  }

  span + span {
    margin-left: 8px;
  }
`

type Props = {
  results: Array<SearchResult>,
}

const Stream = ({
  id,
  type,
  name: nameProp,
  description,
}: SearchResult) => {
  const name = useMemo(() => {
    if (nameProp.indexOf('0x') === 0) {
      return nameProp.replace(/^0x([A-Fa-f0-9]{3})[A-Fa-f0-9]*([A-Fa-f0-9]{5})/, '0x$1...$2')
    }

    return nameProp
  }, [nameProp])

  return (
    <Row as={Link} to={`/streams/${encodeURIComponent(id)}`}>
      <Icon>
        <StreamIcon />
      </Icon>
      <Item>
        <span>{name}</span>
        <span>{description}</span>
      </Item>
    </Row>
  )
}

const Node = ({
  id,
  type,
  name,
  description,
}: SearchResult) => (
  <Row as={Link} to={`/nodes/${id}`}>
    <Icon>
      <NodeIcon />
    </Icon>
    <Item>
      <span>{name}</span>
      <span>{description}</span>
    </Item>
  </Row>
)

const Location = ({
  id,
  type,
  name,
  description,
}: SearchResult) => (
  <Row>
    <Icon>
      <LocationIcon />
    </Icon>
    <Item>
      <span>{name}</span>
      <span>{description}</span>
    </Item>
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
