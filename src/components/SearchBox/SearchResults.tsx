import React from 'react'
import styled from 'styled-components/macro'
import { FixedSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

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
  color: #cdcdcd;
  background-color: #ffffff;
  font-family: ${SANS};

  ${Icon} {
    background-color: #f5f5f5;
  }

  &:hover {
    background-color: #f5f5f5;

    ${Icon} {
      background-color: #efefef;
    }
  }

  &:active {
    background-color: #f5f5f5;
  }

  @media (min-width: ${SM}px) {
    grid-template-columns: 48px 1fr;
    height: 40px;
  }
`

const Name = styled.div`
  display: flex;
  min-width: 0;

  mark {
    background-color: transparent;
    font-weight: 700;
  }
`

const TruncatedPath = styled.span`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`

const PathFragment = styled.span`
  flex-shrink: 0;
`

const Description = styled.div``

const Item = styled.div`
  align-self: center;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 12px;
  white-space: nowrap;

  ${Name} {
    color: #323232;
    font-weight: 500;
    font-size: 12px;
  }

  ${Description} {
    font-weight: 500;
    font-size: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
  }

  @media (max-width: ${MD}px) {
    ${Name} {
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
  results: Array<SearchResult>
  onClick?: (result: SearchResult) => void
  highlight?: string
}

type ResultIconProps = {
  type: SearchResult['type']
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
  streams: 'Stream',
  locations: 'Place',
  nodes: 'Node',
}

type ResultRowProps = {
  index: number
  style: Object
}

const UnstyledSearchResults = ({
  results, onClick, highlight, ...props
}: Props) => {
  const ResultRow = ({ index, style }: ResultRowProps) => {
    const result = results[index]
    const fullname = truncate(result.name)
    const search = highlight && truncate(highlight)

    // Preserve last path fragment & allow the path before it to be truncated
    const lastSlashPos = fullname.lastIndexOf('/')

    const truncatedPath = lastSlashPos >= 0 ? fullname.slice(0, lastSlashPos) : fullname
    const pathFragment = lastSlashPos >= 0 ? fullname.slice(lastSlashPos + 1) : undefined

    return (
      <Row style={style} onClick={() => typeof onClick === 'function' && onClick(result)}>
        <IconWrapper>
          <Icon>
            <ResultIcon type={result.type} />
          </Icon>
        </IconWrapper>
        <Item>
          <Name>
            <TruncatedPath>
              <Highlight search={search}>{truncatedPath}</Highlight>
            </TruncatedPath>
            {!!pathFragment && (
              <PathFragment>
                /<Highlight search={search}>{pathFragment}</Highlight>
              </PathFragment>
            )}
          </Name>
          <Description>
            {result.type === 'streams' && (result.description || 'No description')}
            {result.type !== 'streams' && (resultTypes[result.type] || '')}
          </Description>
        </Item>
      </Row>
    )
  }

  return (
    <div {...props}>
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            height={height}
            width={width}
            itemCount={results.length}
            itemSize={40}
          >
            {ResultRow}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  )
}

const SearchResults = styled(UnstyledSearchResults)`
  @media (max-width: ${SM}px) {
    ${List} {
      grid-row-gap: 8px;
    }

    ${Row} {
      border: 1px solid #efefef;
      border-radius: 4px;
    }
  }

  @media (min-width: ${SM}px) {
    background-color: #ffffff;
  }
`

export default SearchResults
