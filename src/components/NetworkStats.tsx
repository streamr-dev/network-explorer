import React from 'react'
import Stats, { Stat } from './Stats'

export function NetworkStats() {
  /**
   * @todo
   */
  const nodeCount = 0

  /**
   * @todo
   */
  const apy = 0

  /**
   * @todo
   */
  const tvl = 0

  return (
    <Stats>
      <Stat id="nodeCount" label="Nodes" value={nodeCount} />
      <Stat id="apy" label="APY" value={apy} unit="%" />
      <Stat id="tvl" label="TVL" value={tvl} unit="M DATA" />
    </Stats>
  )
}
