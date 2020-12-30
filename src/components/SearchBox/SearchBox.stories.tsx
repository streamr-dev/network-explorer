import React, { useState } from 'react'
import styled, { css } from 'styled-components'
import { Meta } from '@storybook/react/types-6-0'
import { MemoryRouter } from 'react-router-dom'

import { SearchResult } from '../../utils/api/streamr'
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
        <Search.Results results={results} />
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
