import { entropyToMnemonic } from '@ethersproject/hdnode'
import {
  GetNeighborsDocument,
  GetNeighborsQuery,
  GetNeighborsQueryVariables,
  GetNodesDocument,
  GetNodesQuery,
  GetNodesQueryVariables,
} from './generated/gql/indexer'
import { NeighborPair, OperatorNode } from './types'
import { getIndexerClient } from './utils/queries'

interface GetOperatorNodesParams {
  ids?: string[]
}

export async function getOperatorNodes(params: GetOperatorNodesParams): Promise<OperatorNode[]> {
  const pageSize = 500

  const { ids } = params

  const items: OperatorNode[] = []

  let cursor = '0'

  for (;;) {
    const {
      data: { nodes },
    } = await getIndexerClient().query<GetNodesQuery, GetNodesQueryVariables>({
      fetchPolicy: 'network-only',
      query: GetNodesDocument,
      variables: {
        cursor,
        ids,
        pageSize,
      },
    })

    for (const item of nodes.items) {
      if (!item.location) {
        continue
      }

      const { id, location } = item

      const title = entropyToMnemonic(`0x${id}`)
        .match(/(^\w+|\s\w+){3}/)![0]
        .replace(/(^\w|\s\w)/g, (w) => w.toUpperCase())

      items.push({
        id,
        location,
        title,
      })
    }

    if (!nodes.cursor || nodes.cursor === cursor) {
      break
    }

    cursor = nodes.cursor
  }

  return items
}

interface GetNeighborsParams {
  node?: string
  streamPart?: string
}

export async function getNeighbors(params: GetNeighborsParams): Promise<NeighborPair[]> {
  const pageSize = 1000

  const { node, streamPart } = params

  const items: NeighborPair[] = []

  const uniquenessGate: Record<string, true> = {}

  let cursor = '0'

  for (;;) {
    const {
      data: { neighbors },
    } = await getIndexerClient().query<GetNeighborsQuery, GetNeighborsQueryVariables>({
      fetchPolicy: 'network-only',
      query: GetNeighborsDocument,
      variables: {
        cursor,
        node,
        pageSize,
        streamPart,
      },
    })

    for (const { nodeId1: a, nodeId2: b } of neighbors.items) {
      const pair = [a, b].sort() as [string, string]

      const key = pair.join('-')

      if (uniquenessGate[key]) {
        continue
      }

      uniquenessGate[key] = true

      items.push(pair)
    }

    if (!neighbors.cursor || neighbors.cursor === cursor) {
      break
    }

    cursor = neighbors.cursor
  }

  return items
}
