import React, { useCallback, useState, useReducer } from 'react'
import { useSubscription } from 'streamr-client-react'

import useIsMounted from '../hooks/useIsMounted'

import Stats from './Stats'
import MetricGraph, { MetricType } from './MetricGraph'

type StatsState = {
  numberOfNodes?: number | undefined
  apr?: number | undefined
  apy?: number | undefined
}

const NetworkStats = () => {
  const isMounted = useIsMounted()
  const [{ numberOfNodes, apr, apy }, updateStats] = useReducer(
    (prevState: StatsState, nextState: StatsState) => ({
      ...(prevState || {}),
      ...nextState,
    }),
    {
      numberOfNodes: undefined,
      apr: undefined,
      apy: undefined,
    },
  )
  const [selectedStat, setSelectedStat] = useState<MetricType | undefined>(undefined)

  const toggleStat = useCallback((name) => {
    setSelectedStat((prev) => (prev !== name ? name : undefined))
  }, [])

  const onMessage = useCallback((msg) => {
    const { trackers, staking } = msg

    if (isMounted()) {
      updateStats({
        numberOfNodes: trackers && trackers.totalNumberOfNodes,
        apr: staking && staking['24h-APR'],
        apy: staking && staking['24h-APY'],
      })
    }
  },
  [isMounted])

  useSubscription(
    {
      stream: 'streamr.eth/metrics/network/sec',
      resend: {
        last: 1,
      },
    }, {
      onMessage,
    })

  return (
    <>
      <Stats active={selectedStat}>
        <Stats.Stat
          id="numberOfNodes"
          label="Nodes"
          value={numberOfNodes}
          onClick={() => toggleStat('numberOfNodes')}
        />
        <Stats.Stat
          id="apr"
          label="APR"
          value={apr}
          unit='%'
          onClick={() => toggleStat('apr')}
        />
        <Stats.Stat
          id="apy"
          label="APY"
          value={apy}
          unit='%'
          onClick={() => toggleStat('apy')}
        />
      </Stats>
      {!!selectedStat && <MetricGraph type="network" metric={selectedStat} />}
    </>
  )
}

export default NetworkStats
