import React, { useCallback, useState, useReducer } from 'react'
import { useSubscription } from 'streamr-client-react'

import useIsMounted from '../hooks/useIsMounted'

import Stats from './Stats'
import MetricGraph, { MetricType } from './MetricGraph'

type Props = {
  id: string
}

type StatsState = {
  messagesPerSecond?: number | undefined
  bytesPerSecond?: number | undefined
  latency?: number | undefined
}

const NodeStats = ({ id }: Props) => {
  const [selectedStat, setSelectedStat] = useState<MetricType | undefined>('messagesPerSecond')
  const [{ messagesPerSecond, bytesPerSecond, latency }, updateStats] = useReducer(
    (prevState: StatsState, nextState: StatsState) => ({
      ...(prevState || {}),
      ...nextState,
    }),
    {
      messagesPerSecond: undefined,
      bytesPerSecond: undefined,
      latency: undefined,
    },
  )

  const toggleStat = useCallback((name) => {
    setSelectedStat((prev) => (prev !== name ? name : undefined))
  }, [])

  const isMounted = useIsMounted()

  const onMessage = useCallback(
    ({ broker, network, trackers }) => {
      if (isMounted()) {
        updateStats({
          messagesPerSecond: Math.round(broker.messagesToNetworkPerSec),
          bytesPerSecond: Math.round(broker.bytesToNetworkPerSec),
          latency: Math.round(network.avgLatencyMs),
        })
      }
    },
    [isMounted],
  )

  useSubscription(
    {
      stream: `${id}/streamr/node/metrics/sec`,
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
          id="messagesPerSecond"
          label="Msgs / sec"
          value={messagesPerSecond}
          onClick={() => toggleStat('messagesPerSecond')}
        />
        <Stats.Stat
          id="bytesPerSecond"
          label="Mb / s"
          value={bytesPerSecond && (bytesPerSecond / 1024 / 1024).toPrecision(2)}
          onClick={() => toggleStat('bytesPerSecond')}
        />
        <Stats.Stat
          id="latency"
          label="Latency ms"
          value={latency}
          onClick={() => toggleStat('latency')}
        />
      </Stats>
      {!!selectedStat && <MetricGraph type="node" id={id} metric={selectedStat} />}
    </>
  )
}

export default NodeStats
