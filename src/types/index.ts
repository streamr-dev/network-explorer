export interface PlaceFeature {
  id: string
  type: string
  place_type: string[]
  text: string
  place_name: string
  bbox: [number, number, number, number] // [minX, minY, maxX, maxY]
  center: [number, number] // [longitude, latitude]
}

export interface PlacesResponse {
  features: PlaceFeature[]
}

export interface Location {
  description: string
  id: string
  latitude: number
  longitude: number
  name: string
}

export interface NeighborPair {
  nodeId0: string
  nodeId1: string
}

export interface Stream {
  description: string
  id: string
  name: string
}

export interface OperatorNode {
  id: string
  latitude: number
  longitude: number
  name: string
}

export type SearchResultItem =
  | {
      type: 'node'
      payload: OperatorNode
    }
  | {
      type: 'stream'
      payload: Stream
    }
  | { type: 'location'; payload: Location }
