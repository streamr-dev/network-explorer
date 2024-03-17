import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react'
import { useClient } from 'streamr-client-react'
import useIsMounted from '../hooks/useIsMounted'
import Graphs from './Graphs'
import { Interval } from './Graphs/Graphs'
import Error from './Error'

export type MetricType =
  | 'messagesPerSecond'
  | 'numberOfNodes'
  | 'latency'
  | 'bytesPerSecond'
  | 'apr'
  | 'apy'
  | 'tvl'
  | 'upBytes'
  | 'downBytes'

function useSubscription(..._: any[]) {}

function getAddressFromNodeId(..._: any[]) {
  return ''
}

function keyToArrayIndex(..._: any[]) {
  return 0
}

type MetricGraphProps = {
  streamId: string
  interval: Interval
  metric: MetricType
  id: string | undefined
  partition: Number
}

const HOUR = 60 * 60 * 1000
const REALTIME_WINDOW = HOUR / 6

const getTimestampForInterval = (interval: Interval) => {
  switch (interval) {
    case 'realtime':
      return Date.now() - REALTIME_WINDOW

    case '24hours':
      return Date.now() - 24 * HOUR

    case '1month':
      return Date.now() - 30 * 24 * HOUR

    case '3months':
      return Date.now() - 3 * 30 * 24 * HOUR

    case 'all':
      return new Date(2021, 1, 1).getTime()

    default:
      break
  }

  return undefined
}

const formatMetricValue = (value: number, metric: MetricType): string => {
  switch (metric) {
    case 'bytesPerSecond':
      return (value / 1024 / 1024).toPrecision(4)
  }

  return `${+Number(value).toPrecision(4)}`
}

type RawValue = {
  timestamp: number
  messagesPerSecond: number
  numberOfNodes: number
  bytesPerSecond: number
  latency: number
  apy: number
  apr: number
  tvl: number
  upBytes: number
  downBytes: number
}

type DataPoint = {
  x: number
  y: number
}

const MetricGraph = ({ streamId, interval, metric, id, partition }: MetricGraphProps) => {
  const isMounted = useIsMounted()
  const dataRef = useRef<RawValue[]>([])
  const [values, setValues] = useState<DataPoint[]>([])
  const nodeAddress = useMemo(() => (id ? getAddressFromNodeId(id) : null), [id])

  const onMessage = useCallback(
    (msg: any, metadata: any) => {
      const { broker, trackers, network, staking, node } = msg
      const { messageId } = metadata

      // Filter out messages that were not sent by currently selected node
      if (nodeAddress !== null && messageId.publisherId !== nodeAddress) {
        return
      }

      if (isMounted()) {
        dataRef.current = [
          ...dataRef.current,
          {
            timestamp: messageId.timestamp,
            messagesPerSecond:
              (node && node.publishMessagesPerSecond) ||
              (network && network.publishMessagesPerSecond) ||
              (broker && broker.messagesToNetworkPerSec) ||
              0,
            numberOfNodes:
              (network && network.totalNumberOfNodes) ||
              (trackers && trackers.totalNumberOfNodes) ||
              0,
            bytesPerSecond:
              (network &&
                network.publishBytesPerSecond &&
                Math.round(network.publishBytesPerSecond)) ||
              (broker && broker.bytesToNetworkPerSec && Math.round(broker.bytesToNetworkPerSec)) ||
              0,
            latency: Math.round(network.avgLatencyMs),
            apr: (staking && staking['24h-APR']) || 0,
            apy: (staking && staking['24h-APY']) || 0,
            tvl: (staking && staking['24h-data-staked']) || 0,
            upBytes:
              (node && node.sendBytesPerSecond) || (network && network.bytesToPeersPerSec) || 0,
            downBytes:
              (node && node.receiveBytesPerSecond) ||
              (network && network.bytesFromPeersPerSec) ||
              0,
          },
        ]
      }
    },
    [isMounted, nodeAddress],
  )

  // Poll graph data
  const graphPollTimeout = useRef<number | undefined>()
  const graphPoll = useCallback((nextMetric: MetricType, nextInterval: Interval) => {
    clearTimeout(graphPollTimeout.current)

    const now = Date.now()

    const nextValues = (dataRef.current || [])
      .filter(({ timestamp }) => {
        switch (nextInterval) {
          case 'realtime':
            return now - timestamp <= REALTIME_WINDOW

          default:
            break
        }

        return true
      })
      .map(({ timestamp, ...rawValue }) => ({
        x: timestamp,
        y: rawValue[nextMetric],
      }))
      .sort(({ x: prev }, { x: current }) => prev - current)

    setValues(nextValues)

    graphPollTimeout.current = window.setTimeout(() => {
      graphPoll(nextMetric, nextInterval)
    }, 500)
  }, [])

  useEffect(() => {
    graphPoll(metric, interval)

    return () => {
      clearTimeout(graphPollTimeout.current)
      setValues([])
    }
  }, [graphPoll, interval, metric])

  const resend = useMemo(() => {
    if (nodeAddress && nodeAddress.length > 0) {
      return {
        from: {
          timestamp: getTimestampForInterval(interval),
          publisherId: nodeAddress,
        },
      }
    }

    return {
      from: {
        timestamp: getTimestampForInterval(interval),
      },
    }
  }, [interval, nodeAddress])

  const labelFormat = useCallback(
    (value: number): string => {
      return formatMetricValue(value, metric)
    },
    [metric],
  )

  useSubscription(
    {
      stream: streamId,
      partition,
      resend,
    },
    {
      onMessage,
    },
  )

  return (
    <Graphs.TimeSeries
      graphData={{ data: values }}
      height="200px"
      ratio="1:2"
      showCrosshair
      dateDisplay={['realtime', '24hours'].includes(interval) ? 'hour' : 'day'}
      labelFormat={labelFormat}
    />
  )
}

