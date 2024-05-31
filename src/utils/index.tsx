import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useStore } from '../Store'
import { DefaultViewState } from '../consts'
import { useMap, useStreamIdParam } from '../hooks'
import { OperatorNode } from '../types'
import { getNodeLocationId } from './map'
import { useOperatorNodeNeighborsQuery } from './neighbors'
import { useOperatorNodesForStreamQuery } from './nodes'

export function useNodeConnections() {
  const streamId = useStreamIdParam() || undefined

  const { data: nodes } = useOperatorNodesForStreamQuery(streamId)

  const { selectedNode } = useStore()

  const { data: neighbors } = useOperatorNodeNeighborsQuery(selectedNode?.id, { streamId })

  return useMemo(
    function getConnectionsFromNodesAndNeighbors() {
      if (!nodes || !neighbors) {
        return []
      }

      const nodesById: Record<string, OperatorNode | undefined> = {}

      for (const node of nodes) {
        nodesById[node.id] = node
      }

      const connections: {
        sourceId: string
        targetId: string
        source: [number, number]
        target: [number, number]
      }[] = []

      const uniquenessGate: Record<string, true> = {}

      for (const { nodeId0: sourceId, nodeId1: targetId } of neighbors) {
        const source = nodesById[sourceId]?.location

        const target = nodesById[targetId]?.location

        if (!source || !target) {
          continue
        }

        const key = `${getNodeLocationId(source)}-${getNodeLocationId(target)}`

        if (uniquenessGate[key]) {
          continue
        }

        uniquenessGate[key] = true

        connections.push({
          sourceId,
          targetId,
          source: [source.longitude, source.latitude],
          target: [target.longitude, target.latitude],
        })
      }

      return connections
    },
    [nodes, neighbors],
  )
}

export function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(
    function updateValueAfterDelay() {
      const handler = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)

      return () => {
        clearTimeout(handler)
      }
    },
    [value, delay],
  )

  return debouncedValue
}

const Hud = {
  /**
   * Set `ConnectionMode.Always` on load.
   */
  showConnections: /*         */ 0x0001,
  /**
   * Show the connection mode toggle.
   */
  showConnectionsToggle: /*   */ 0x0002,
  /**
   * Show the node list for the current context (stream or selected node).
   */
  showNodeList: /*            */ 0x0004,
  /**
   * Show the network selector dropdown.
   */
  showNetworkSelector: /*     */ 0x0008,
  /**
   * Show the viewport reset button.
   */
  showResetViewportButton: /* */ 0x0010,
  /**
   * Show the search.
   */
  showSearch: /*              */ 0x0020,
  /**
   * Use tighter padding around the search and the controls.
   */
  compact: /*                 */ 0x0040,
  /**
   * Show zoom in and out buttons.
   */
  showZoomButtons: /*         */ 0x0080,
  /**
   * Fly to node on select.
   */
  autoCenter: /*              */ 0x0100,
} as const

const fallbackHud =
  Hud.showConnectionsToggle |
  Hud.showNodeList |
  Hud.showNetworkSelector |
  Hud.showResetViewportButton |
  Hud.showSearch |
  Hud.showZoomButtons

export function useHud() {
  const [params] = useSearchParams()

  const hud = Number(params.get('hud') || fallbackHud)

  return Object.entries(Hud).reduce(
    (memo, [key, value]) => {
      memo[key as keyof typeof Hud] = !!(hud & value)

      return memo
    },
    {} as Partial<Record<keyof typeof Hud, boolean>>,
  ) as Record<keyof typeof Hud, boolean>
}

export function hudToNumber<T extends (keyof typeof Hud)[]>(keys: T): number {
  return keys.reduce((sum, key) => sum + Hud[key], 0)
}

export function useAutoCenterNodeEffect() {
  const { autoCenter } = useHud()

  const streamId = useStreamIdParam()

  const { data: nodes } = useOperatorNodesForStreamQuery(streamId || undefined)

  const { nodeId: activeNodeId = null } = useParams<{ nodeId: string }>()

  const map = useMap()

  const node = useMemo(
    function findNodeByIdOrUseFirst() {
      if (!autoCenter) {
        return null
      }

      if (!nodes) {
        return null
      }

      if (activeNodeId) {
        return nodes.find(({ id }) => id === activeNodeId) || null
      }

      return findNearestToDefaultCenter(nodes)
    },
    [activeNodeId, nodes, autoCenter],
  )

  useEffect(
    function flyToNode() {
      if (node) {
        map?.flyTo({ center: [node.location.longitude, node.location.latitude] })
      }
    },
    [node, map],
  )
}

function findNearestToDefaultCenter(nodes: OperatorNode[]) {
  let distance = Infinity

  let nearestNode: OperatorNode | null = null

  const { longitude: y0, latitude: x0 } = DefaultViewState

  for (const node of nodes) {
    const { longitude: y1, latitude: x1 } = node.location

    const currentDistance = Math.sqrt((y0 - y1) ** 2 + (x0 - x1) ** 2)

    if (currentDistance < distance) {
      nearestNode = node

      distance = currentDistance
    }
  }

  return nearestNode
}

export function isFramed() {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
}
