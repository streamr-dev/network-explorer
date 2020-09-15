import React, {
  useState,
  useMemo,
  useContext,
  useEffect,
} from 'react'
import { ViewportProps, WebMercatorViewport } from 'react-map-gl'

type Node = {
  id: number,
  latitude: number,
  longitude: number,
}

type ContextProps = {
  nodes: Node[],
  setNodes: Function,
  viewport: ViewportProps,
  setViewport: (v: ViewportProps | ((v: ViewportProps) => ViewportProps)) => void,
}

const MapStateContext = React.createContext<ContextProps | undefined>(undefined)

function useMapStateContext() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [viewport, setViewport] = useState<ViewportProps>({
    width: 400,
    height: 400,
    latitude: 60.16952,
    longitude: 24.93545,
    zoom: 10,
    bearing: 0,
    pitch: 0,
    altitude: 0,
    maxZoom: 20,
    minZoom: 0,
    maxPitch: 60,
    minPitch: 0,
  })

  useEffect(() => {
    if (nodes.length <= 0) { return }

    setViewport((prev) => {
      const pointsLong = nodes.map(point => point.longitude)
      const pointsLat = nodes.map(point => point.latitude)
      const cornersLongLat: [[number, number], [number, number]] = [
        [Math.min(...pointsLong), Math.min(...pointsLat)],
        [Math.max(...pointsLong), Math.max(...pointsLat)],
      ]

      // Use WebMercatorViewport to get center longitude/latitude and zoom
      const { longitude, latitude } = new WebMercatorViewport({
        width: prev.width,
        height: prev.height,
      })
        .fitBounds(cornersLongLat, { padding: 200 }) // Can also use option: offset: [0, -100]

      return {
        ...prev,
        longitude,
        latitude,
      }
    })
  }, [nodes])

  return useMemo(() => ({
    nodes,
    setNodes,
    viewport,
    setViewport,
  }), [
    nodes,
    setNodes,
    viewport,
    setViewport,
  ])
}

interface Props  {
  children: React.ReactNode
}

const MapStateProvider = ({ children }: Props) => (
  <MapStateContext.Provider value={useMapStateContext()}>
    {children || null}
  </MapStateContext.Provider>
)

const useMapState = () => {
  const context = useContext(MapStateContext)

  if (!context) {
    throw new Error('MapStateContext must be inside a Provider with a value')
  }

  return context
}

export {
  MapStateProvider as Provider,
  MapStateContext as Context,
  useMapState,
}
