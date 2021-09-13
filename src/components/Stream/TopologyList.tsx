import React, {
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react'
import { useParams, useHistory } from 'react-router-dom'

import { useStore } from '../../contexts/Store'
import { truncate } from '../../utils/text'
import useIsMounted from '../../hooks/useIsMounted'
import NodeList from '../NodeList'
import NodeStats from '../NodeStats'

type Props = {
  id: string
}

interface ParamTypes {
  nodeId: string
}

const TopologyList = ({ id }: Props) => {
  const { visibleNodes, stream } = useStore()
  const { nodeId: encodedNodeId } = useParams<ParamTypes>()
  const history = useHistory()
  const listRef = useRef<HTMLDivElement>(null)
  const scrollTimeout = useRef<number | undefined>(undefined)
  const isMounted = useIsMounted()

  const activeNodeId = useMemo(() => (
    encodedNodeId && decodeURIComponent(encodedNodeId)
  ), [encodedNodeId])

  const toggleNode = useCallback(
    (nodeId) => {
      let path = `/streams/${encodeURIComponent(id)}`

      if (activeNodeId !== nodeId) {
        path += `/nodes/${encodeURIComponent(nodeId)}`
      }

      history.replace(path)
    },
    [id, history, activeNodeId],
  )

  const streamTitle = (stream && stream.name) || id

  useEffect(() => {
    const { current: el } = listRef

    if (!isMounted() || !el || !activeNodeId || visibleNodes.length < 1) {
      return undefined
    }

    const activeEl = el.querySelector(`[data-node-id="${activeNodeId}"]`)

    if (activeEl) {
      clearTimeout(scrollTimeout.current)

      scrollTimeout.current = setTimeout(() => {
        if (isMounted()) {
          activeEl.scrollIntoView({
            block: 'start',
            behavior: 'smooth',
          })
        }
      }, 500)
    }

    return () => {
      clearTimeout(scrollTimeout.current)
    }
  }, [activeNodeId, visibleNodes, isMounted])

  return (
    <NodeList ref={listRef}>
      <NodeList.Header>
        Showing <strong>{visibleNodes.length}</strong> nodes carrying the stream{' '}
        <strong title={id}>{truncate(streamTitle)}</strong>
      </NodeList.Header>
      {visibleNodes.map(({
        id: nodeId,
        title,
        address,
        location,
      }) => (
        <NodeList.Node
          key={nodeId}
          nodeId={nodeId}
          title={title}
          address={address}
          placeName={(location || {}).title || ''}
          onClick={toggleNode}
          isActive={activeNodeId === nodeId}
          data-node-id={nodeId}
        >
          <NodeStats id={address} />
        </NodeList.Node>
      ))}
    </NodeList>
  )
}

export default TopologyList
