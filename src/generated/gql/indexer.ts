import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Location = {
  __typename?: 'Location';
  city?: Maybe<Scalars['String']['output']>;
  country: Scalars['String']['output'];
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
};

export type Message = {
  __typename?: 'Message';
  /** JSON string if contentType is JSON, otherwise base64-encoded binary content */
  content: Scalars['String']['output'];
  contentType: Scalars['String']['output'];
};

export type Neighbor = {
  __typename?: 'Neighbor';
  nodeId1: Scalars['String']['output'];
  nodeId2: Scalars['String']['output'];
  rtt?: Maybe<Scalars['Int']['output']>;
  streamPartId: Scalars['String']['output'];
};

export type Neighbors = {
  __typename?: 'Neighbors';
  cursor?: Maybe<Scalars['String']['output']>;
  items: Array<Neighbor>;
};

export type Node = {
  __typename?: 'Node';
  id: Scalars['String']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Location>;
};

export type Nodes = {
  __typename?: 'Nodes';
  cursor?: Maybe<Scalars['String']['output']>;
  items: Array<Node>;
};

export enum OrderDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type Query = {
  __typename?: 'Query';
  neighbors: Neighbors;
  nodes: Nodes;
  sampleMessage?: Maybe<Message>;
  streams: Streams;
  summary: Summary;
};


export type QueryNeighborsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  node?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  stream?: InputMaybe<Scalars['String']['input']>;
  streamPart?: InputMaybe<Scalars['String']['input']>;
};


export type QueryNodesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  stream?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySampleMessageArgs = {
  stream: Scalars['String']['input'];
};


export type QueryStreamsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  orderBy?: InputMaybe<StreamOrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  owner?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};

export type Stream = {
  __typename?: 'Stream';
  bytesPerSecond: Scalars['Float']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  messagesPerSecond: Scalars['Float']['output'];
  peerCount: Scalars['Int']['output'];
  publisherCount?: Maybe<Scalars['Int']['output']>;
  subscriberCount?: Maybe<Scalars['Int']['output']>;
};

export enum StreamOrderBy {
  BytesPerSecond = 'BYTES_PER_SECOND',
  Description = 'DESCRIPTION',
  Id = 'ID',
  MessagesPerSecond = 'MESSAGES_PER_SECOND',
  PeerCount = 'PEER_COUNT',
  PublisherCount = 'PUBLISHER_COUNT',
  SubscriberCount = 'SUBSCRIBER_COUNT'
}

export type Streams = {
  __typename?: 'Streams';
  cursor?: Maybe<Scalars['String']['output']>;
  items: Array<Stream>;
};

export type Summary = {
  __typename?: 'Summary';
  bytesPerSecond: Scalars['Float']['output'];
  messagesPerSecond: Scalars['Float']['output'];
  nodeCount: Scalars['Int']['output'];
  streamCount: Scalars['Int']['output'];
};

export type GetNodesQueryVariables = Exact<{
  cursor?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  ids?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  streamId?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetNodesQuery = { __typename?: 'Query', nodes: { __typename?: 'Nodes', cursor?: string | null, items: Array<{ __typename?: 'Node', id: string, ipAddress?: string | null, location?: { __typename?: 'Location', latitude: number, longitude: number, city?: string | null, country: string } | null }> } };

export type GetStreamsQueryVariables = Exact<{
  cursor?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  orderDirection?: InputMaybe<OrderDirection>;
  orderBy?: InputMaybe<StreamOrderBy>;
  owner?: InputMaybe<Scalars['String']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  ids?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type GetStreamsQuery = { __typename?: 'Query', streams: { __typename?: 'Streams', cursor?: string | null, items: Array<{ __typename?: 'Stream', id: string, description?: string | null, peerCount: number, messagesPerSecond: number, publisherCount?: number | null, subscriberCount?: number | null }> } };

export type GetNeighborsQueryVariables = Exact<{
  cursor?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  streamPart?: InputMaybe<Scalars['String']['input']>;
  node?: InputMaybe<Scalars['String']['input']>;
  streamId?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetNeighborsQuery = { __typename?: 'Query', neighbors: { __typename?: 'Neighbors', cursor?: string | null, items: Array<{ __typename?: 'Neighbor', streamPartId: string, nodeId1: string, nodeId2: string, rtt?: number | null }> } };


export const GetNodesDocument = gql`
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
    `;
export type GetNodesQueryResult = Apollo.QueryResult<GetNodesQuery, GetNodesQueryVariables>;
export const GetStreamsDocument = gql`
    query GetStreams($cursor: String, $pageSize: Int, $orderDirection: OrderDirection, $orderBy: StreamOrderBy, $owner: String, $searchTerm: String, $ids: [String!]) {
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
    `;
export type GetStreamsQueryResult = Apollo.QueryResult<GetStreamsQuery, GetStreamsQueryVariables>;
export const GetNeighborsDocument = gql`
    query GetNeighbors($cursor: String, $pageSize: Int, $streamPart: String, $node: String, $streamId: String) {
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
    `;
export type GetNeighborsQueryResult = Apollo.QueryResult<GetNeighborsQuery, GetNeighborsQueryVariables>;