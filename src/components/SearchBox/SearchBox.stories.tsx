import React, { useState, useCallback } from 'react'
import styled, { css } from 'styled-components'
import { Meta } from '@storybook/react/types-6-0'
import { MemoryRouter } from 'react-router-dom'

import { SearchResult } from '../../utils/api/streamr'
import Stats from '../Stats'
import Error from '../Error'
import { SM } from '../../utils/styled'

import Search from './Search'
import SearchBox from '.'

export default {
  title: 'SearchBox',
  component: SearchBox,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
} as Meta

const Wrapper = styled.div`
  background-color: lightblue;
  padding: 16px;

  ${({ theme }) => !!theme.focused && css`
    @media (max-width: ${SM}px) {
      padding: 0;
    }
  `}
`

const results: Array<SearchResult> = [{
  id: '1',
  type: 'streams',
  name: 'Stream XYZ',
  description: 'Somekind of stream',
}, {
  id: '2',
  type: 'locations',
  name: 'Helsinki',
  description: 'Helsinki, Finland',
}, {
  id: '3',
  type: 'nodes',
  name: 'Warm Fiery Octagon',
  description: '0xa3d1F77ACfF0060F7213D7BF3c7fEC78df847De1',
}, {
  id: '4',
  type: 'streams',
  name: '0xa3d1F77ACfF0060F7213D7BF3c7fEC78df847De1/test/long-path',
}, {
  id: '4',
  type: 'streams',
  name: '0xa3d1F77ACfF0060F7213D7BF3c7fEC78df847De1/test/another/category/also/very/long-path',
  description: 'Real-time telemetrics from public transport vehicles in Helsinki, Finland.',
}]

export const Basic = () => {
  const [search, setSearch] = useState('')

  return (
    <Wrapper>
      <Search>
        <Search.Input
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
        />
      </Search>
    </Wrapper>
  )
}

export const BasicWithBackButton = () => {
  const [search, setSearch] = useState('')

  return (
    <Wrapper>
      <Search>
        <Search.Input
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          theme={{
            showMobileBackButton: true,
          }}
        />
      </Search>
    </Wrapper>
  )
}

export const Focused = () => {
  const [search, setSearch] = useState('')
  const [focused, setFocused] = useState(false)

  return (
    <Wrapper theme={{
      focused,
    }}
    >
      <Search>
        <Search.Input
          value={search}
          onChange={setSearch}
          onClear={() => {
            setSearch('')
            setFocused(false)
          }}
          onBack={() => setFocused(false)}
          onFocus={() => setFocused(true)}
          theme={{
            searchActive: focused,
            showMobileBackButton: focused,
          }}
        />
        <Search.Results results={results} />
      </Search>
    </Wrapper>
  )
}

export const WithResults = () => {
  const [search, setSearch] = useState('')

  return (
    <Wrapper>
      <Search>
        <Search.Input
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
        />
        <Search.Results
          results={results}
          highlight={search}
        />
      </Search>
    </Wrapper>
  )
}

export const SearchInput = () => {
  const [search, setSearch] = useState('')

  return (
    <Search.Input
      value={search}
      onChange={setSearch}
      onClear={() => setSearch('')}
    />
  )
}

export const SearchResults = () => (
  <Search.Results results={results} />
)

export const SearchWithStats = () => {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(undefined)

  const onClick = useCallback((name) => {
    setSelected((prev) => prev !== name ? name : undefined)
  }, [])

  return (
    <Wrapper>
      <Search>
        <Search.Input
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
        />
        <Stats active={selected}>
          <Stats.Stat
            id="1"
            label="Key 1"
            value={100}
            onClick={() => onClick('1')}
          />
          <Stats.Stat
            id="2"
            label="Key 2"
            value={200}
            onClick={() => onClick('2')}
          />
          <Stats.Stat
            id="3"
            label="Key 3"
            value={300}
            onClick={() => onClick('3')}
          />
        </Stats>
        {!!selected && (
          <Error>
            Error loading the graph
          </Error>
        )}
      </Search>
    </Wrapper>
  )
}
