import React from 'react'
import { Meta } from '@storybook/react/types-6-0'

import Graphs from '.'

export default {
  title: 'Graphs',
  component: Graphs,
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

export const WithIntervalSelect = () => {
  return (
    <Graphs>
      <Graphs.TimeSeries
        graphData={{ data }}
        height="200px"
        ratio="1:2"
      />
      <Graphs.Intervals options={['24hours', '1month', '3months', 'all']} />
    </Graphs>
  )
}

export const WithLoadingIndicator = () => {
  return (
    <Graphs>
      <Graphs.TimeSeries
        graphData={{ data }}
        height="200px"
        ratio="1:2"
      />
      <Graphs.Loading loading row={2} />
      <Graphs.Intervals options={['24hours', '1month', '3months', 'all']} />
    </Graphs>
  )
}
