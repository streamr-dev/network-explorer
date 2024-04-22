import { Meta } from '@storybook/react'
import React from 'react'
import { Graphs } from '.'
import { GraphPlaceholder } from './GraphPlaceholder'
import { Intervals } from './Intervals'
import { TimeSeries } from './TimeSeries'
import { Loading } from './Loading'

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
      <TimeSeries graphData={{ data }} height="200px" ratio="1:2" />
      <Intervals options={['24hours', '1month', '3months', 'all']} />
    </Graphs>
  )
}

export const WithDisabledInterval = () => {
  return (
    <Graphs>
      <TimeSeries graphData={{ data }} height="200px" ratio="1:2" />
      <Intervals options={['24hours', '1month', '3months', 'all']} disabled />
    </Graphs>
  )
}

export const WithEmptyPlaceholder = () => {
  return (
    <Graphs>
      <GraphPlaceholder />
      <Intervals options={['24hours', '1month', '3months', 'all']} disabled />
    </Graphs>
  )
}

export const WithImagePlaceholder = () => {
  return (
    <Graphs>
      <GraphPlaceholder showImage />
      <Intervals options={['24hours', '1month', '3months', 'all']} disabled />
    </Graphs>
  )
}

export const WithLoadingIndicator = () => {
  return (
    <Graphs>
      <TimeSeries graphData={{ data }} height="200px" ratio="1:2" />
      <Loading loading row={2} />
      <Intervals options={['24hours', '1month', '3months', 'all']} />
    </Graphs>
  )
}
