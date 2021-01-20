import React from 'react'
import styled from 'styled-components/macro'

import { StreamIcon, NodeIcon, LocationIcon } from './Icons'
import Highlight from '../Highlight'

import { SearchResult } from '../../utils/api/streamr'
import { SM, MD, SANS } from '../../utils/styled'
import { truncate } from '../../utils/text'

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

  @media (min-width: ${SM}px) {
    width: 24px;
    height: 24px;
  }
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 64px 1fr;
  height: 64px;
  cursor: pointer;
  color: #CDCDCD;
  background-color: #FFFFFF;
  font-family: ${SANS};

  ${Icon} {
    background-color: #F5F5F5;
  }

  &:hover {
    background-color: #F5F5F5;

    ${Icon} {
      background-color: #EFEFEF;
    }
  }

  &:active {
    background-color: #F5F5F5;
  }

  @media (min-width: ${SM}px) {
    grid-template-columns: 48px 1fr;
    height: 40px;
  }
`

const Item = styled.div`
  align-self: center;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 12px;
  white-space: nowrap;

  > div:first-child {
    color: #323232;
    font-weight: 500;
    font-size: 12px;
  }

  > div:last-child {
    font-weight: 500;
    font-size: 10px;
  }

  > div {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
  }

  mark {
    background-color: transparent;
    font-weight: 700;
  }

  @media (max-width: ${MD}px) {
    > div:first-child {
      margin-bottom: 2px;
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
  onClick?: (result: SearchResult) => void,
  highlight?: string,
}

type ResultIconProps = {
  type: SearchResult['type'],
}

const ResultIcon = ({ type }: ResultIconProps) => {
  switch (type) {
    case 'streams':
      return <StreamIcon />

    case 'locations':
      return <LocationIcon />

    case 'nodes':
      return <NodeIcon />

    default:
      return null
  }
}

const resultTypes = {
  'streams': 'Stream',
  'locations': 'Place',
  'nodes': 'Node',
}

const UnstyledSearchResults = ({
  results,
  onClick,
  highlight,
  ...props
}: Props) => (
  <div {...props}>
    <List>
      {results.map((result) => (
        <Row key={result.id} onClick={() => typeof onClick === 'function' && onClick(result)}>
          <IconWrapper>
            <Icon>
              <ResultIcon type={result.type} />
            </Icon>
          </IconWrapper>
          <Item>
            <div>
              <Highlight search={highlight && truncate(highlight)}>
                {truncate(result.name)}
              </Highlight>
            </div>
            <div>{resultTypes[result.type] || ('')}</div>
          </Item>
        </Row>
      ))}
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
  }

  @media (min-width: ${SM}px) {
    background-color: #FFFFFF;
  }
`

export default SearchResults
