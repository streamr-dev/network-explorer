import { Meta, StoryFn } from '@storybook/react'
import React from 'react'
import { Props, TimeSeries } from './TimeSeries'

export default {
  title: 'TimeSeries',
  component: TimeSeries,
} as Meta

const ONE_DAY = 24 * 60 * 60 * 1000
const startDate = new Date(2020, 1, 1, 10).getTime()

const data1 = [
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

const data2 = [
  {
    x: startDate,
    y: 4,
  },
  {
    x: startDate + 1 * ONE_DAY,
    y: 16,
  },
  {
    x: startDate + 2 * ONE_DAY,
    y: 7,
  },
  {
    x: startDate + 3 * ONE_DAY,
    y: 9,
  },
]

const Template: StoryFn<Props> = (args) => <TimeSeries {...args} />

export const WithHeightDefined = Template.bind({})
WithHeightDefined.args = {
  graphData: { data1 },
  height: '100px',
}

export const WithRatioDefined = Template.bind({})
WithRatioDefined.args = {
  graphData: { data1 },
  ratio: '5:2',
}

export const WithTwoGraphs = Template.bind({})
WithTwoGraphs.args = {
  graphData: { data1, data2 },
  ratio: '5:2',
}

export const WithCrosshair = Template.bind({})
WithCrosshair.args = {
  graphData: { data1 },
  showCrosshair: true,
}

export const WithLabelFormat = Template.bind({})
WithLabelFormat.args = {
  graphData: { data1 },
  showCrosshair: true,
  labelFormat: (value) => `Formatted value: ${value}`,
}
