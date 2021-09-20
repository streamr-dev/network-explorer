import { CancelToken } from 'axios'

import { get } from '../request'
import getConfig from '../config'

type SearchStreams = {
  search?: string
  cancelToken?: CancelToken
}

export type SearchResult = {
  type: 'streams' | 'nodes' | 'locations'
  id: string
  name: string
  description?: string
  longitude?: number
  latitude?: number
}

export const searchStreams = async ({
  search = '',
  cancelToken,
}: SearchStreams = {}): Promise<SearchResult[]> => {
  const params = {
    public: true,
    search: (search || '').trim().toLowerCase(),
  }

  const results = await getStreams({ params, cancelToken })

  return (results || []).map(({ id, description }: Stream) => ({
    type: 'streams',
    id,
    name: id,
    description,
  }))
}

type GetStream = {
  id: string
  cancelToken?: CancelToken
}

export type Stream = {
  id: string
  name: string
  description: string
}

type GetStreams = {
  params?: Object
  cancelToken?: CancelToken
}

export const getStreams = async ({ params, cancelToken }: GetStreams = {}) => {
  const { http } = getConfig().streamr

  return get<Stream[]>({
    url: `${http}/streams`,
    options: {
      params,
      cancelToken,
    },
  })
}

export const getStream = async ({ id, cancelToken }: GetStream) => {
  const { http } = getConfig().streamr

  return get<Stream>({
    url: `${http}/streams/${encodeURIComponent(id)}/validation`,
    options: {
      cancelToken,
    },
  })
}