type Props = {
  type: 'network' | 'node'
  metric: MetricType
  id?: string
}

const getStreamFragmentForInterval = (interval: Interval) => {
  switch (interval) {
    case 'realtime':
      return 'sec'

    case '24hours':
      return 'min'

    case '1month':
      return 'hour'

    case '3months':
      return 'day'

    default:
      return 'day'
  }
}

const MetricGraphLoader = ({ type, metric, id }: Props) => {
  const client = useClient()
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const [interval, setInterval] = useState<Interval>('realtime')
  const [partition, setPartition] = useState(0)
  const isMounted = useIsMounted()

  const metricStreamId = useMemo(() => {
    if (type === 'network') {
      return `streamr.eth/metrics/network/${getStreamFragmentForInterval(interval)}`
    }

    if (!id) {
      // no idea what typescript wants here
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      throw new (Error as any)('No node selected!')
    }

    return `streamr.eth/metrics/nodes/firehose/${getStreamFragmentForInterval(interval)}`
  }, [type, id, interval])

  const loadStream = useCallback(
    async (streamId: string) => {
      setHasLoaded(false)
      setError(undefined)

      if (!client) {
        return
      }

      try {
        const stream = await client.getStream(streamId)
        if (id && id.length > 0) {
          setPartition(keyToArrayIndex(stream.getMetadata().partitions, id.toLowerCase()))
        }
      } catch (e) {
        setError('Metric data not available')
      } finally {
        if (isMounted()) {
          setHasLoaded(true)
        }
      }
    },
    [isMounted, client, id],
  )

  useEffect(() => {
    try {
      loadStream(metricStreamId)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e)
    }
  }, [loadStream, metricStreamId])

  return (
    <>
      <Graphs defaultInterval="realtime">
        {(!hasLoaded || !!error) && (
          <>
            <Graphs.Placeholder showImage={!!error} />
            <Graphs.Loading loading={!error} row={2} />
          </>
        )}
        {!!hasLoaded && !error && (
          <MetricGraph
            streamId={metricStreamId}
            interval={interval}
            metric={metric}
            id={id}
            partition={partition}
          />
        )}
        <Graphs.Intervals
          options={['realtime', '24hours', '1month', '3months', 'all']}
          onChange={setInterval}
        />
      </Graphs>
      {!!error && <Error>{error}</Error>}
    </>
  )
}

export default MetricGraphLoader
