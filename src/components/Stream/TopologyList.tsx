import React, {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
} from 'react'
import { useParams, useHistory } from 'react-router-dom'

import { useStore } from '../../contexts/Store'
import { truncate } from '../../utils/text'
import { Node } from '../../utils/api/tracker'
import useIsMounted from '../../hooks/useIsMounted'
import usePaged from '../../hooks/usePaged'
import NodeList from '../NodeList'
import NodeStats from '../NodeStats'

type Props = {
  id: string
}

interface ParamTypes {
  nodeId: string
}

const PAGE_SIZE = 10

const TopologyList = ({ id }: Props) => {
  const { visibleNodes, stream } = useStore()
  const { nodeId: encodedNodeId } = useParams<ParamTypes>()
  const history = useHistory()
  const listRef = useRef<HTMLDivElement>(null)
  const scrollTimeout = useRef<number | undefined>(undefined)
  const isMounted = useIsMounted()
  const [pageChangedOnLoad, setPageChangedOnLoad] = useState(false)

  const {
    currentPage,
    setPage,
    items,
    pages,
  } = usePaged<Node>({ items: visibleNodes, limit: PAGE_SIZE })

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

  // Set correct page on load
  useEffect(() => {
    if (!activeNodeId || visibleNodes.length < 1 || pageChangedOnLoad) {
      return
    }

    const index = visibleNodes.findIndex(({ id: nodeId }) => nodeId === activeNodeId)

    if (index >= 0) {
      const page = Math.ceil((index + 1) / PAGE_SIZE)

      setPage(page)
      setPageChangedOnLoad(true)
    }
  }, [activeNodeId, visibleNodes, setPage, pageChangedOnLoad])

  useEffect(() => {
    const { current: el } = listRef

    if (!el || !activeNodeId || items.length < 1) {
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
  }, [activeNodeId, items, isMounted])

  return (
    <NodeList ref={listRef}>
      <NodeList.Header>
        Showing <strong>{visibleNodes.length}</strong> nodes carrying the stream{' '}
        <strong title={id}>{truncate(streamTitle)}</strong>
      </NodeList.Header>
      {pages > 1 && (
        <NodeList.Pager
          currentPage={currentPage}
          lastPage={pages}
          onChange={setPage}
        />
      )}
      {items.map(({
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
