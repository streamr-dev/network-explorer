import React from 'react'
import styled from 'styled-components'
import { Virtuoso } from 'react-virtuoso'
import { StreamIcon, NodeIcon, LocationIcon } from './Icons'
import Highlight from '../Highlight'
import { SM, MD, SANS } from '../../utils/styled'
import { truncate } from '../../utils/text'
import { SearchResultItem } from '../../types'
import { useNavigate, useSearchParams } from 'react-router-dom'

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

const Details = styled.div`
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
  results: SearchResultItem[]
  highlight?: string
}

const resultTypes: Record<SearchResultItem['type'], string> = {
  node: 'Node',
  place: 'Place',
  stream: 'Stream',
}

type ResultRowProps = {
  result: SearchResultItem
}

export function SearchResults({ results, highlight, ...props }: Props) {
  // const ResultRow = ({ result }: ResultRowProps) => {
  //   const fullname = truncate(result.name)
  //   const search = highlight && truncate(highlight)

  //   // Preserve last path fragment & allow the path before it to be truncated
  //   const lastSlashPos = fullname.lastIndexOf('/')

  //   const truncatedPath = lastSlashPos >= 0 ? fullname.slice(0, lastSlashPos) : fullname
  //   const pathFragment = lastSlashPos >= 0 ? fullname.slice(lastSlashPos + 1) : undefined

  //   return (
  //     <Row onClick={() => typeof onClick === 'function' && onClick(result)}>
  //       <IconWrapper>
  //         <Icon>
  //           <ResultIcon type={result.type} />
  //         </Icon>
  //       </IconWrapper>
  //       <Details>
  //         <Name>
  //           <TruncatedPath>
  //             <Highlight search={search}>{truncatedPath}</Highlight>
  //           </TruncatedPath>
  //           {!!pathFragment && (
  //             <PathFragment>
  //               /<Highlight search={search}>{pathFragment}</Highlight>
  //             </PathFragment>
  //           )}
  //         </Name>
  //         <Description>
  //           {result.type === 'streams' && (result.description || 'No description')}
  //           {result.type !== 'streams' &&
  //             (resultTypes[result.type as keyof typeof resultTypes] || '')}
  //         </Description>
  //       </Details>
  //     </Row>
  //   )
  // }
  return (
    <SearchResultsRoot {...props}>
      <Virtuoso
        data={results}
        itemContent={(_, result) => <Item value={result} />}
      />
    </SearchResultsRoot>
  )
}

interface ItemProps {
  value: SearchResultItem
}

function Item({ value }: ItemProps) {
  const [, setSearchParams] = useSearchParams()

  const navigate = useNavigate()

  return (
    <Row
      onClick={() => {
        if (value.type === 'place') {
          setSearchParams({
            l: `${value.payload.longitude},${value.payload.latitude},10z`
          })

          return
        }

        if (value.type === 'node') {
          navigate(`/nodes/${value.payload.id}`)

          return
        }
      }}
    >
      <IconWrapper>
        <Icon>
          {value.type === 'stream' && <StreamIcon />}
          {value.type === 'place' && <LocationIcon />}
          {value.type === 'node' && <NodeIcon />}
        </Icon>
      </IconWrapper>
      <Details>
        <Name>
          {value.title}
        </Name>
      </Details>
    </Row>
  )
}

export const SearchResultsRoot = styled.div`
  @media (max-width: ${SM}px) {
    ${List} {
      grid-row-gap: 8px;
    }

    ${Row} {
      border: 1px solid #efefef;
      border-radius: 4px;
      height: 42px;
      margin-bottom: 4px;
    }
  }

  @media (min-width: ${SM}px) {
    background-color: #ffffff;
  }
`
