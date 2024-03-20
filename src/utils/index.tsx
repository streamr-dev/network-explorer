import { useInfiniteQuery, useIsFetching, useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../contexts/Store'
import {
  GetStreamsDocument,
  GetStreamsQuery,
  GetStreamsQueryVariables,
  GetSummaryDocument,
  GetSummaryQuery,
  GetSummaryQueryVariables,
  OrderDirection,
  StreamOrderBy,
} from '../generated/gql/indexer'
import {
  GetSponsorshipsDocument,
  GetSponsorshipsQuery,
  GetSponsorshipsQueryVariables,
} from '../generated/gql/network'
import { Location, OperatorNode, PlaceFeature, PlacesResponse, SearchResultItem } from '../types'
import { getNodeLocationId } from './map'
import { useOperatorNodeNeighborsQuery } from './neighbors'
import { useAllOperatorNodesQuery, useIsFetchingAllNodes } from './nodes'
import { getIndexerClient, getNetworkClient } from './queries'

function getSummaryQueryKey() {
  return ['useSummaryQuery'] as const
}

const FiveMinutesMs = 5 * 60 * 1000

export function useSummaryQuery() {
  return useQuery({
    queryKey: getSummaryQueryKey(),
    queryFn: async () => {
      const {
        data: { summary },
      } = await getIndexerClient().query<GetSummaryQuery, GetSummaryQueryVariables>({
        fetchPolicy: 'network-only',
        query: GetSummaryDocument,
      })

      const { nodeCount, messagesPerSecond, streamCount } = summary

      return { nodeCount, messagesPerSecond, streamCount }
    },
    staleTime: FiveMinutesMs,
  })
}

export function useIsFetchingSummary() {
  return (
    useIsFetching({
      exact: false,
      queryKey: [getSummaryQueryKey()[0]],
    }) > 0
  )
}

export function isOperatorNodeGeoFeature(
  arg: GeoJSON.Feature | undefined,
): arg is GeoJSON.Feature<GeoJSON.Point, { id: string; title: string; locationId: string }> {
  return !!arg && arg.geometry.type === 'Point' && !!(arg.properties || {}).locationId
}

interface UseStreamsQueryParams {
  ids?: string[]
  orderBy?: StreamOrderBy
  orderDirection?: OrderDirection
  owner?: string
  pageSize?: number
  searchTerm?: string
}

function getStreamsInfiniteQueryKey(params: UseStreamsQueryParams) {
  const {
    ids = [],
    orderBy = StreamOrderBy.MessagesPerSecond,
    orderDirection = OrderDirection.Asc,
    owner,
    pageSize,
    searchTerm,
  } = params

  return [
    'useStreamsInfiniteQuery',
    pageSize,
    orderBy,
    orderDirection,
    owner,
    searchTerm,
    ...ids,
  ] as const
}

export function useStreamsInfiniteQuery(params: UseStreamsQueryParams) {
  const {
    ids,
    orderBy = StreamOrderBy.MessagesPerSecond,
    orderDirection = OrderDirection.Asc,
    owner,
    pageSize = 10,
    searchTerm,
  } = params

  return useInfiniteQuery({
    queryKey: getStreamsInfiniteQueryKey({
      ids,
      orderBy,
      orderDirection,
      owner,
      pageSize,
      searchTerm,
    }),
    queryFn: async ({ pageParam }) => {
      const result = await getIndexerClient().query<GetStreamsQuery, GetStreamsQueryVariables>({
        fetchPolicy: 'network-only',
        query: GetStreamsDocument,
        variables: {
          cursor: pageParam,
          pageSize,
          orderBy,
          orderDirection,
          owner,
          searchTerm,
          ids,
        },
      })

      const { items, cursor } = result.data.streams

      return {
        cursor: cursor || undefined,
        items: items,
      }
    },
    initialPageParam: '0',
    getNextPageParam: (lastPage) => {
      return lastPage.cursor
    },
  })
}

export function useIsFetchingStreams() {
  return (
    useIsFetching({
      exact: false,
      queryKey: [getStreamsInfiniteQueryKey({})[0]],
    }) > 0
  )
}

export function useNodeConnections() {
  const { data: nodes } = useAllOperatorNodesQuery()

  const { selectedNode } = useStore()

  const { data: neighbors } = useOperatorNodeNeighborsQuery(selectedNode?.id)

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

      for (const [sourceId, targetId] of neighbors) {
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

export const MapboxToken = process.env.REACT_APP_MAPBOX_TOKEN

interface UseLocationFeaturesQueryParams {
  place?: string | [number, number]
}

interface UseLocationFeaturesQueryOptions<T> {
  transform?: (feature: PlaceFeature) => T
  eligible?: (feature: PlaceFeature) => boolean
}

function getLocationFeaturesQueryKey(place: string) {
  return ['useLocationFeaturesQuery', place]
}

function useLocationFeaturesQuery<T = PlaceFeature>(
  params: UseLocationFeaturesQueryParams,
  options: UseLocationFeaturesQueryOptions<T> = {},
) {
  const { place: placeParam = '' } = params

  const place = typeof placeParam === 'string' ? placeParam : placeParam.join(',')

  return useQuery({
    queryKey: getLocationFeaturesQueryKey(place),
    queryFn: async ({ signal }) => {
      const result: T[] = []

      if (!place) {
        return result
      }

      const resp = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json?access_token=${MapboxToken}`,
        { method: 'GET', signal },
      )

      const response: PlacesResponse = await resp.json()

      for (const feature of response.features) {
        if (options.eligible && !options.eligible(feature)) {
          continue
        }

        if (!options.transform) {
          result.push(feature as T)

          continue
        }

        result.push(options.transform(feature))
      }

      return result
    },
    staleTime: Infinity,
  })
}

interface UseLocationRegionParams {
  latitude: number
  longitude: number
}

export function useLocationRegionsQuery(params: UseLocationRegionParams) {
  const { latitude, longitude } = params

  return useLocationFeaturesQuery(
    { place: [latitude, longitude] },
    {
      eligible: ({ type }) => type.includes('region'),
      transform: ({ bbox, place_name: region }) => ({ bbox, region }),
    },
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

function getValidSearchPhrase(phrase: string) {
  return phrase.length < 3 ? '' : phrase.toLowerCase()
}

export function useIsSearching(phrase: string) {
  const isFetchingNodes = useIsFetchingAllNodes()

  const isFetchingPlaces = useIsFetching({
    queryKey: getLocationFeaturesQueryKey(getValidSearchPhrase(phrase)),
  })

  return isFetchingNodes || isFetchingPlaces
}

export function useSearch({ phrase: phraseParam = '' }) {
  const nodesQuery = useAllOperatorNodesQuery()

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

  /**
   * @todo Implement stream search.
   */

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

  return [...foundNodes, ...foundLocations]
}

export function useSponsorshipSummaryQuery() {
  return useQuery({
    queryKey: ['useSponsorshipSummaryQuery'],
    queryFn: async () => {
      const batchSize = 999

      let totalStakeBN = new BigNumber(0)

      let totalYearlyPayoutBN = new BigNumber(0)

      let page = 0

      for (;;) {
        const {
          data: { sponsorships },
        } = await getNetworkClient().query<GetSponsorshipsQuery, GetSponsorshipsQueryVariables>({
          query: GetSponsorshipsDocument,
          variables: {
            first: batchSize + 1,
            skip: page * batchSize,
          },
        })

        for (const { totalStakedWei, spotAPY } of sponsorships) {
          const totalStakedWeiBN = new BigNumber(totalStakedWei)

          totalStakeBN = totalStakeBN.plus(totalStakedWeiBN)

          totalYearlyPayoutBN = totalYearlyPayoutBN.plus(
            totalStakedWeiBN.multipliedBy(new BigNumber(spotAPY)),
          )
        }

        if (sponsorships.length <= batchSize) {
          /**
           * Recent batch was the last batch.
           */
          break
        }

        page = page + 1
      }

      return {
        apy: totalYearlyPayoutBN.dividedBy(totalStakeBN).multipliedBy(100),
        tvl: totalStakeBN,
      }
    },
    staleTime: 2 * FiveMinutesMs,
  })
}

export function useStreamNodesQuery(streamId: string | null) {
  // Get neighbours
  // Get unique node ids
  // Get nodes for them ids via network
  return useMemo<OperatorNode[]>(() => [], [])
}
