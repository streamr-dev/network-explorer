import React from 'react'
import styled from 'styled-components'
import { SANS } from '../../utils/styled'
import { Provider as GraphProvider, Interval } from './Graphs'

type Props = {
  children: React.ReactNode
  defaultInterval?: Interval
}

const UnstyledGraphs = ({ children, defaultInterval, ...props }: Props) => (
  <GraphProvider defaultInterval={defaultInterval}>
    <div {...props}>{children || null}</div>
  </GraphProvider>
)

export const Graphs = styled(UnstyledGraphs)`
  position: relative;
  display: grid;
  grid-template-rows: 200px 64px;
  font-family: ${SANS};
`
