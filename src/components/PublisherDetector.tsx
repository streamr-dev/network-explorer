import { ResendOptions } from '@streamr/sdk'
import { keyToArrayIndex } from '@streamr/utils'
import { useEffect, useMemo, useRef } from 'react'
import { useResend } from 'streamr-client-react'
import { useStore } from '../Store'
import { MinuteMs } from '../consts'
import { useStreamFromClient } from '../utils/streams'

export function PublisherDetector() {
  const { selectedNode, publishers, setPublishers } = useStore()

  const nodeId = selectedNode?.id

  const streamId = 'streamr.eth/metrics/nodes/firehose/min'

  const streamQuery = useStreamFromClient(streamId)

  const { data: stream } = streamQuery

  const partition = useMemo(
    () => (stream && nodeId ? keyToArrayIndex(stream.getMetadata().partitions, nodeId) : undefined),
    [stream, nodeId],
  )

  const publisherId = nodeId ? publishers[nodeId] : undefined

  const mappingRef = useRef<typeof publishers>({})

  const resendOptions: ResendOptions = useMemo(
    () => ({
      from: { timestamp: Date.now() - MinuteMs * 2 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodeId],
  )

  useResend(
    {
      streamId,
      partition,
    },
    resendOptions,
    {
      cacheKey: nodeId,
      disabled: !!publisherId || partition == null,
      onMessage(msg) {
        try {
          const { node } = msg.getParsedContent()

          if (node.id) {
            mappingRef.current[node.id] = msg.messageId.publisherId
          }
        } catch (e) {
          console.log('Invalid message', e)
        }
      },
    },
  )

  useEffect(
    function periodicallyUpdatePublishers() {
      let timeoutId: number | null = null

      function pull() {
        const { current: mapping } = mappingRef

        mappingRef.current = {}

        if (Object.keys(mapping).length) {
          setPublishers((current) => ({
            ...current,
            ...mapping,
          }))
        }

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
    [setPublishers],
  )

  return null
}
