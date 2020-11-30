import React, { useState, useMemo, useContext } from 'react'
import styled from 'styled-components/macro'

import { SANS } from '../../utils/styled'
import TimeSeries from './TimeSeries'

const IntervalContainer = styled.div`
  border-top: 1px solid #EFEFEF;
  display: grid;
  grid-auto-flow: column;
  justify-content: space-evenly;
  align-content: center;
`

type ChoiceProps = {
  active: boolean,
}

const IntervalChoice = styled.div<ChoiceProps>`
  font-weight: 500;
  font-size: 12px;
  line-height: 32px;
  color: ${(props) => props.active ? '#323232' : '#A3A3A3'};
  background-color: ${(props) => props.active ? '#F8F8F8' : 'transparent'};
  cursor: pointer;
  padding: 0 13.5px;
  border-radius: 4px;
  user-select: none;
`

const Container = styled.div`
  display: grid;
  grid-template-rows: 200px 64px;
  font-family: ${SANS};
`

type Interval = '24hours' | '1month' | '3months' | 'all'

type ContextProps = {
  interval: Interval | undefined,
  setInterval: (interval: Interval | undefined) => void,
}

const GraphContext = React.createContext<ContextProps | undefined>(undefined)

type Props = {
  children: React.ReactNode,
  defaultInterval?: Interval,
}

const Graphs = ({ children, defaultInterval }: Props) => {
  const [interval, setInterval] = useState<Interval | undefined>(defaultInterval)

  const value = useMemo(() => {
    return {
      interval,
      setInterval,
    }
  }, [
    interval,
    setInterval,
  ])

  return (
    <GraphContext.Provider value={value}>
      <Container>
        {children || null}
      </Container>
    </GraphContext.Provider>
  )
}

type IntervalsProps = {
  options: Array<Interval>,
}

export const useGraphContext = () => {
  const context = useContext(GraphContext)

  if (!context) {
    throw new Error('GraphContext must be inside a Provider with a value')
  }

  return context
}

const labels = {
  '24hours': '24 Hours',
  '1month': '1 Month',
  '3months': '3 Months',
  'all': 'All data',
}

const Intervals = ({ options }: IntervalsProps) => {
  const { interval, setInterval } = useGraphContext()

  return (
    <IntervalContainer>
      {(options || []).map((option) => (
        <IntervalChoice
          key={option}
          // typescript wtf :o
          // eslint-disable-next-line @typescript-eslint/no-implied-eval
          onClick={() => setInterval(option)}
          active={interval === option}
        >
          {labels[option] || option}
        </IntervalChoice>
      ))}
    </IntervalContainer>
  )
}

Graphs.Intervals = Intervals
Graphs.TimeSeries = TimeSeries

export default Graphs
