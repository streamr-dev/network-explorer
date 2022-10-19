import React, {
  useCallback,
  useState,
  useReducer,
  useEffect,
  useMemo,
} from 'react'
import { useSubscription, useClient } from 'streamr-client-react'
import { keyToArrayIndex } from 'streamr-client-protocol'
import { getAddressFromNodeId } from '../utils/api/tracker'

import useIsMounted from '../hooks/useIsMounted'

import Stats from './Stats'
import MetricGraph, { MetricType } from './MetricGraph'

const FIREHOSE_STREAM = 'streamr.eth/metrics/nodes/firehose/sec'

type Props = {
  id: string
}

type StatsState = {
  messagesPerSecond?: number | undefined
  upBytes?: number | undefined
  downBytes?: number | undefined
}

const formatBytes = (bytes: number): [string, string] => {
  let value = bytes.toString()
  let unit = 'B / S'

  if (bytes > 1024 * 1024) {
    value = (bytes / (1024 * 1024)).toFixed(1)
    unit = 'MB / S'
  } else if (bytes > 1024) {
    value = (bytes / 1024).toFixed(1)
    unit = 'KB / S'
  }

  return [value, unit]
}

const NodeStats = ({ id }: Props) => {
  const client = useClient()
  const nodeAddress = useMemo(() => (getAddressFromNodeId(id)), [id])
  const [partition, setPartition] = useState(0)
  const [selectedStat, setSelectedStat] = useState<MetricType | undefined>('messagesPerSecond')
  const [{ messagesPerSecond, upBytes, downBytes }, updateStats] = useReducer(
    (prevState: StatsState, nextState: StatsState) => ({
      ...(prevState || {}),
      ...nextState,
    }),
    {
      messagesPerSecond: undefined,
      upBytes: undefined,
      downBytes: undefined,
    },
  )
  const upBytesFormatted = useMemo(() => upBytes ? formatBytes(upBytes) : [undefined, ''], [upBytes])
  const downBytesFormatted = useMemo(() => downBytes ? formatBytes(downBytes) : [undefined, ''], [downBytes])

  useEffect(() => {
    const load = async () => {
      const stream = await client.getStream(FIREHOSE_STREAM)
      setPartition(keyToArrayIndex(stream.partitions, id))
    }
    load()
  }, [client, id])

  const toggleStat = useCallback((name) => {
    setSelectedStat((prev) => (prev !== name ? name : undefined))
  }, [])

  const isMounted = useIsMounted()

  const onMessage = useCallback((msg, metadata) => {
    const { broker, network, node } = msg
    const { messageId } = metadata

    // Filter out messages that were not sent by currently selected node
    if (messageId.publisherId !== nodeAddress) {
      return
    }

    if (isMounted()) {
      updateStats({
        messagesPerSecond: (node && node.publishMessagesPerSecond) ||
          (broker && broker.messagesToNetworkPerSec) ||
          undefined,
        upBytes: (node && node.sendBytesPerSecond) ||
          (network && network.bytesToPeersPerSec) ||
          undefined,
        downBytes: (node && node.receiveBytesPerSecond) ||
          (network && network.bytesFromPeersPerSec) ||
          undefined,
      })
    }
  }, [isMounted, nodeAddress])

  useSubscription(
    {
      stream: FIREHOSE_STREAM,
      partition,
      resend: {
        last: 1,
        publisherId: id.toLowerCase(),
      },
    }, {
      onMessage,
    })

  return (
    <>
      <Stats active={selectedStat}>
        <Stats.Stat
          id="messagesPerSecond"
          label="Msg / sec"
          value={messagesPerSecond?.toFixed(3)}
          onClick={() => toggleStat('messagesPerSecond')}
        />
        <Stats.Stat
          id="upBytes"
          label={`Up ${upBytesFormatted[1]}`}
          value={upBytesFormatted[0]}
          onClick={() => toggleStat('upBytes')}
        />
        <Stats.Stat
          id="downBytes"
          label={`Down ${downBytesFormatted[1]}`}
          value={downBytesFormatted[0]}
          onClick={() => toggleStat('downBytes')}
        />
      </Stats>
      {!!selectedStat && <MetricGraph type="node" id={id} metric={selectedStat} />}
    </>
  )
}

export default NodeStats
