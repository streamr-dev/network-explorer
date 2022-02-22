import React, {
  useCallback,
  useState,
  useReducer,
  useMemo,
  useEffect,
} from 'react'
import { useSubscription, useClient } from 'streamr-client-react'
import { keyToArrayIndex } from 'streamr-client-protocol'

import useIsMounted from '../hooks/useIsMounted'

import Stats from './Stats'
import MetricGraph, { MetricType } from './MetricGraph'

const FIREHOSE_STREAM = 'streamr.eth/metrics/nodes/firehose/sec'

type Props = {
  id: string
}

type StatsState = {
  messagesPerSecond?: number | undefined
  bytesPerSecond?: number | undefined
  latency?: number | undefined
}

const NodeStats = ({ id }: Props) => {
  const client = useClient()
  const nodeId = useMemo(() => (id || '').toLowerCase(), [id])
  const [partition, setPartition] = useState(0)
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

  useEffect(() => {
    const load = async () => {
      const stream = await client.getStream(FIREHOSE_STREAM)
      setPartition(keyToArrayIndex(stream.partitions, nodeId))
    }
    load()
  }, [client, nodeId])

  const toggleStat = useCallback((name) => {
    setSelectedStat((prev) => (prev !== name ? name : undefined))
  }, [])

  const isMounted = useIsMounted()

  const onMessage = useCallback((msg) => {
    const { broker, network } = msg

    if (isMounted()) {
      updateStats({
        messagesPerSecond: Math.round(broker.messagesToNetworkPerSec),
        bytesPerSecond: Math.round(broker.bytesToNetworkPerSec),
        latency: Math.round(network.avgLatencyMs),
      })
    }
  }, [isMounted])

  useSubscription(
    {
      stream: FIREHOSE_STREAM,
      partition,
      resend: {
        last: 1,
        publishedId: nodeId,
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
      {!!selectedStat && <MetricGraph type="node" id={nodeId} metric={selectedStat} />}
    </>
  )
}

export default NodeStats
