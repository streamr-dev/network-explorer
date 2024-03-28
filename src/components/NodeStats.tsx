import React from 'react'
import Stats from './Stats'

export function NodeStats() {
  return (
    <Stats>
      <Stats.Stat id="messagesPerSecond" label="Msg / sec" value="N/A" />
      <Stats.Stat id="upBytes" label="Up" value="N/A" />
      <Stats.Stat id="downBytes" label="Down" value="N/A" />
    </Stats>
  )
}
