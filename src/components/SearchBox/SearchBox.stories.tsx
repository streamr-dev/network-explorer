import React from 'react'
import { Meta } from '@storybook/react/types-6-0'
import { MemoryRouter } from 'react-router-dom'

import SearchBox from '.'
import { Provider as StoreProvider } from '../../contexts/Store'
import { Provider as PendingProvider } from '../../contexts/Pending'

export default {
  title: 'SearchBox',
  component: SearchBox,
} as Meta

export const Basic = () => (
  <MemoryRouter>
    <PendingProvider>
      <StoreProvider>
        <SearchBox />
      </StoreProvider>
    </PendingProvider>
  </MemoryRouter>
)
