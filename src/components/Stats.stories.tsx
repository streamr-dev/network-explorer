import React, { useState, useCallback } from 'react'
import { Meta } from '@storybook/react/types-6-0'

import { Stats, Stat } from './Stats'

export default {
  title: 'Stats',
  component: Stats,
} as Meta

export const Selectable = () => {
  const [selected, setSelected] = useState(undefined)

  const onClick = useCallback((name) => {
    setSelected((prev) => prev !== name && name)
  }, [])

  return (
    <Stats>
      <Stat
        label="Key 1"
        value={100}
        onClick={() => onClick('1')}
        active={selected === '1'}
      />
      <Stat
        label="Key 2"
        value={200}
        onClick={() => onClick('2')}
        active={selected === '2'}
      />
      <Stat
        label="Key 3"
        value={300}
        onClick={() => onClick('3')}
        active={selected === '3'}
      />
    </Stats>
  )
}

export const PartlySelectable = () => {
  const [selected, setSelected] = useState(undefined)

  const onClick = useCallback((name) => {
    setSelected((prev) => prev !== name && name)
  }, [])

  return (
    <Stats>
      <Stat
        label="Key 1"
        value={100}
        onClick={() => onClick('1')}
        active={selected === '1'}
      />
      <Stat
        label="Key 2"
        value={200}
        disabled
      />
      <Stat
        label="Key 3"
        value={300}
      />
    </Stats>
  )
}
