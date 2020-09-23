import React, { useState } from 'react'
import styled from 'styled-components/macro'

import { SANS } from '../utils/styled'

const Container = styled.div`
  display: grid;
  grid-template-rows: 200px 64px;
  font-family: ${SANS};
`

const GraphContainer = styled.div`
  align-self: center;
  justify-self: center;
`

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

export type Props = {
  name: string | null,
}

enum Interval {
  Day = 24,
  Month = 30 * 24,
  ThreeMonths = 3 * 30 * 24,
  All = 0,
}

const Graphs = ({ name }: Props) => {
  const [selectedInterval, setSelectedInterval] = useState<Interval>(Interval.Day)

  return (
    <Container>
      <GraphContainer>
        TODO: Graph for {name} {selectedInterval}
      </GraphContainer>
      <IntervalContainer>
        {Object.keys(Interval).filter((k) => isNaN(Number(k))).map((k) => {
          const value = Interval[k as keyof typeof Interval]

          return (
            <IntervalChoice
              key={k}
              onClick={() => setSelectedInterval(value)}
              active={selectedInterval === value}
            >
              {k}
            </IntervalChoice>
          )
        })}
      </IntervalContainer>
    </Container>
  )
}

export default Graphs
