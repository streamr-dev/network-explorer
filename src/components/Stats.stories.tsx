import { Meta } from '@storybook/react'
import React, { useCallback, useState } from 'react'
import { Stats, Stat } from './Stats'

export default {
  title: 'Stats',
  component: Stats,
} as Meta

export const Selectable = () => {
  const [selected, setSelected] = useState<string>()

  const onClick = useCallback((name: string) => {
    setSelected((prev) => (prev !== name ? name : undefined))
  }, [])

  return (
    <Stats active={selected}>
      <Stat id="1" label="Key 1" value={100} onClick={() => onClick('1')} />
      <Stat id="2" label="Key 2" value={200} onClick={() => onClick('2')} />
      <Stat id="3" label="Key 3" value={300} onClick={() => onClick('3')} />
    </Stats>
  )
}

export const PartlySelectable = () => {
  const [selected, setSelected] = useState<string>()

  const onClick = useCallback((name: string) => {
    setSelected((prev) => (prev !== name ? name : undefined))
  }, [])

  return (
    <Stats active={selected}>
      <Stat id="1" label="Key 1" value={100} onClick={() => onClick('1')} />
      <Stat id="2" label="Key 2" value={200} disabled />
      <Stat id="3" label="Key 3" value={300} />
    </Stats>
  )
}
