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

export interface Neighbour {
  nodeId0: string
  nodeId1: string
  streamPartitionId: string
  rtt?: number
}

interface Stream {
  description: string
  id: string
  messagesPerSecond: number
  peerCount: number
  publisherCount: number | null
  subscriberCount: number | null
}

export interface OperatorNode {
  id: string
  location: {
    latitude: number
    longitude: number
    title?: string
  }
  title: string
}

export type SearchResultItem = { title: string; description: string } & (
  | {
      type: 'node'
      payload: OperatorNode
    }
  | {
      type: 'stream'
      payload: Stream
    }
  | { type: 'place'; payload: Location }
)

export enum ActiveView {
  Map = 'map',
  List = 'list',
}

export enum ConnectionsMode {
  Auto = 'auto',
  Always = 'always',
  Off = 'off',
}
