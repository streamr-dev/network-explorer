import React, {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
} from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { truncate } from '../../utils/text'
import useIsMounted from '../../hooks/useIsMounted'
import usePaged from '../../hooks/usePaged'
import { useController } from '../../contexts/Controller'
import NodeList from '../NodeList'
import NodeStats from '../NodeStats'
import { OperatorNode } from '../../types'
import { useStore } from '../../hooks/useStore'

type Props = {
  id: string
}

const TopologyList = ({ id }: Props) => {
  const { visibleNodes, stream } = useStore()
  const { nodeId: encodedNodeId } = useParams<{ nodeId: string }>()
  const navigate = useNavigate()
  const listRef = useRef<HTMLDivElement>(null)
  const scrollTimeout = useRef<number | undefined>(undefined)
  const isMounted = useIsMounted()
  const [pageChangedOnLoad, setPageChangedOnLoad] = useState(false)
  const { loadNodeLocations } = useController()

  const {
    currentPage,
    setPage,
    items,
    pages,
  } = usePaged<OperatorNode>({ items: visibleNodes, limit: NodeList.PAGE_SIZE })

  const activeNodeId = useMemo(() => (
    encodedNodeId && decodeURIComponent(encodedNodeId)
  ), [encodedNodeId])

  const toggleNode = useCallback(
    (nodeId: string) => {
      let path = `/streams/${encodeURIComponent(id)}`

      if (activeNodeId !== nodeId) {
        path += `/nodes/${encodeURIComponent(nodeId)}`
      }

      navigate(path, { replace: true })
    },
    [id, navigate, activeNodeId],
  )

  const streamTitle = (stream && stream.name) || id

  // Set correct page on load
  useEffect(() => {
    if (!activeNodeId || visibleNodes.length < 1 || pageChangedOnLoad) {
      return
    }

    const index = visibleNodes.findIndex(({ id: nodeId }) => nodeId === activeNodeId)

    if (index >= 0) {
      const page = Math.ceil((index + 1) / NodeList.PAGE_SIZE)

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

      scrollTimeout.current = window.setTimeout(() => {
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

  // load locations for visible list items
  const fetching = useRef(false)
  useEffect(() => {
    /**
     * @todo If at all. Previously
     * items.filter(({ location }) => location && !location.isReverseGeoCoded)
     */
    const nodesWithoutLocation: OperatorNode[] = []

    if (nodesWithoutLocation.length > 0 && !fetching.current) {
      fetching.current = true
      loadNodeLocations(nodesWithoutLocation)
        .then(() => {
          fetching.current = false
        })
    }
  }, [items, loadNodeLocations])

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
      }) => (
        <NodeList.Node
          key={nodeId}
          nodeId={nodeId}
          title={title}
          address="N/A"
          placeName="N/A"
          onClick={toggleNode}
          isActive={activeNodeId === nodeId}
          data-node-id={nodeId}
        >
          <NodeStats id={nodeId} />
        </NodeList.Node>
      ))}
    </NodeList>
  )
}

export default TopologyList
