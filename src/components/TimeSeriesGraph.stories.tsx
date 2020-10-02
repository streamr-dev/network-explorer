import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import TimeSeriesGraph, { Props } from './TimeSeriesGraph'

export default {
  title: 'TimeSeriesGraph',
  component: TimeSeriesGraph,
} as Meta

const ONE_DAY = 24 * 60 * 60 * 1000
const startDate = new Date(2020, 1, 1, 10).getTime()

const data = [
  {
    x: startDate,
    y: 1,
  },
  {
    x: startDate + 1 * ONE_DAY,
    y: 5,
  },
  {
    x: startDate + 2 * ONE_DAY,
    y: 4,
  },
  {
    x: startDate + 3 * ONE_DAY,
    y: 12,
  },
]

const Template: Story<Props> = (args) => (
  <TimeSeriesGraph {...args} />
)

export const WithHeightDefined = Template.bind({})
WithHeightDefined.args = {
  graphData: data,
  height: '100px',
}

export const WithRatioDefined = Template.bind({})
WithRatioDefined.args = {
  graphData: data,
  ratio: '5:2',
}

export const WithCrosshair = Template.bind({})
WithCrosshair.args = {
  graphData: data,
  showCrosshair: true,
}
