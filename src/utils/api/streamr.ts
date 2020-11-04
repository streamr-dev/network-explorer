import uniqBy from 'lodash/uniqBy'

import { get } from '../request'

const API_URL = process.env.REACT_APP_STREAMR_API_URL

type SearchStreams = {
  search?: string,
}

export type SearchResult = {
  type: 'streams' | 'nodes' | 'locations',
  id: string,
  name: string,
}

export const searchStreams = async ({ search = '' }: SearchStreams): Promise<SearchResult[]> => {
  const params = {
    public: true,
    search: (search || '').trim().toLowerCase(),
  }

  const [exactMatch, matchingStreams] = await Promise.all([
    // getStream with empty id responds with all streams :O
    search ? getStream({ id: search }).catch((err) => {
      if (err.response && err.response.status === 404) {
        // ignore 404, expected.
        return
      }
      throw err
    }) : Promise.resolve(undefined),
    getStreams({ params }),
  ])

  const results = uniqBy([
    ...(exactMatch ? [exactMatch] : []),
    ...(matchingStreams || []),
  ], 'id')

  return results
    .map(({ id }: Stream) => ({
      type: 'streams',
      id,
      name: id,
    }))
}

type GetStream = {
  id: string,
}

export type Stream = {
  id: string,
  name: string,
}

type GetStreams = {
  params?: Object,
}

export const getStreams = async ({ params }: GetStreams = {}) => get<Stream[]>({
  url: `${API_URL}/streams`,
  options: {
    params,
  },
})

export const getStream = async ({ id }: GetStream) => get<Stream>({
  url: `${API_URL}/streams/${encodeURIComponent(id)}/validation`,
})
