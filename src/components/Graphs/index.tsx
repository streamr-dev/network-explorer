import React from 'react'
import styled from 'styled-components/macro'

import { SANS } from '../../utils/styled'

import { Provider as GraphProvider, Interval } from './Graphs'
import Intervals from './Intervals'
import TimeSeries from './TimeSeries'
import Placeholder from './Placeholder'
import Loading from './Loading'

type Props = {
  children: React.ReactNode,
  defaultInterval?: Interval,
}

const UnstyledGraphs = ({ children, defaultInterval, ...props }: Props) => (
  <GraphProvider defaultInterval={defaultInterval}>
    <div {...props}>
      {children || null}
    </div>
  </GraphProvider>
)

const Graphs = styled(UnstyledGraphs)`
  position: relative;
  display: grid;
  grid-template-rows: 200px 64px;
  font-family: ${SANS};
`

export default Object.assign(Graphs, {
  Intervals,
  TimeSeries,
  Placeholder,
  Loading,
})
