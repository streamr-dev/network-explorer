import React, { useCallback, useState, useReducer } from 'react'
import { useSubscription } from 'streamr-client-react'

import useIsMounted from '../hooks/useIsMounted'

import Stats from './Stats'
import MetricGraph, { MetricType } from './MetricGraph'

type StatsState = {
  messagesPerSecond?: number | undefined
  numberOfNodes?: number | undefined
  latency?: number | undefined
}

const NetworkStats = () => {
  const isMounted = useIsMounted()
  const [{ messagesPerSecond, numberOfNodes, latency }, updateStats] = useReducer(
    (prevState: StatsState, nextState: StatsState) => ({
      ...(prevState || {}),
      ...nextState,
    }),
    {
      messagesPerSecond: undefined,
      numberOfNodes: undefined,
      latency: undefined,
    },
  )
  const [selectedStat, setSelectedStat] = useState<MetricType | undefined>(undefined)

  const toggleStat = useCallback((name) => {
    setSelectedStat((prev) => (prev !== name ? name : undefined))
  }, [])

  const onMessage = useCallback(
    ({ broker, network, trackers }) => {
      if (isMounted()) {
        updateStats({
          messagesPerSecond: broker && Math.round(broker.messagesToNetworkPerSec),
          numberOfNodes: trackers && trackers.totalNumberOfNodes,
          latency: network && Math.round(network.avgLatencyMs),
        })
      }
    },
    [isMounted],
  )

  useSubscription(
    {
      stream: 'streamr.eth/metrics/network/sec',
      resend: {
        last: 1,
      },
    },
  }, {
    onMessage,
  })

  return (
    <>
      <Stats active={selectedStat}>
        <Stats.Stat
          id="messagesPerSecond"
          label="Msgs / sec"
          value={messagesPerSecond}
          onClick={() => toggleStat('messagesPerSecond')}
        />
        <Stats.Stat
          id="numberOfNodes"
          label="Nodes"
          value={numberOfNodes}
          onClick={() => toggleStat('numberOfNodes')}
        />
        <Stats.Stat
          id="latency"
          label="Latency ms"
          value={latency}
          onClick={() => toggleStat('latency')}
        />
      </Stats>
      {!!selectedStat && <MetricGraph type="network" metric={selectedStat} />}
    </>
  )
}

export default NetworkStats
