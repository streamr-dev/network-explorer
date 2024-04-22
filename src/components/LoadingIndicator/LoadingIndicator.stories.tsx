import React from 'react'
import { Meta, StoryFn } from '@storybook/react'
import LoadingIndicator from '.'

export default {
  title: 'LoadingIndicator',
  component: LoadingIndicator,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

export const Loading: StoryFn = (args) => <LoadingIndicator loading />
