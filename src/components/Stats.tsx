import React, { useState, useEffect } from 'react'
import styled from 'styled-components/macro'

import { SANS } from '../utils/styled'

const Container = styled.div`
  display: grid;
  grid-auto-flow: column;
  padding-top: 12px;
  font-family: ${SANS};
`

const Stat = styled.div`
  text-align: center;
  cursor: pointer;
  user-select: none;
`

const StatName = styled.div`
  font-size: 10px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.05em;
  color: #ADADAD;
  text-transform: uppercase;
`

const StatValue = styled.div`
  font-size: 16px;
  line-height: 32px;
  padding-bottom: 4px;
`

const UnderlineContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;
  top: 1px;
`

const Underline = styled.div`
  border-bottom: 1.5px solid #0324FF;
  width: 32px;
`

export type Props = {
  values: { [key: string]: number },
  onSelectedStatChanged: (name: string | null) => void,
  // eslint-disable-next-line react/require-default-props
  disabled?: boolean,
}

const Stats = ({
  values,
  onSelectedStatChanged,
  disabled,
  ...rest
}: Props) => {
  const [selectedStat, setSelectedStat] = useState<string | null>(null)

  useEffect(() => {
    onSelectedStatChanged(selectedStat)
  }, [selectedStat, onSelectedStatChanged])

  return (
    <Container {...rest}>
      {Object.keys(values).map((name) => (
        <Stat
          key={name}
          onClick={() => {
            if (disabled) {
              return
            }

            if (selectedStat === name) {
              setSelectedStat(null)
            } else {
              setSelectedStat(name)
            }
          }}
        >
          <StatName>{name}</StatName>
          <StatValue>{values[name]}</StatValue>
          {selectedStat === name && !disabled && (
            <UnderlineContainer>
              <Underline />
            </UnderlineContainer>
          )}
        </Stat>
      ))}
    </Container>
  )
}

export default Stats
