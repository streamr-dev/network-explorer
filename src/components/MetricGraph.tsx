import React, {
  useMemo, useCallback, useState, useEffect, useRef,
} from 'react'
import { useSubscription } from 'streamr-client-react'

import { getStream } from '../utils/api/streamr'
import useIsMounted from '../hooks/useIsMounted'

import Graphs from './Graphs'
import { Interval } from './Graphs/Graphs'
import Error from './Error'

export type MetricType = 'messagesPerSecond' | 'numberOfNodes' | 'latency' | 'bytesPerSecond'

type MetricGraphProps = {
  streamId: string
  interval: Interval
  metric: MetricType
}

const HOUR = 60 * 60 * 1000
const REALTIME_WINDOW = HOUR / 6

const getResendOptionsForInterval = (interval: Interval) => {
  switch (interval) {
    case 'realtime':
      return {
        from: {
          timestamp: Date.now() - REALTIME_WINDOW,
        },
      }

    case '24hours':
      return {
        // last: 100,
        from: {
          timestamp: Date.now() - 24 * HOUR,
        },
      }

    case '1month':
      return {
        from: {
          timestamp: Date.now() - 30 * 24 * HOUR,
        },
      }

    case '3months':
      return {
        from: {
          timestamp: Date.now() - 3 * 30 * 24 * HOUR,
        },
      }

    case 'all':
      return {
        from: {
          timestamp: new Date(2021, 1, 1).getTime(),
        },
      }

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
}

type DataPoint = {
  x: number
  y: number
}

const MetricGraph = ({ streamId, interval, metric }: MetricGraphProps) => {
  const isMounted = useIsMounted()
  const dataRef = useRef<RawValue[]>([])
  const [values, setValues] = useState<DataPoint[]>([])

  const onMessage = useCallback(
    ({ broker, trackers, network }, { messageId }) => {
      if (isMounted()) {
        dataRef.current = [
          ...dataRef.current,
          {
            timestamp: messageId.timestamp,
            messagesPerSecond: Math.round(broker.messagesToNetworkPerSec),
            numberOfNodes: (trackers && trackers.totalNumberOfNodes) || 0,
            bytesPerSecond: Math.round(broker.bytesToNetworkPerSec),
            latency: Math.round(network.avgLatencyMs),
          },
        ]
      }
    },
    [isMounted],
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
    setValues(nextValues)

    graphPollTimeout.current = setTimeout(() => {
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

  const resend = useMemo(() => getResendOptionsForInterval(interval), [interval])

  const labelFormat = useCallback(
    (value: number): string => {
      return formatMetricValue(value, metric)
    },
    [metric],
  )

  useSubscription(
    {
      stream: streamId,
      resend,
    },
    onMessage,
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

    default:
      return 'day'
  }
}

const MetricGraphLoader = ({ type, metric, id }: Props) => {
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const [interval, setInterval] = useState<Interval>('realtime')
  const isMounted = useIsMounted()

  const metricStreamId = useMemo(() => {
    if (type === 'network') {
      return `streamr.eth/metrics/network/${getStreamFragmentForInterval(interval)}`
    }

    return `${id}/streamr/node/metrics/${getStreamFragmentForInterval(interval)}`
  }, [type, id, interval])

  const loadStream = useCallback(
    async (nodeId) => {
      setHasLoaded(false)
      setError(undefined)

      try {
        await getStream({ id: nodeId })
      } catch (e) {
        setError('Metric data not available')
      } finally {
        if (isMounted()) {
          setHasLoaded(true)
        }
      }
    },
    [isMounted],
  )

  useEffect(() => {
    loadStream(metricStreamId)
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
          <MetricGraph streamId={metricStreamId} interval={interval} metric={metric} />
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
