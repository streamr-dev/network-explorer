import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Virtuoso } from 'react-virtuoso'
import styled from 'styled-components'
import { useStore } from '../../contexts/Store'
import { SearchResultItem } from '../../types'
import { getNodeLocationId, setNodeFeatureState } from '../../utils/map'
import { MD, SANS, SM } from '../../utils/styled'
import Highlight from '../Highlight'
import { LocationIcon, NodeIcon, StreamIcon } from './Icons'

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
  onItemClick?(item: SearchResultItem): void
}

export function SearchResults({ results, highlight, onItemClick, ...props }: Props) {
  return (
    <SearchResultsRoot {...props}>
      <Virtuoso
        data={results}
        itemContent={(_, result) => (
          <Item value={result} highlight={highlight} onClick={onItemClick} />
        )}
      />
    </SearchResultsRoot>
  )
}

interface ItemProps {
  highlight: string | undefined
  onClick?(value: SearchResultItem): void
  value: SearchResultItem
}

function Item({ highlight, value, onClick }: ItemProps) {
  const [, setSearchParams] = useSearchParams()

  const navigate = useNavigate()

  const { invalidateLocationParamKey, invalidateNodeIdParamKey, mapRef } = useStore()

  return (
    <Row
      onClick={() => {
        onClick?.(value)

        if (value.type === 'place') {
          setSearchParams({
            l: `${value.payload.longitude},${value.payload.latitude},10z`,
          })

          /**
           * If the page address includes the coordinates already and the user
           * panned away then the above won't be sufficient to get the location
           * back into viewport. To address it, we have to invalidate the local
           * location param key.
           */
          invalidateLocationParamKey()

          return
        }

        if (value.type === 'node') {
          navigate(`/nodes/${value.payload.id}`)

          /**
           * If the page address includes the node id already and the user
           * panned away then the above won't be sufficient to get node's location
           * back into viewport. To address it, we have to invalidate the node id
           * param key.
           */
          invalidateNodeIdParamKey()

          return
        }
      }}
      onMouseEnter={() => {
        if (value.type !== 'node') {
          return
        }

        setNodeFeatureState(mapRef, getNodeLocationId(value.payload.location), { hover: true })
      }}
      onMouseLeave={() => {
        if (value.type !== 'node') {
          return
        }

        setNodeFeatureState(mapRef, getNodeLocationId(value.payload.location), { hover: false })
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
          <div>
            <Highlight search={highlight}>{value.title}</Highlight>
          </div>
        </Name>
        <Description>{value.description}</Description>
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
