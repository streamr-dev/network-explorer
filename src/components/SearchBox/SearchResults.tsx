import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components/macro'

import { StreamIcon, NodeIcon, LocationIcon } from './Icons'
import { SearchResult } from '../../utils/api/streamr'
import { SM, MD, SANS } from '../../utils/styled'

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const Icon = styled.div`
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 4px;

  svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
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
  background-color: #FFFFFF;
  font-family: ${SANS};
  font-size: 12px;

  &:hover {
    background-color: #F8F8F8;

    ${Icon} {
      background-color: transparent;
    }
  }

  &:active {
    background-color: #F5F5F5;
  }

  @media (min-width: ${MD}px) {
    font-size: 14px;
  }
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

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: ${SM}px) {
    span {
      display: block;
    }
  }

  @media (min-width: ${SM}px) {
    span + span {
      margin-left: 8px;
    }
  }
`

const List = styled.div`
  display: grid;

  a,
  a:hover,
  a:active,
  a:visited {
    text-decoration: none;
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
      <IconWrapper>
        <Icon>
          <StreamIcon />
        </Icon>
      </IconWrapper>
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
    <IconWrapper>
      <Icon>
        <NodeIcon />
      </Icon>
    </IconWrapper>
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
    <IconWrapper>
      <Icon>
        <LocationIcon />
      </Icon>
    </IconWrapper>
    <Item>
      <span>{name}</span>
      <span>{description}</span>
    </Item>
  </Row>
)

const UnstyledSearchResults = ({ results, ...props }: Props) => (
  <div {...props}>
    <List>
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
    </List>
  </div>
)

const SearchResults = styled(UnstyledSearchResults)`
  @media (max-width: ${SM}px) {
    ${List} {
      grid-row-gap: 8px;
    }

    ${Row} {
      border: 1px solid #EFEFEF;
      border-radius: 4px;
    }

    ${Icon} {
      background-color: #F5F5F5;
    }
  }

  @media (min-width: ${SM}px) {
    background-color: #FFFFFF;
  }
`

export default SearchResults
