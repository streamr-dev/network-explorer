import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import Graphs, { Props } from './Graphs'

export default {
  title: 'Graphs',
  component: Graphs,
} as Meta

const Template: Story<Props> = (args) => (
  <Graphs {...args} />
)

export const Basic = Template.bind({})
Basic.args = {
  name: 'test',
}
