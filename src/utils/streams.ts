import { ResendOptions, StreamDefinition, StreamMessage, StreamrClientConfig } from '@streamr/sdk'
import { keyToArrayIndex } from '@streamr/utils'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSubscribe } from 'streamr-client-react'
import { z } from 'zod'
import { useStore } from '../Store'
import { Interval } from '../components/Graphs/Graphs'
import { MinuteMs } from '../consts'
import {
  GetStreamsDocument,
  GetStreamsQuery,
  GetStreamsQueryVariables,
} from '../generated/gql/indexer'
import { getIndexerClient } from './queries'
import { config } from '@streamr/config'

function getLimitedStreamsQueryKey(phrase: string, limit: number, chainId: number) {
  return ['useLimitedStreamsQuery', phrase, limit, chainId]
}

interface UseLimitedStreamsQueryParams {
  phrase: string
  limit?: number
}

export function useLimitedStreamsQuery(params: UseLimitedStreamsQueryParams) {
  const { phrase, limit = 20 } = params
  const { chainId } = useStore()

  return useQuery({
    queryKey: getLimitedStreamsQueryKey(phrase, limit, chainId),
    queryFn: async () => {
      if (!phrase) {
        return []
      }

      const {
        data: { streams },
      } = await getIndexerClient(chainId).query<GetStreamsQuery, GetStreamsQueryVariables>({
        query: GetStreamsDocument,
        variables: {
          searchTerm: phrase,
          pageSize: limit,
        },
      })

      return streams.items.map(
        ({
          id,
          description,
          peerCount,
          messagesPerSecond,
          publisherCount = null,
          subscriberCount = null,
        }) => ({
          description: description || '',
          id,
          messagesPerSecond,
          peerCount,
          publisherCount,
          subscriberCount,
        }),
      )
    },
    staleTime: 5 * MinuteMs,
  })
}

interface NodeMetricReport {
  nodeId: string | undefined
  broadcastMessagesPerSecond: number
  broadcastBytesPerSecond: number
  sendMessagesPerSecond: number
  sendBytesPerSecond: number
  receiveMessagesPerSecond: number
  receiveBytesPerSecond: number
  connectionAverageCount: number
  connectionTotalFailureCount: number
  timestamp: number
}

export type NodeMetricKey = Exclude<keyof NodeMetricReport, 'nodeId' | 'timestamp'>

interface UseSortedOperatorNodeMetricEntriesParams {
  interval: Interval
  limit?: number
  nodeId: string
}

export function useSortedOperatorNodeMetricEntries(
  params: UseSortedOperatorNodeMetricEntriesParams,
) {
  const { nodeId, interval, limit } = params

  const { publishers } = useStore()

  const freq =
    interval === 'realtime' || interval === '24hours'
      ? 'min'
      : interval === '1month'
        ? 'hour'
        : 'day'

  const { [nodeId]: publisherId } = publishers

  const resendOptions = useMemo<ResendOptions>(() => {
    if (limit != null) {
      return {
        publisherId,
        last: limit,
      }
    }

    return {
      publisherId,
      ...getResendOptionsForInterval(interval, {
        /**
         * Both `realtime` and `24h` use `/min` stream thus the only difference here
         * is that for realtime we resend *just* 6 hours.
         */
        realtime: 6 * HourMs,
        '24hours': 24 * HourMs,
        '1month': 30 * 24 * HourMs,
        '3months': 3 * 30 * 24 * HourMs,
        all: Date.now() - new Date(2021, 1, 1).getTime(),
      }),
    }
  }, [interval, publisherId, limit])

  const streamId = `streamr.eth/metrics/nodes/firehose/${freq}`

  const streamQuery = useStreamFromClient(streamId)

  const { data: stream } = streamQuery

  const partition = useMemo(
    () => (stream ? keyToArrayIndex(stream.getMetadata().partitions, nodeId) : undefined),
    [stream, nodeId],
  )

  return useStreamMessagesOrderedByTime<NodeMetricReport>(
    {
      streamId,
      partition,
    },
    {
      disabled: partition == null || !publisherId,
      cacheKey: nodeId,
      eligible: (entry) => entry.nodeId === nodeId,
      limit,
      transform: (msg) => {
        const {
          messageId: { timestamp },
        } = msg

        const {
          node: { id, ...node },
        } = z
          .object({
            node: z.object({
              id: z.string().optional(),
              broadcastMessagesPerSecond: z.number(),
              broadcastBytesPerSecond: z.number(),
              sendMessagesPerSecond: z.number(),
              sendBytesPerSecond: z.number(),
              receiveMessagesPerSecond: z.number(),
              receiveBytesPerSecond: z.number(),
              connectionAverageCount: z.number(),
              connectionTotalFailureCount: z.number(),
            }),
          })
          .parse(msg.getParsedContent())

        return {
          nodeId: id,
          timestamp,
          ...node,
        }
      },
      resendOptions,
    },
  )
}

export function useRecentOperatorNodeMetricEntry(nodeId: string) {
  const [recent = null] = useSortedOperatorNodeMetricEntries({
    interval: 'realtime',
    limit: 1,
    nodeId,
  })

  return recent
}

