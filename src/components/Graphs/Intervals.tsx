import React from 'react'
import styled from 'styled-components/macro'

import { useGraphContext, Interval } from './Graphs'

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

type IntervalsProps = {
  options: Array<Interval>,
}

const labels = {
  '24hours': '24 Hours',
  '1month': '1 Month',
  '3months': '3 Months',
  'all': 'All data',
}

const UnstyledIntervals = ({ options, ...props }: IntervalsProps) => {
  const { interval, setInterval } = useGraphContext()

  return (
    <div {...props}>
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
    </div>
  )
}

const Intervals = styled(UnstyledIntervals)`
  border-top: 1px solid #EFEFEF;
  display: grid;
  grid-auto-flow: column;
  justify-content: space-evenly;
  align-content: center;
`

export default Intervals
