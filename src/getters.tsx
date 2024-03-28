import { entropyToMnemonic } from '@ethersproject/hdnode'
import {
  GetNeighborsDocument,
  GetNeighborsQuery,
  GetNeighborsQueryVariables,
  GetNodesDocument,
  GetNodesQuery,
  GetNodesQueryVariables,
} from './generated/gql/indexer'
import { Neighbour, OperatorNode } from './types'
import { getIndexerClient } from './utils/queries'

interface GetOperatorNodesParams {
  ids?: string[]
  streamId?: string
}

export async function getOperatorNodes(params: GetOperatorNodesParams): Promise<OperatorNode[]> {
  const pageSize = 500

  const { ids, streamId } = params

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
        streamId,
      },
    })

    for (const item of nodes.items) {
      if (!item.location) {
        continue
      }

      const { id, location } = item

      const title = entropyToMnemonic(`0x${id}`)
        .match(/(\w+|\s\w+){3}$/)![0]
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
  streamId?: string
  streamPartitionId?: string
}

export async function getNeighbors(params: GetNeighborsParams): Promise<Neighbour[]> {
  const pageSize = 1000

  const { node, streamPartitionId } = params

  const items: Neighbour[] = []

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
        streamPart: streamPartitionId,
      },
    })

    for (const {
      nodeId1: a,
      nodeId2: b,
      streamPartId: finalStreamPartitionId,
    } of neighbors.items) {
      const pair = [a, b].sort() as [string, string]

      const key = pair.join('-')

      if (uniquenessGate[key]) {
        continue
      }

      uniquenessGate[key] = true

      const [nodeId0, nodeId1] = pair

      items.push({
        nodeId0,
        nodeId1,
        streamPartitionId: finalStreamPartitionId,
      })
    }

    if (!neighbors.cursor || neighbors.cursor === cursor) {
      break
    }

    cursor = neighbors.cursor
  }

  return items
}
