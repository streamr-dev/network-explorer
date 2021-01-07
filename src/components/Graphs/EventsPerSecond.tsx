import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react'
import { useSubscription } from 'streamr-client-react'

import Graphs, { useGraphContext } from '.'
import useIsMounted from '../../hooks/useIsMounted'

type RawValue = {
  timestamp: number,
  eventsPerSecond: number,
}

type Values = {
  min: number,
  max: number,
}

const EventsPerSecond = () => {
  const isMounted = useIsMounted()
  const dataRef = useRef<RawValue[]>([])
  const [values, setValues] = useState<Record<string, Values>>({})
  const { interval } = useGraphContext()

  const onMessagesPerSecond = useCallback(({ eventsPerSecond }, { messageId }) => {
    if (isMounted()) {
      dataRef.current = [
        ...dataRef.current,
        { timestamp: messageId.timestamp, eventsPerSecond },
      ]
    }
  }, [isMounted])

  const updateCharts = useCallback((nextInterval) => {
    const minMaxValues = (dataRef.current || []).reduce(
      (result: Record<string, Values>, { timestamp, eventsPerSecond }) => {
        // round timestamp to the minute (1 min = 60 * 1000 ms)
        // or 1h (60 * 60 * 1000 ms)
        const date = nextInterval === '24hours' ?
          `${Math.round(timestamp / 60000) * 60000}` :
          `${Math.round(timestamp / 3600000) * 3600000}`

        if (!result[date]) {
          return {
            ...result,
            [date]: {
              min: eventsPerSecond,
              max: eventsPerSecond,
            },
          }
        }
        const { min, max } = result[date] || {}

        return {
          ...result,
          [date]: {
            min: !min ? eventsPerSecond : Math.min(min, eventsPerSecond),
            max: !max ? eventsPerSecond : Math.max(max, eventsPerSecond),
          },
        }
      },
      {},
    )

    setValues(minMaxValues)
  }, [])

  // Poll usd rate from contract
  const graphPollTimeout = useRef<number | undefined>()
  const graphPoll = useCallback((nextInterval) => {
    clearTimeout(graphPollTimeout.current)
    updateCharts(nextInterval)

    graphPollTimeout.current = setTimeout(() => {
      graphPoll(nextInterval)
    }, 1000)
  }, [updateCharts])

  useEffect(() => {
    graphPoll(interval)

    return () => {
      clearTimeout(graphPollTimeout.current)
      dataRef.current = []
    }
  }, [graphPoll, interval])

  const resend = useMemo(() => {
    switch (interval) {
      case '24hours':
        return {
          // last: 100,
          from: {
            timestamp: Date.now() - 24 * 60 * 60 * 1000,
          },
        }

      case '1month':
        return {
          from: {
            timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000,
          },
        }

      case '3months':
        return {
          from: {
            timestamp: Date.now() - 3 * 30 * 24 * 60 * 60 * 1000,
          },
        }

      default:
        break
    }

    return undefined
  }, [interval])

  useSubscription({
    stream: 'Y1gWr4X9S8mQdg5mzBq1dA',
    resend,
  }, onMessagesPerSecond)

  const minData = useMemo(() => Object.keys(values).map((date) => {
    const { min } = values[date]

    return {
      x: parseInt(date, 10),
      y: min,
    }
  }), [values])

  const maxData = useMemo(() => Object.keys(values).map((date) => {
    const { max } = values[date]

    return {
      x: parseInt(date, 10),
      y: max,
    }
  }), [values])

  const hasData = (minData.length + maxData.length) > 0

  return (
    <>
      <Graphs.TimeSeries
        graphData={{
          min: minData,
          max: maxData,
        }}
        height="200px"
        ratio="1:2"
        showCrosshair
        dateDisplay={interval === '24hours' ? 'hour' : 'day'}
      />
      <Graphs.Loading loading={!hasData} row={2} />
      <Graphs.Intervals options={['24hours', '1month', '3months', 'all']} />
    </>
  )
}

export default () => (
  <Graphs defaultInterval="24hours">
    <EventsPerSecond />
  </Graphs>
)
