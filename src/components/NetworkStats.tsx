import React, { useCallback, useState, useReducer } from 'react'
import { useSubscription } from 'streamr-client-react'

import useIsMounted from '../hooks/useIsMounted'

import Stats from './Stats'
import MetricGraph, { MetricType } from './MetricGraph'

type StatsState = {
  numberOfNodes?: number | undefined
  apy?: number | undefined
  tvl?: number | undefined
}

const NetworkStats = () => {
  const isMounted = useIsMounted()
  const [{ numberOfNodes, apy, tvl }, updateStats] = useReducer(
    (prevState: StatsState, nextState: StatsState) => ({
      ...(prevState || {}),
      ...nextState,
    }),
    {
      numberOfNodes: undefined,
      apy: undefined,
      tvl: undefined,
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
        apy: staking && staking['24h-APY'],
        tvl: staking && staking['24h-data-staked'] * 10 ** -6,
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
          id="apy"
          label="APY"
          value={apy && Math.floor(apy)}
          unit='%'
          onClick={() => toggleStat('apy')}
        />
        <Stats.Stat
          id="tvl"
          label="TVL"
          value={tvl?.toFixed(1)}
          unit='M DATA'
          onClick={() => toggleStat('tvl')}
        />
      </Stats>
      {!!selectedStat && <MetricGraph type="network" metric={selectedStat} />}
    </>
  )
}

export default NetworkStats
