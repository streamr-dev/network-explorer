import React from 'react'
import { Meta, StoryFn } from '@storybook/react'

import Highlight from '.'

export default {
  title: 'Highlight',
  component: Highlight,
} as Meta

const Template: StoryFn<{
  search: string
}> = ({ search }) => (
  <Highlight search={search}>The quick brown fox jumps over the lazy dog</Highlight>
)

export const Basic = Template.bind({})
Basic.args = {
  search: 'brown',
}
