import uniqBy from 'lodash/uniqBy'

import { get } from '../request'
import getConfig from '../config'

type SearchStreams = {
  search?: string,
}

export type SearchResult = {
  type: 'streams' | 'nodes' | 'locations',
  id: string,
  name: string,
  description?: string,
  longitude?: number,
  latitude?: number,
}

export const searchStreams = async ({ search = '' }: SearchStreams = {}): Promise<SearchResult[]> => {
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
    .map(({ id, description }: Stream) => ({
      type: 'streams',
      id,
      name: id,
      description,
    }))
}

type GetStream = {
  id: string,
}

export type Stream = {
  id: string,
  name: string,
  description: string,
}

type GetStreams = {
  params?: Object,
}

export const getStreams = async ({ params }: GetStreams = {}) => {
  const { http } = getConfig().streamr

  return get<Stream[]>({
    url: `${http}/streams`,
    options: {
      params,
    },
  })
}

export const getStream = async ({ id }: GetStream) => {
  const { http } = getConfig().streamr

  return get<Stream>({
    url: `${http}/streams/${encodeURIComponent(id)}/validation`,
  })
}
