import React from 'react'
import { Meta } from '@storybook/react/types-6-0'
import { MemoryRouter } from 'react-router-dom'

import SearchBox from '.'
import { Provider as NodesProvider } from '../../contexts/Nodes'
import { Provider as PendingProvider } from '../../contexts/Pending'
import { Provider as StreamProvider } from '../../contexts/Stream'

export default {
  title: 'SearchBox',
  component: SearchBox,
} as Meta

export const Basic = () => (
  <MemoryRouter>
    <PendingProvider>
      <NodesProvider>
        <StreamProvider>
          <SearchBox />
        </StreamProvider>
      </NodesProvider>
    </PendingProvider>
  </MemoryRouter>
)
