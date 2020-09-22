import { get } from '../request'

const API_URL = 'https://staging.streamr.com/api/v1'

type SearchStreams = {
  search?: string,
}

export const searchStreams = ({ search = '' }: SearchStreams) => {
  const searchParams = {
    uiChannel: false,
    operation: 'STREAM_SHARE',
    search,
  }

  return get({
    url: `${API_URL}/streams`,
    data: {
      ...searchParams,
    },
  })
}

type GetStream = {
  id: string,
}

export type Stream = {
  id: string,
  name: string,
}

export const getStream = ({ id }: GetStream) => get<Stream>({
  url: `${API_URL}/streams/${id}`,
})