// eslint-disable-next-line import/no-unused-modules
export function getStreamrClientConfig(chainId: number): StreamrClientConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chainConfig = Object.values(config).find((network) => network.id === chainId) as any

  if (!chainConfig) {
    throw new Error(`No Streamr Client configuration found for chain ID ${chainId}`)
  }

  const clientConfig: StreamrClientConfig = {
    metrics: false,
  }

  // Set network entrypoints if provided
  if (chainConfig.entryPoints && chainConfig.entryPoints.length > 0) {
    clientConfig.network = {
      controlLayer: {
        entryPoints: chainConfig.entryPoints,
      },
    }
  }

  clientConfig.contracts = {
    ethereumNetwork: {
      chainId,
    },
    rpcs: chainConfig.rpcEndpoints.slice(0, 1),
    streamRegistryChainAddress: chainConfig.contracts.StreamRegistry,
    streamStorageRegistryChainAddress: chainConfig.contracts.StreamStorageRegistry,
    theGraphUrl: chainConfig.theGraphUrl,
  }

  return clientConfig
}

async function getStreamrClientInstance(chainId: number) {
  const StreamrClient = (await import('@streamr/sdk')).default

  return new StreamrClient(getStreamrClientConfig(chainId))
}

export function useStreamFromClient(streamId: string) {
  const { chainId } = useStore()

  return useQuery({
    queryKey: ['useStreamFromClient', streamId, chainId],
    queryFn: async () => {
      const client = await getStreamrClientInstance(chainId)

      return client.getStream(streamId)
    },
    staleTime: 10 * MinuteMs,
  })
}

const HourMs = MinuteMs * 60

function getResendOptionsForInterval(
  interval: Interval,
  intervalToWindowSize: Record<Interval, number>,
): ResendOptions {
  return {
    from: {
      timestamp: Date.now() - intervalToWindowSize[interval],
    },
  }
}
interface UseStreamMessagesOrderedByTimeOptions<P = StreamMessage> {
  cacheKey?: string
  disabled?: boolean
  eligible?: (payload: P, msg: StreamMessage) => boolean
  limit?: number
  resendOptions?: ResendOptions
  transform?: (msg: StreamMessage) => P
}

function defaultMessageTransform<P>(msg: StreamMessage): P {
  return msg as P
}

function useStreamMessagesOrderedByTime<
  P = StreamMessage,
  T extends { timestamp: number; payload: P } = { timestamp: number; payload: P },
>(streamId: StreamDefinition, options: UseStreamMessagesOrderedByTimeOptions<P> = {}) {
  const {
    cacheKey,
    disabled,
    eligible,
    limit,
    resendOptions,
    transform = defaultMessageTransform<P>,
  } = options

  const entriesRef = useRef<T[]>([])

  useSubscribe(streamId, {
    cacheKey,
    disabled,
    resendOptions,
    onBeforeStart() {
      entriesRef.current = []
    },
    onMessage(msg) {
      try {
        const {
          messageId: { timestamp },
        } = msg

        const lastEntry = entriesRef.current[entriesRef.current.length - 1]

        if (timestamp === lastEntry?.timestamp) {
          return
        }

        const entry = {
          timestamp,
          payload: transform(msg),
        } as T

        if (eligible && !eligible(entry.payload, msg)) {
          return
        }

        entriesRef.current.push(entry)

        if (lastEntry && entry.timestamp < lastEntry.timestamp) {
          entriesRef.current.sort(({ timestamp: a }, { timestamp: b }) => a - b)
        }

        if (limit != null) {
          entriesRef.current.splice(0, entriesRef.current.length - limit)
        }
      } catch (e) {
        console.warn('Error while parsing a message', e, msg)
      }
    },
  })

  const [reports, setReports] = useState<P[]>([])

  useEffect(
    function periodicallyUpdateReports() {
      let timeoutId: number | null = null

      function pull() {
        setReports(entriesRef.current.map(({ payload }) => payload))

        timeoutId = window.setTimeout(pull, 1000)
      }

      pull()

      return () => {
        if (timeoutId != null) {
          window.clearTimeout(timeoutId)

          timeoutId = null
        }
      }
    },
    [cacheKey],
  )

  return reports
}

interface UseNetworkMetricEntriesParams {
  interval?: Interval
  limit?: number
}

interface NetworkMetricReport {
  apy: number
  nodeCount: number
  timestamp: number
  tvl: string
}

export type NetworkMetricKey = Exclude<keyof NetworkMetricReport, 'timestamp'>

export function useNetworkMetricEntries(params: UseNetworkMetricEntriesParams) {
  const { interval = 'realtime', limit } = params

  const freq =
    interval === 'realtime'
      ? 'sec'
      : interval === '24hours'
        ? 'min'
        : interval === '1month'
          ? 'hour'
          : 'day'

  const resendOptions = useMemo(() => {
    if (limit != null) {
      return { last: limit }
    }

    return getResendOptionsForInterval(interval, {
      realtime: 1 * HourMs,
      '24hours': 24 * HourMs,
      '1month': 30 * 24 * HourMs,
      '3months': 3 * 30 * 24 * HourMs,
      all: Date.now() - new Date(2021, 1, 1).getTime(),
    })
  }, [interval, limit])

  return useStreamMessagesOrderedByTime(`streamr.eth/metrics/network/${freq}`, {
    transform: (msg) => {
      const {
        messageId: { timestamp },
      } = msg

      const {
        'staking.avg-APY': apy,
        'network.totalNumberOfNodes': nodeCount,
        'staking.avg-data-staked': tvl,
      } = z
        .object({
          'staking.avg-APY': z.number(),
          'network.totalNumberOfNodes': z.number(),
          'staking.avg-data-staked': z.number(),
        })
        .parse(msg.getParsedContent())

      return {
        apy,
        nodeCount,
        timestamp,
        tvl,
      }
    },
    resendOptions,
    limit,
  })
}

export function useRecentNetworkMetricEntry() {
  const [entry = null] = useNetworkMetricEntries({
    limit: 1,
  })

  return entry
}
