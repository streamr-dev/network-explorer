import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
} from 'react'
import styled from 'styled-components'
import { useSubscription } from 'streamr-client-react'

import { getStream } from '../utils/api/streamr'
import useIsMounted from '../hooks/useIsMounted'
import {
  SANS,
  MEDIUM,
} from '../utils/styled'

import Stats from './Stats'
import Graphs from './Graphs'
import Error from './Error'

const GraphPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #A3A3A3;
  font-family: ${SANS};
  font-weight: ${MEDIUM};
  text-transform: uppercase;
`

const ONE_DAY = 24 * 60 * 60 * 1000
const startDate = new Date(2020, 1, 1, 10).getTime()

const data = [
  {
    x: startDate,
    y: 1,
  },
  {
    x: startDate + 1 * ONE_DAY,
    y: 5,
  },
  {
    x: startDate + 2 * ONE_DAY,
    y: 4,
  },
  {
    x: startDate + 3 * ONE_DAY,
    y: 12,
  },
]

type NodeGraphProps = {
  streamId?: string,
}

const NodeGraph = ({ streamId }: NodeGraphProps) => {
  // TODO: subscribe to stream, display data

  /*
  useSubscription({
    stream: streamId,
    resend: {
      last: 1,
    },
  }, onMessage)
  */

  return (
    <Graphs.TimeSeries
      graphData={{ data }}
      height="200px"
      ratio="1:2"
      showCrosshair
    />
  )
}

type Props = {
  id?: string,
}

const NodeGraphLoader = ({ id }: Props) => {
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const [interval, setInterval] = useState<string>('24hours')
  const isMounted = useIsMounted()

  const metricStreamId = useMemo(() => `${id}/streamr/node/metrics/${interval}`, [id, interval])
  // const metricStreamId = 'Y1gWr4X9S8mQdg5mzBq1dA'

  const loadStream = useCallback(async (nodeId) => {
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
  }, [isMounted])

  useEffect(() => {
    loadStream(metricStreamId)
  }, [loadStream, metricStreamId])

  return (
    <>
      <Graphs defaultInterval="24hours">
        {(!hasLoaded || !!error) && (
          <>
            <GraphPlaceholder>
              {!!error && (
                <span>{error}</span>
              )}
            </GraphPlaceholder>
            <Graphs.Loading loading={!error} row={2} />
          </>
        )}
        {!!hasLoaded && !error && (
          <NodeGraph streamId={metricStreamId} />
        )}
        <Graphs.Intervals
          options={['24hours', '1month', '3months', 'all']}
          onChange={setInterval}
        />
      </Graphs>
      {!!error && (
        <Error>
          {error}
        </Error>
      )}
    </>
  )
}

const NodeStats = ({ id }: Props) => {
  const [selectedStat, setSelectedStat] = useState<string | undefined>(undefined)

  const toggleStat = useCallback((name) => {
    setSelectedStat((prev) => prev !== name ? name : undefined)
  }, [])

  const [messagesPerSecond, setMessagesPersecond] = useState<number | undefined>(undefined)
  const isMounted = useIsMounted()

  const onMessagesPerSecond = useCallback(({
    eventsPerSecond,
  }) => {
    if (isMounted()) {
      setMessagesPersecond(eventsPerSecond)
    }
  }, [isMounted])

  // TODO: use network metric for now, replace with real value
  // const metricStreamId = useMemo(() => `${id}/streamr/node/metrics/sec`, [id])
  const metricStreamId = 'Y1gWr4X9S8mQdg5mzBq1dA'

  useSubscription({
    stream: metricStreamId,
    resend: {
      last: 1,
    },
  }, onMessagesPerSecond)

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
          id="mbPerSecond"
          label="Mb / s"
          value={undefined}
          onClick={() => toggleStat('mbPerSecond')}
        />
        <Stats.Stat
          id="latency"
          label="Latency ms"
          value={undefined}
          onClick={() => toggleStat('latency')}
        />
      </Stats>
      {!!selectedStat && (
        <NodeGraphLoader id={id} />
      )}
    </>
  )
}

export default NodeStats
