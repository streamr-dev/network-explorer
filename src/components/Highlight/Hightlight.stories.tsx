import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import Highlight from '.'

export default {
  title: 'Highlight',
  component: Highlight,
} as Meta

const Template: Story<{
  search: string
}> = ({ search }) => (
  <Highlight search={search}>The quick brown fox jumps over the lazy dog</Highlight>
)

export const Basic = Template.bind({})
Basic.args = {
  search: 'brown',
}
