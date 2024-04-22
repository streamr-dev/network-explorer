import { Meta } from '@storybook/react'
import React, { useCallback, useReducer, useState } from 'react'
import styled from 'styled-components'
import { NodeList, NodeListHeader } from '.'
import { getNodeLocationId } from '../../utils/map'
import Error from '../Error'
import { Stat, Stats } from '../Stats'
import { NodeListItem } from './NodeListItem'
import Pager from './Pager'
import { usePaginatedItems } from '../../hooks'

const Wrapper = styled.div`
  background-color: lightblue;
  padding: 16px;
`

export default {
  title: 'NodeList',
  component: NodeList,
  decorators: [
    (Story) => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} as Meta

const nodes = [
  {
    id: '0xa3d1F77ACfF0060F7213D7BF3c7fEC78df847De1',
    title: 'Quick Green Aadvaark',
    latitude: 60.16952,
    longitude: 24.93545,
    placeName: 'Helsinki',
  },
  {
    id: '0x13581255eE2D20e780B0cD3D07fac018241B5E03',
    title: 'Warm Fiery Octagon',
    latitude: 60.14952,
    longitude: 24.92545,
    placeName: 'Helsinki',
  },
  {
    id: '0xFeaDE0B77130F5468D57037e2a259295bfdD8390',
    title: 'Gold Spicy Fieldmouse',
    latitude: 52.51667,
    longitude: 13.38333,
    placeName: 'Berlin',
  },
  {
    id: '0x538a2Fa87E03B280e10C83AA8dD7E5B15B868BD9',
    title: 'Curved Slick Diamond',
    latitude: 47.49833,
    longitude: 19.04083,
    placeName: 'Budapest',
  },
]

export const Basic = () => (
  <NodeList>
    {nodes.map(({ id, title, placeName, longitude, latitude }) => (
      <NodeListItem
        key={id}
        nodeId={id}
        nodeLocationId={getNodeLocationId({ longitude, latitude })}
        title={title}
        placeName={placeName}
      />
    ))}
  </NodeList>
)

export const WithHeader = () => (
  <NodeList>
    <NodeListHeader>
      Showing all <strong>{nodes.length}</strong> nodes
    </NodeListHeader>
    {nodes.map(({ id, title, placeName, longitude, latitude }) => (
      <NodeListItem
        key={id}
        nodeId={id}
        nodeLocationId={getNodeLocationId({ longitude, latitude })}
        title={title}
        placeName={placeName}
      />
    ))}
  </NodeList>
)

export const WithStats = () => {
  const [activeNode, setActiveNode] = useState<string | undefined>(undefined)

  return (
    <NodeList>
      {nodes.map(({ id, title, placeName, longitude, latitude }) => (
        <NodeListItem
          key={id}
          nodeId={id}
          nodeLocationId={getNodeLocationId({ longitude, latitude })}
          title={title}
          placeName={placeName}
          onClick={() => setActiveNode((prev) => (prev !== id ? id : undefined))}
          isActive={activeNode === id}
        >
          <Stats>
            <Stat id="messagesPerSecond" label="Msgs/sec" value={undefined} />
            <Stat id="mbsPerSecond" label="MB/S" value={undefined} />
            <Stat id="latency" label="Latency ms" value={undefined} />
          </Stats>
        </NodeListItem>
      ))}
    </NodeList>
  )
}

type Store = {
  activeNode?: string | undefined
  selectedStat?: string | undefined
  error?: string | undefined
}

export const WithStatsAndError = () => {
  const [{ activeNode, selectedStat, error }, update] = useReducer(
    (prevState: Store, nextState: Store) => ({
      ...(prevState || {}),
      ...nextState,
    }),
    {
      activeNode: undefined,
      selectedStat: undefined,
      error: undefined,
    },
  )

  const onNodeClick = useCallback(
    (id: string | undefined) => {
      update({
        activeNode: id,
        selectedStat: undefined,
        error: undefined,
      })
    },
    [update],
  )

  const onStatClick = useCallback(
    (id: string | undefined) => {
      update({
        selectedStat: id,
        error: id && `Failed to load ${id}`,
      })
    },
    [update],
  )

  return (
    <NodeList>
      {nodes.map(({ id, title, placeName, longitude, latitude }) => (
        <NodeListItem
          key={id}
          nodeId={id}
          nodeLocationId={getNodeLocationId({ longitude, latitude })}
          title={title}
          placeName={placeName}
          onClick={() => onNodeClick(id !== activeNode ? id : undefined)}
          isActive={activeNode === id}
        >
          <Stats active={selectedStat}>
            <Stat
              id="messagesPerSecond"
              label="Msgs/sec"
              value={undefined}
              onClick={() =>
                onStatClick(selectedStat !== 'messagesPerSecond' ? 'messagesPerSecond' : undefined)
              }
            />
            <Stat
              id="mbsPerSecond"
              label="MB/S"
              value={undefined}
              onClick={() =>
                onStatClick(selectedStat !== 'mbsPerSecond' ? 'mbsPerSecond' : undefined)
              }
            />
            <Stat
              id="latency"
              label="Latency ms"
              value={undefined}
              onClick={() => onStatClick(selectedStat !== 'latency' ? 'latency' : undefined)}
            />
          </Stats>
          {!!error && <Error>{error}</Error>}
        </NodeListItem>
      ))}
    </NodeList>
  )
}

type Node = {
  id: string
  title: string
  address: string
  placeName: string
  longitude: number
  latitude: number
}

const longList: Array<Node> = Array.from(
  {
    length: 150,
  },
  (v, i) => ({
    id: `node-${i + 1}`,
    title: `Node ${i + 1}`,
    address: `node-${i + 1}`,
    placeName: 'Helsinki',
    longitude: 53,
    latitude: 17,
  }),
)

const PAGE_SIZE = 4

export const Paged = () => {
  const {
    page: currentPage,
    setPage,
    items,
    totalPages: pages,
  } = usePaginatedItems<Node>(longList, {
    pageSize: PAGE_SIZE,
  })

  return (
    <NodeList>
      <Pager currentPage={currentPage} lastPage={pages} onChange={setPage} />
      {items.map(({ id, title, placeName, longitude, latitude }) => (
        <NodeListItem
          key={id}
          nodeId={id}
          nodeLocationId={getNodeLocationId({ longitude, latitude })}
          title={title}
          placeName={placeName}
        />
      ))}
    </NodeList>
  )
}
