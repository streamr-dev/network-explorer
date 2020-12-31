import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import LoadingIndicator from '.'

export default {
  title: 'LoadingIndicator',
  component: LoadingIndicator,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

export const Loading: Story = (args) => (
  <LoadingIndicator loading />
)
