import { useQuery } from '@tanstack/react-query'
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import styled, { css } from 'styled-components'
import {
  GetStreamsDocument,
  GetStreamsQuery,
  GetStreamsQueryVariables,
} from '../generated/gql/indexer'
import { getIndexerClient } from '../utils/queries'
import {
  NetworkMetricKey,
  NodeMetricKey,
  useNetworkMetricEntries,
  useRecentNetworkMetricEntry,
  useRecentOperatorNodeMetricEntry,
  useSortedOperatorNodeMetricEntries,
} from '../utils/streams'
import { SANS } from '../utils/styled'
import { Graphs } from './Graphs'
import { Interval } from './Graphs/Graphs'
import { Intervals } from './Graphs/Intervals'
import { TimeSeries } from './Graphs/TimeSeries'

type StatProps = {
  id: string
  label: ReactNode
  value?: ReactNode
  unit?: ReactNode
  onClick?: () => void
  disabled?: boolean
  theme?: Record<string, number | string | boolean>
}

const UnstyledStat = ({
  label,
  value,
  unit,
  onClick: onClickProp,
  disabled,
  theme,
  ...props
}: StatProps) => {
  const onClick = useCallback(() => {
    if (typeof onClickProp === 'function') {
      onClickProp()
    }
  }, [onClickProp])

  return (
    <button type="button" onClick={onClick} {...props}>
      <StatName>{label}</StatName>
      <StatValue>
        {value !== undefined && value}
        {value === undefined && <Dimm>&infin;</Dimm>}
        {value !== undefined && unit}
      </StatValue>
    </button>
  )
}

const StatName = styled.div`
  font-size: 10px;
  font-weight: 500;
  line-height: normal;
  letter-spacing: 0.05em;
  color: #adadad;
  text-transform: uppercase;
`

const StatValue = styled.div`
  font-size: 16px;
  line-height: normal;
  margin-top: 0.25em;
  color: #323232;

  svg {
    width: 13px;
    height: 13px;
    color: #adadad;
  }
`

const Dimm = styled.span`
  color: #adadad;
`

export const Stat = styled(UnstyledStat)`
  background: transparent;
  border: 0;
  appearance: none;
  text-align: center;
  user-select: none;
  position: relative;
  font-family: inherit;
  outline: none;

  &:focus {
    outline: none;
  }

  ${StatName} {
    transition: color 300ms ease-in-out;
  }

  ${({ theme }) =>
    !!theme.clickable &&
    !theme.disabled &&
    !theme.active &&
    css`
      &:hover {
        cursor: pointer;

        ${StatName} {
          color: #0324ff;
        }
      }
    `}

  ${({ theme }) =>
    !!theme.disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.5;
    `}
`

const ButtonGrid = styled.div`
  display: flex;
  flex-direction: row;
  padding: 12px 0;
  font-family: ${SANS};

  > ${Stat} {
    flex-grow: 1;
    flex-basis: 0;
  }
`

const Underline = styled.div`
  border-bottom: 1.5px solid #0324ff;
  width: 32px;
  z-index: 1;
`

const UnderlineContainer = styled.div`
  transition: all 300ms ease-in-out;
  display: flex;
  justify-content: center;
  position: absolute;
  bottom: -1px;
  opacity: 0;
  width: ${({ theme }) => 100 / Math.max(1, theme.childCount)}%;

  ${({ theme }) =>
    theme.active !== undefined &&
    css`
      left: ${theme.active * (100 / Math.max(1, theme.childCount))}%;
    `}

  ${({ theme }) =>
    !!theme.visible &&
    css`
      opacity: 1;
    `}
`

type StatsProps = {
  children: React.ReactNode
  active?: string | number
}

const UnstyledStats = ({ children, active, ...props }: StatsProps) => {
  const childrenArray = useMemo(() => React.Children.toArray(children), [children])
  const [prevActiveIndex, setPrevActiveIndex] = useState<number | undefined>(undefined)

  const activeIndex = useMemo(() => {
    const index = childrenArray.findIndex((child) => {
      if (React.isValidElement<StatProps>(child)) {
        return child.props.id === active
      }
      return false
    })

    return index >= 0 ? index : undefined
  }, [childrenArray, active])

  useEffect(() => {
    if (activeIndex !== undefined) {
      setPrevActiveIndex(activeIndex)

      return () => {}
    }

    // clear previous value once animation has finished
    const timeoutId = setTimeout(() => {
      setPrevActiveIndex(undefined)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [activeIndex])

  return (
    <div {...props}>
      <ButtonGrid>
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement<StatProps>(child)) {
            return React.cloneElement(child, {
              theme: {
                active: child.props.id === active,
                clickable: !!(typeof child.props.onClick === 'function'),
                disabled: !!child.props.disabled,
              },
            })
          }

          return null
        })}
      </ButtonGrid>
      <UnderlineContainer
        theme={{
          childCount: childrenArray.length,
          active: prevActiveIndex,
          visible: active !== undefined,
        }}
      >
        <Underline />
      </UnderlineContainer>
    </div>
  )
}

export const Stats = styled(UnstyledStats)`
  position: relative;
