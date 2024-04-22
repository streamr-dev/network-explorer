import { useMemo } from 'react'
import { useDebounce } from '.'
import { Location, SearchResultItem } from '../types'
import { useIsFetchingOperatorNodesForStream, useOperatorNodesForStreamQuery } from './nodes'
import { useIsFetchingLocationFeatures, useLocationFeaturesQuery } from './places'
import { useLimitedStreamsQuery } from './streams'
import { truncate } from './text'

function getValidSearchPhrase(phrase: string) {
  return phrase.length < 3 ? '' : phrase.toLowerCase()
}

export function useIsSearching(phrase: string) {
  const isFetchingNodes = useIsFetchingOperatorNodesForStream(undefined)

  const isFetchingPlaces = useIsFetchingLocationFeatures(getValidSearchPhrase(phrase))

  return isFetchingNodes || isFetchingPlaces
}

export function useSearch({ phrase: phraseParam = '' }) {
  const nodesQuery = useOperatorNodesForStreamQuery(undefined)

  const phrase = useDebounce(getValidSearchPhrase(phraseParam), 250)

  const { data: nodes } = nodesQuery

  const foundNodes = useMemo<SearchResultItem[]>(() => {
    const matches: SearchResultItem[] = []

    if (nodes && phrase) {
      for (const node of nodes) {
        const { id, title } = node

        if (id.toLowerCase().includes(phrase) || title.toLowerCase().includes(phrase)) {
          matches.push({
            description: 'Node',
            type: 'node',
            title: node.title,
            payload: node,
          })
        }
      }
    }

    return matches
  }, [nodes, phrase])

  const streamsQuery = useLimitedStreamsQuery({
    phrase,
  })

  const { data: streams } = streamsQuery

  const foundStreams = useMemo<SearchResultItem[]>(() => {
    if (!streams) {
      return []
    }

    return streams.map((stream) => ({
      description: stream.description || 'Stream',
      payload: stream,
      title: truncate(stream.id),
      type: 'stream',
    }))
  }, [streams])

  const locationsQuery = useLocationFeaturesQuery(
    { place: phrase },
    {
      eligible: ({ place_type }) => place_type.includes('place'),
      transform: ({
        id,
        text: name,
        place_name: description,
        center: [longitude, latitude],
      }): Location => ({
        description,
        id,
        latitude,
        longitude,
        name,
      }),
    },
  )

  const { data: locations } = locationsQuery

  const foundLocations = useMemo<SearchResultItem[]>(() => {
    if (!locations) {
      return []
    }

    return locations.map((location) => ({
      description: location.description,
      payload: location,
      title: location.name,
      type: 'place',
    }))
  }, [locations])

  return [...foundNodes, ...foundStreams, ...foundLocations]
}
