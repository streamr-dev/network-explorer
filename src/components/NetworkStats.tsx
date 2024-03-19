import React from 'react'
import Stats, { Stat } from './Stats'
import { useSponsorshipSummaryQuery, useSummaryQuery } from '../utils'

export function NetworkStats() {
  const { data: summary } = useSummaryQuery()

  const { nodeCount = 0, messagesPerSecond = 0 } = summary || {}

  const { data: stakeSummary } = useSponsorshipSummaryQuery()

  const tvl = stakeSummary ? stakeSummary.tvl.dividedBy(10 ** 18).dividedBy(10 ** 6).toFixed(2) : '0'

  return (
    <Stats>
      <Stat id="nodeCount" label="Nodes" value={nodeCount} />
      <Stat id="apy" label="Msg / sec" value={messagesPerSecond} unit="" />
      <Stat id="tvl" label="TVL" value={tvl} unit="M DATA" />
    </Stats>
  )
}
