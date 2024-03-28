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
import { useGlobalKeyDownEffect, useStreamIdParam } from './hooks'
import { useDebounced } from './hooks/wrapCallback'
import { ActiveView, OperatorNode } from './types'
import { useOperatorNodesForStreamQuery } from './utils/nodes'

interface Store {
  activeView: ActiveView
  invalidateLocationParamKey(): void
  invalidateNodeIdParamKey(): void
  locationParamKey: number
  mapRef: RefObject<MapRef>
  nodeIdParamkey: number
  resetViewport(): void
  selectedNode: OperatorNode | null
  setActiveView(value: ActiveView): void
  setViewport(fn: (viewport: ViewportProps) => ViewportProps): void
  setViewportDebounced(fn: (viewport: ViewportProps) => ViewportProps): void
  viewport: ViewportProps
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
  activeView: ActiveView.Map,
  invalidateLocationParamKey: () => {},
  invalidateNodeIdParamKey: () => {},
  locationParamKey: -1,
  mapRef: { current: null },
  nodeIdParamkey: -1,
  resetViewport: () => {},
  selectedNode: null,
  setActiveView: () => {},
  setViewport: () => {},
  setViewportDebounced: () => {},
  viewport: defaultViewport,
})

interface StoreProviderProps {
  children?: ReactNode
  mapRef: RefObject<MapRef>
}

export function StoreProvider({ mapRef, ...props }: StoreProviderProps) {
  const selectedNode = useNodeByNodeIdParam()

  const [locationParamKey, invalidateLocationParamKey] = useReducer((x: number) => x + 1, 0)

  const [nodeIdParamkey, invalidateNodeIdParamKey] = useReducer((x: number) => x + 1, 0)

  const [viewport, setViewport] = useState(defaultViewport)

  const setViewportDebounced = useDebounced(
    useCallback((nextViewport: ViewportProps) => setViewport(nextViewport), []),
    250,
  )

  const resetViewport = useCallback(() => {
    setViewportDebounced(defaultViewport)
  }, [setViewportDebounced])

  useGlobalKeyDownEffect('0', () => {
    resetViewport()
  })

  const [activeView, setActiveView] = useState<ActiveView>(ActiveView.Map)

  return (
    <StoreContext.Provider
      {...props}
      value={{
        activeView,
        invalidateLocationParamKey,
        invalidateNodeIdParamKey,
        locationParamKey,
        mapRef,
        nodeIdParamkey,
        resetViewport,
        selectedNode,
        setActiveView,
        setViewport,
        setViewportDebounced,
        viewport,
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
