import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import { useStore } from '../../Store'
import { useMap, useNavigateToNodeCallback } from '../../hooks'
import { ActiveView, SearchResultItem } from '../../types'
import { isFramed } from '../../utils'
import { getNodeLocationId, setNodeFeatureState } from '../../utils/map'
import { SANS, SM, SmallDesktopMedia, TabletMedia } from '../../utils/styled'
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
  background-color: #ffffff;
  border: 1px solid #efefef;
  border-radius: 4px;
  color: #cdcdcd;
  cursor: pointer;
  display: grid;
  font-family: ${SANS};
  grid-template-columns: 48px 1fr;
  height: 42px;
  margin-bottom: 4px;

  ${Icon} {
    background-color: #f5f5f5;
  }

  &:hover {
    background-color: #f5f5f5;
  }

  &:hover ${Icon} {
    background-color: #efefef;
  }

  @media ${TabletMedia} {
    border: 0;
    grid-template-columns: 48px 1fr;
    height: 48px;
    margin-bottom: 0;
  }

  &:active {
    background-color: #f5f5f5;
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
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 2px;
  }

  ${Description} {
    font-weight: 500;
    font-size: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
  }

  @media ${SmallDesktopMedia} {
    ${Name} {
      margin-bottom: 0;
    }
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
      {results.map((value) => (
        <Item key={value.payload.id} value={value} highlight={highlight} onClick={onItemClick} />
      ))}
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

  const navigateToNode = useNavigateToNodeCallback()

  const map = useMap()

  const { invalidateLocationParamKey, invalidateNodeIdParamKey, setActiveView } = useStore()

  return (
    <Row
      onClick={() => {
        onClick?.(value)

        setActiveView(ActiveView.Map)

        if (value.type === 'place') {
          setSearchParams((prev) => ({
            ...Object.fromEntries(prev),
            l: `${value.payload.longitude},${value.payload.latitude},10z`,
          }))

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
          navigateToNode(value.payload.id)

          /**
           * If the page address includes the node id already and the user
           * panned away then the above won't be sufficient to get node's location
           * back into viewport. To address it, we have to invalidate the node id
           * param key.
           */
          invalidateNodeIdParamKey()

          return
        }

        if (value.type === 'stream') {
          navigate(
            {
              pathname: `/streams/${encodeURIComponent(value.payload.id)}/`,
              search: window.location.search,
            },
            {
              replace: isFramed(),
            },
          )

          return
        }
      }}
      onMouseEnter={() => {
        if (value.type !== 'node') {
          return
        }

        setNodeFeatureState(map?.getMap(), getNodeLocationId(value.payload.location), {
          hover: true,
        })
      }}
      onMouseLeave={() => {
        if (value.type !== 'node') {
          return
        }

        setNodeFeatureState(map?.getMap(), getNodeLocationId(value.payload.location), {
          hover: false,
        })
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
  border-top: 1px solid #efefef;
  border-radius: 0 0 4px 4px;
  overflow: auto;

  @media ${TabletMedia} {
    background-color: #ffffff;
  }
`
