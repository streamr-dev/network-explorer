import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react'
import { useSubscription } from 'streamr-client-react'

import Graphs, { useGraphContext } from '.'
import useIsMounted from '../../hooks/useIsMounted'

type Values = {
  min: number,
  max: number,
}

const EventsPerSecond = () => {
  const isMounted = useIsMounted()
  const [values, setValues] = useState<Record<string, Values>>({})
  const { interval } = useGraphContext()

  const onMessagesPerSecond = useCallback(({ eventsPerSecond }, { messageId }) => {
    if (isMounted()) {
      const date = new Date(messageId.timestamp).toISOString().slice(0, 16)

      setValues((data) => {
        if (!data[date]) {
          return {
            ...data,
            [date]: {
              min: eventsPerSecond,
              max: eventsPerSecond,
            },
          }
        }
        const { min, max } = data[date] || {}

        return {
          ...data,
          [date]: {
            min: !min ? eventsPerSecond : Math.min(min, eventsPerSecond),
            max: !max ? eventsPerSecond : Math.max(max, eventsPerSecond),
          },
        }
      })
    }
  }, [isMounted])

  const resend = useMemo(() => {
    switch (interval) {
      case '24hours':
        return {
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

  useEffect(() => {
    setValues({})
  }, [interval])

  useSubscription({
    stream: 'Y1gWr4X9S8mQdg5mzBq1dA',
    resend,
  }, onMessagesPerSecond)

  const minData = useMemo(() => Object.keys(values).map((date) => {
    const { min } = values[date]

    return {
      x: Date.parse(date),
      y: min,
    }
  }), [values])

  const maxData = useMemo(() => Object.keys(values).map((date) => {
    const { max } = values[date]

    return {
      x: Date.parse(date),
      y: max,
    }
  }), [values])

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
      />
      <Graphs.Intervals options={['24hours', '1month', '3months', 'all']} />
    </>
  )
}

export default () => (
  <Graphs defaultInterval="24hours">
    <EventsPerSecond />
  </Graphs>
)
