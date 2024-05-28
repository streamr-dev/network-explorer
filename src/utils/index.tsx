import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../Store'
import { useStreamIdParam } from '../hooks'
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
  ShowConnections: /*         */ 0x01,
  ShowConnectionsToggle: /*   */ 0x02,
  ShowNodeList: /*            */ 0x04,
  ShowNetworkSelector: /*     */ 0x08,
  ShowResetViewportButton: /* */ 0x10,
  ShowSearch: /*              */ 0x20,
  ShowStats: /*               */ 0x40,
  ShowZoomButtons: /*         */ 0x80,
} as const

const ShowAllHud = Object.values(Hud).reduce((sum, x) => sum + x, 0)

export function useHud<T extends (keyof typeof Hud)[]>(flagKeys: T): { [K in keyof T]: boolean } {
  const [params] = useSearchParams()

  const hud = Number(params.get('hud') || ShowAllHud) & ShowAllHud

  console.log(hud)

  return flagKeys.map((key) => (hud & Hud[key]) === Hud[key]) as { [K in keyof T]: boolean }
}

export function hudToNumber<T extends (keyof typeof Hud)[]>(flagKeys: T): number {
  return flagKeys.reduce((sum, key) => sum + Hud[key], 0)
}
