import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useController } from '../../contexts/Controller'
import usePaged from '../../hooks/usePaged'
import { OperatorNode } from '../../types'
import useIsMounted from '../../hooks/useIsMounted'
import NodeList from '../NodeList'
import NodeStats from '../NodeStats'
import { useStore } from '../../hooks/useStore'

type Props = {
  id?: string
}

const TopologyList = ({ id: activeNodeId }: Props) => {
  const { visibleNodes: nodes } = useStore()
  const { loadNodeLocations } = useController()
  const navigate = useNavigate()
  const listRef = useRef<HTMLDivElement>(null)
  const scrollTimeout = useRef<number | undefined>(undefined)
  const [pageChangedOnLoad, setPageChangedOnLoad] = useState(false)
  const isMounted = useIsMounted()

  const currentNode = useMemo(() => nodes.find(({ id: nodeId }) => nodeId === activeNodeId), [
    nodes,
    activeNodeId,
  ])

  const toggleNode = useCallback(
    (nodeId: string) => {
      navigate(`/nodes/${encodeURIComponent(nodeId)}`, { replace: true })
    },
    [navigate],
  )

  // show all nodes in same location
  const visibleNodes: OperatorNode[] = useMemo(
    () =>
      currentNode && nodes
        ? nodes.filter(({ location }) => {
            return location.latitude === currentNode.location.latitude && location.longitude === currentNode.location.longitude
          })
        : [],
    [nodes, currentNode],
  )

  const { currentPage, setPage, items, pages } = usePaged<OperatorNode>({
    items: visibleNodes,
    limit: NodeList.PAGE_SIZE,
  })

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

  // set page to 1 if the shown list is empty
  useEffect(() => {
    if (visibleNodes.length < 1) {
      return
    }

    if (items.length <= 0) {
      setPage(1)
    }
  }, [visibleNodes, items, setPage])

  // scroll active node visible
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
      loadNodeLocations(nodesWithoutLocation).then(() => {
        fetching.current = false
      })
    }
  }, [items, loadNodeLocations])

  return visibleNodes.length > 0 ? (
    <NodeList ref={listRef}>
      {visibleNodes.length > 1 && (
        <NodeList.Header>
          There are <strong>{visibleNodes.length}</strong> nodes in this location
        </NodeList.Header>
      )}
      {pages > 1 && (
        <NodeList.Pager currentPage={currentPage} lastPage={pages} onChange={setPage} />
      )}
      {items.map(({ id: nodeId, title }) => (
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
  ) : null
}

export default TopologyList
