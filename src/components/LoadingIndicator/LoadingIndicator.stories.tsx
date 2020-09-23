import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import LoadingIndicator from '.'
import { Provider as Pendingrovider, usePending } from '../../contexts/Pending'

export default {
  title: 'LoadingIndicator',
  component: LoadingIndicator,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Loader  = () => {
  const { start, isPending } = usePending('nodes')
  if (!isPending) {
    start()
  }
  return null
}

export const Loading: Story = (args) => (
  <Pendingrovider>
    <Loader />
    <LoadingIndicator {...args} />
  </Pendingrovider>
)
