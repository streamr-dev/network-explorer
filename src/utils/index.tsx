import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../Store'
import {
  GetSponsorshipsDocument,
  GetSponsorshipsQuery,
  GetSponsorshipsQueryVariables,
} from '../generated/gql/network'
import { useStreamIdParam } from '../hooks'
import { OperatorNode } from '../types'
import { getNodeLocationId } from './map'
import { useOperatorNodeNeighborsQuery } from './neighbors'
import { useOperatorNodesForStreamQuery } from './nodes'
import { getNetworkClient } from './queries'

const FiveMinutesMs = 5 * 60 * 1000

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
        apy: totalYearlyPayoutBN.dividedBy(totalStakeBN),
        tvl: totalStakeBN,
      }
    },
    staleTime: 2 * FiveMinutesMs,
  })
}
