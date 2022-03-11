export type SearchResult = {
  type: 'streams' | 'nodes' | 'locations'
  id: string
  name: string
  description?: string
  longitude?: number
  latitude?: number
}

export type Stream = {
  id: string
  name: string
  description: string
}
