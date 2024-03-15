import React from 'react'
import { Stats, Stat } from './Stats'

export function StreamStats() {
  /**
   * @todo
   */
  const messagesPerSecond = 0

  /**
   * @todo
   */
  const nodeCount = 0

  return (
    <Stats>
      <Stat id="messagesPerSecond" label="Msgs / sec" value={messagesPerSecond} />
      <Stat id="nodeCount" label="Nodes" value={nodeCount} />
      <Stat id="latency" label="Latency ms" value={undefined} />
    </Stats>
  )
}
