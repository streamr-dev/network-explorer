import React, { useCallback, useState, useEffect } from 'react'
import { useSubscription } from 'streamr-client-react'
import { calculateShortestPaths, QuickDijkstraResult } from '@streamr/quick-dijkstra-wasm'

import useIsMounted from '../hooks/useIsMounted'
import { useStore } from '../contexts/Store'
import { getIndexedNodes } from '../utils/api/tracker'

import Stats from './Stats'
import MetricGraph, { MetricType } from './MetricGraph'

type StatsState = {
  messagesPerSecond?: number | undefined
  numberOfNodes?: number | undefined
  latency?: number | undefined
}

const StreamStats = () => {
  const isMounted = useIsMounted()
  const [messagesPerSecond, setMessagesPerSecond] = useState<number | undefined>()
  const [selectedStat, setSelectedStat] = useState<MetricType | undefined>(undefined)
  const { visibleNodes, latencies } = useStore()
  const [latency, setLatency] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (!latencies || Object.keys(latencies).length <= 0) {
      return
    }

    try {
      const indexedNodes = getIndexedNodes(latencies)

      calculateShortestPaths(indexedNodes, ({ averageDistance }: QuickDijkstraResult) => {
        if (isMounted()) {
          setLatency(averageDistance)
        }
      })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e)
    }
  }, [latencies, isMounted])

  const toggleStat = useCallback((name) => {
    setSelectedStat((prev) => (prev !== name ? name : undefined))
  }, [])

  const onMessage = useCallback(
    ({ broker }) => {
      if (isMounted() && broker) {
        setMessagesPerSecond(Math.round(broker.messagesToNetworkPerSec))
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
        <Stats.Stat id="numberOfNodes" label="Nodes" value={visibleNodes.length} />
        <Stats.Stat id="latency" label="Latency ms" value={latency && latency.toFixed(1)} />
      </Stats>
      {!!selectedStat && <MetricGraph type="network" metric={selectedStat} />}
    </>
  )
}

export default StreamStats