`

function useStreamStatsQuery(streamId: string) {
  return useQuery({
    queryKey: ['useStreamStatsQuery', streamId],
    queryFn: async () => {
      const {
        data: { streams },
      } = await getIndexerClient().query<GetStreamsQuery, GetStreamsQueryVariables>({
        query: GetStreamsDocument,
        variables: {
          ids: [streamId],
          pageSize: 1,
        },
      })

      const [stream = undefined] = streams.items

      if (!stream) {
        return null
      }

      const { messagesPerSecond, peerCount } = stream

      return {
        latency: undefined as undefined | number,
        messagesPerSecond,
        peerCount,
      }
    },
  })
}

interface StreamStatsProps {
  streamId: string
}

const defaultStreamStats = {
  latency: undefined,
  messagesPerSecond: undefined,
  peerCount: undefined,
}

export function StreamStats({ streamId }: StreamStatsProps) {
  const { data: stats } = useStreamStatsQuery(streamId)

  const { messagesPerSecond, peerCount, latency } = stats || defaultStreamStats

  return (
    <Stats>
      <Stat id="streamMessagesPerSecond" label="Msgs / sec" value={messagesPerSecond} />
      <Stat id="peerCount" label="Peers" value={peerCount} />
      <Stat
        id="latency"
        label="Latency ms"
        value={latency == null ? undefined : latency.toFixed(2)}
      />
    </Stats>
  )
}

const defaultNetworkMetricEntry = {
  nodeCount: undefined,
  tvl: undefined,
  apy: undefined,
}

export function NetworkStats() {
  const [metricKey, setMetricKey] = useState<NetworkMetricKey>()

  const [interval, setInterval] = useState<Interval>('realtime')

  const reports = useNetworkMetricEntries({
    interval,
  })

  const datapoints = useMemo(() => {
    if (!metricKey) {
      return []
    }

    return reports.map(({ timestamp: x, [metricKey]: y }) => {
      return {
        x,
        y,
      }
    })
  }, [reports, metricKey])

  const { nodeCount, tvl, apy } = useRecentNetworkMetricEntry() || defaultNetworkMetricEntry

  return (
    <>
      <Stats active={metricKey}>
        <Stat
          id="nodeCount"
          label="Nodes"
          value={nodeCount}
          onClick={() => {
            setMetricKey((current) => (current === 'nodeCount' ? undefined : 'nodeCount'))
          }}
        />
        <Stat
          id="apy"
          label="APY"
          value={apy?.toPrecision(4)}
          unit="%"
          onClick={() => {
            setMetricKey((current) => (current === 'apy' ? undefined : 'apy'))
          }}
        />
        <Stat
          id="tvl"
          label="TVL"
          value={tvl == null ? undefined : (tvl / 1000000).toPrecision(4)}
          unit="M DATA"
          onClick={() => {
            setMetricKey((current) => (current === 'tvl' ? undefined : 'tvl'))
          }}
        />
      </Stats>
      {metricKey && (
        <>
          <Graphs defaultInterval="realtime">
            <TimeSeries
              graphData={{ value: datapoints }}
              height="200px"
              ratio="1:2"
              showCrosshair
              dateDisplay={['realtime', '24hours'].includes(interval) ? 'hour' : 'day'}
              labelFormat={(value) => value.toPrecision(4)}
            />
            <Intervals
              options={['realtime', '24hours', '1month', '3months', 'all']}
              onChange={setInterval}
            />
          </Graphs>
        </>
      )}
    </>
  )
}

interface NodeStatsProps {
  nodeId: string
}

const defaultMetricEntry = {
  broadcastMessagesPerSecond: undefined,
  broadcastBytesPerSecond: undefined,
  receiveBytesPerSecond: undefined,
}

export function NodeStats({ nodeId }: NodeStatsProps) {
  const [metricKey, setMetricKey] = useState<NodeMetricKey>('broadcastMessagesPerSecond')

  const [interval, setInterval] = useState<Interval>('realtime')

  const reports = useSortedOperatorNodeMetricEntries({
    interval,
    nodeId,
  })

  const datapoints = useMemo(
    () => reports.map(({ timestamp: x, [metricKey]: y }) => ({ x, y })),
    [reports, metricKey],
  )

  const { broadcastMessagesPerSecond, broadcastBytesPerSecond, receiveBytesPerSecond } =
    useRecentOperatorNodeMetricEntry(nodeId) || defaultMetricEntry

  return (
    <>
      <Stats active={metricKey}>
        <Stat
          id="broadcastMessagesPerSecond"
          label="Msgs / sec"
          value={broadcastMessagesPerSecond?.toPrecision(4)}
          onClick={() => {
            setMetricKey('broadcastMessagesPerSecond')
          }}
        />
        <Stat
          id="broadcastBytesPerSecond"
          label="Up"
          unit=""
          value={broadcastBytesPerSecond && (broadcastBytesPerSecond / 1024 / 1024).toPrecision(4)}
          onClick={() => {
            setMetricKey('broadcastBytesPerSecond')
          }}
        />
        <Stat
          id="receiveBytesPerSecond"
          label="Down"
          unit=""
          value={receiveBytesPerSecond && (receiveBytesPerSecond / 1024 / 1024).toPrecision(4)}
          onClick={() => {
            setMetricKey('receiveBytesPerSecond')
          }}
        />
      </Stats>
      <Graphs defaultInterval="realtime">
        <TimeSeries
          graphData={{ value: datapoints }}
          height="200px"
          ratio="1:2"
          showCrosshair
          dateDisplay={['realtime', '24hours'].includes(interval) ? 'hour' : 'day'}
          labelFormat={(value) => {
            return (/bytes/i.test(metricKey) ? value / 1024 / 1024 : value).toPrecision(4)
          }}
        />
        <Intervals
          options={['realtime', '24hours', '1month', '3months', 'all']}
          onChange={setInterval}
        />
      </Graphs>
    </>
  )
}
