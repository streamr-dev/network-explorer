import React, {
  useCallback,
  useState,
  useMemo,
} from 'react'
import { useSubscription } from 'streamr-client-react'

import useIsMounted from '../hooks/useIsMounted'
import { useStore } from '../contexts/Store'

import Stats from './Stats'
import MetricGraph, { MetricType } from './MetricGraph'

type StatsState = {
  messagesPerSecond?: number | undefined,
  numberOfNodes?: number | undefined,
  latency?: number | undefined,
}

const NetworkStats = () => {
  const isMounted = useIsMounted()
  const [messagesPerSecond, setMessagesPerSecond] = useState<number | undefined>()
  const [selectedStat, setSelectedStat] = useState<MetricType | undefined>(undefined)
  const { visibleNodes, latencies } = useStore()

  /* const latency = useMemo(() => {
    if (latencies && latencies.length > 0) {
      debugger // eslint-disable-line
      const paths = Object.values(latencies || {})
      const result = QuickDijkstra.calculateShortestPaths([[2, 3, 1], [0, 2, 3], [2, 1, 4] ])
      return result
    }

    return undefined
  }, [latencies])
  */

  const toggleStat = useCallback((name) => {
    setSelectedStat((prev) => prev !== name ? name : undefined)
  }, [])

  const onMessage = useCallback(({ broker }) => {
    if (isMounted() && broker) {
      setMessagesPerSecond(Math.round(broker.messagesToNetworkPerSec))
    }
  }, [isMounted])

  useSubscription({
    stream: 'streamr.eth/metrics/network/sec',
    resend: {
      last: 1,
    },
  }, onMessage)

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
          value={visibleNodes.length}
        />
        <Stats.Stat
          id="latency"
          label="Latency ms"
          value={undefined}
        />
      </Stats>
      {!!selectedStat && (
        <MetricGraph
          type="network"
          metric={selectedStat}
        />
      )}
    </>
  )
}

export default NetworkStats
