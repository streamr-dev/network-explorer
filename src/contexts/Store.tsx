import React, {
  ReactNode,
  RefObject,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { LinearInterpolator, MapRef, TRANSITION_EVENTS, ViewportProps } from 'react-map-gl'
import { useParams } from 'react-router-dom'
import { useGlobalKeyDownEffect, useStreamIdParam } from '../hooks'
import { OperatorNode } from '../types'
import { useOperatorNodesForStreamQuery } from '../utils/nodes'

interface Store {
  mapRef: RefObject<MapRef>
  selectedNode: OperatorNode | null
  locationParamKey: number
  invalidateLocationParamKey(): void
  nodeIdParamkey: number
  invalidateNodeIdParamKey(): void
  viewport: ViewportProps
  setViewport(fn: (viewport: ViewportProps) => ViewportProps): void
  resetViewport(): void
}

const defaultViewport: ViewportProps = {
  altitude: 0,
  bearing: 0,
  height: 0,
  latitude: 53.86859,
  longitude: -0.36616,
  maxPitch: 60,
  maxZoom: 15,
  minPitch: 0,
  minZoom: 2,
  pitch: 0,
  transitionDuration: 300,
  transitionEasing: (t: number) => t,
  transitionInterpolator: new LinearInterpolator(),
  transitionInterruption: TRANSITION_EVENTS.BREAK,
  width: 0,
  zoom: 3,
}

const StoreContext = createContext<Store>({
  mapRef: { current: null },
  selectedNode: null,
  locationParamKey: -1,
  invalidateLocationParamKey: () => {},
  nodeIdParamkey: -1,
  invalidateNodeIdParamKey: () => {},
  viewport: defaultViewport,
  setViewport: () => {},
  resetViewport: () => {},
})

interface StoreProviderProps {
  mapRef: RefObject<MapRef>
  children?: ReactNode
}

export function StoreProvider({ mapRef, ...props }: StoreProviderProps) {
  const selectedNode = useNodeByNodeIdParam()

  const [locationParamKey, invalidateLocationParamKey] = useReducer((x: number) => x + 1, 0)

  const [nodeIdParamkey, invalidateNodeIdParamKey] = useReducer((x: number) => x + 1, 0)

  const [viewport, setViewport] = useState(defaultViewport)

  const resetViewport = useCallback(() => {
    setViewport(defaultViewport)
  }, [])

  useGlobalKeyDownEffect('0', () => {
    resetViewport()
  })

  return (
    <StoreContext.Provider
      {...props}
      value={{
        mapRef,
        selectedNode,
        locationParamKey,
        invalidateLocationParamKey,
        nodeIdParamkey,
        invalidateNodeIdParamKey,
        viewport,
        setViewport,
        resetViewport,
      }}
    />
  )
}

export function useStore() {
  return useContext(StoreContext)
}

function useNodeByNodeIdParam() {
  const streamId = useStreamIdParam()

  const { data: nodes } = useOperatorNodesForStreamQuery(streamId || undefined)

  const { nodeId: activeNodeId = null } = useParams<{ nodeId: string }>()

  return useMemo(
    function findNodeById() {
      if (!nodes || !activeNodeId) {
        return null
      }

      return nodes.find(({ id }) => id === activeNodeId) || null
    },
    [activeNodeId, nodes],
  )
}
