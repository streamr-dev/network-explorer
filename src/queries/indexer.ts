import { gql } from '@apollo/client'

gql`
  query GetNodes($cursor: String, $pageSize: Int, $ids: [String!], $streamId: String) {
    nodes(cursor: $cursor, pageSize: $pageSize, ids: $ids, stream: $streamId) {
      cursor
      items {
        id
        ipAddress
        location {
          latitude
          longitude
          city
          country
        }
      }
    }
  }

  query GetStreams(
    $cursor: String
    $pageSize: Int
    $orderDirection: OrderDirection
    $orderBy: StreamOrderBy
    $owner: String
    $searchTerm: String
    $ids: [String!]
  ) {
    streams(
      cursor: $cursor
      pageSize: $pageSize
      orderDirection: $orderDirection
      orderBy: $orderBy
      owner: $owner
      searchTerm: $searchTerm
      ids: $ids
    ) {
      cursor
      items {
        id
        description
        peerCount
        messagesPerSecond
        publisherCount
        subscriberCount
      }
    }
  }

  query GetNeighbors(
    $cursor: String
    $pageSize: Int
    $streamPart: String
    $node: String
    $streamId: String
  ) {
    neighbors(
      cursor: $cursor
      pageSize: $pageSize
      streamPart: $streamPart
      node: $node
      stream: $streamId
    ) {
      items {
        streamPartId
        nodeId1
        nodeId2
        rtt
      }
      cursor
    }
  }
`
