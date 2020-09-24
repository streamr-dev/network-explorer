import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import Stats, { Props } from './Stats'

export default {
  title: 'Stats',
  component: Stats,
} as Meta

const Template: Story<Props> = (args) => (
  <Stats {...args} />
)

export const Selectable = Template.bind({})
Selectable.args = {
  values: {
    'Key 1': 100,
    'Key 2': 200,
    'Key 3': 300,
  },
}

export const Disabled = Template.bind({})
Disabled.args = {
  disabled: true,
  values: {
    'Key 1': 100,
    'Key 2': 200,
    'Key 3': 300,
  },
}
