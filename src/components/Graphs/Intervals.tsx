import React, { useCallback } from 'react'
import styled, { css } from 'styled-components'
import { Interval, useGraphContext } from './Graphs'

const IntervalChoice = styled.div`
  font-weight: 500;
  font-size: 12px;
  line-height: 32px;
  color: ${({ theme }) => (theme.active ? '#323232' : '#A3A3A3')};
  background-color: ${({ theme }) => (theme.active ? '#F8F8F8' : 'transparent')};
  padding: 0;
  border-radius: 4px;
  user-select: none;
  cursor: ${({ theme }) => (!theme.disabled ? 'pointer' : 'not-allowed')};
  opacity: ${({ theme }) => (!theme.disabled ? '1' : '0.5')};
  white-space: nowrap;
  min-width: 56px;
  box-sizing: border-box;
  text-align: center;

  ${({ theme }) =>
    !!theme.letterSpacing &&
    css`
      letter-spacing: 0.04rem;
    `}
`

type IntervalsProps = {
  options: Array<Interval>
  disabled?: boolean
  onChange?: (interval: Interval) => void
}

const labels = {
  realtime: 'LIVE',
  '24hours': '24H',
  '1month': '1M',
  '3months': '3M',
  all: 'ALL',
}

const UnstyledIntervals = ({
  options,
  disabled,
  onChange: onChangeProp,
  ...props
}: IntervalsProps) => {
  const { interval, setInterval } = useGraphContext()

  const onClick = useCallback(
    (nextInterval: Interval) => {
      // typescript wtf :o
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      setInterval(nextInterval)

      if (typeof onChangeProp === 'function') {
        onChangeProp(nextInterval)
      }
    },
    [setInterval, onChangeProp],
  )

  return (
    <div {...props}>
      {(options || []).map((option) => (
        <IntervalChoice
          key={option}
          onClick={() => !disabled && onClick(option)}
          theme={{
            active: interval === option,
            disabled: !!disabled,
            letterSpacing: ['realtime', 'all'].includes(option),
          }}
        >
          {labels[option] || option}
        </IntervalChoice>
      ))}
    </div>
  )
}

export const Intervals = styled(UnstyledIntervals)`
  border-top: 1px solid #efefef;
  display: grid;
  grid-auto-flow: column;
  justify-content: space-between;
  align-content: center;
  padding: 0 1rem;
  min-width: 0;
  overflow: hidden;
`
