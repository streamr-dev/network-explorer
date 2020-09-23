import { get } from '../request'

const API_URL = 'https://staging.streamr.com/api/v1'

type SearchStreams = {
  search?: string,
}

export type SearchResult = {
  type: 'streams' | 'nodes' | 'locations',
  id: string,
  name: string,
}

const fakeResults: SearchResult[] = [{
  id: '7wa7APtlTq6EC5iTCBy6dw',
  type: 'streams',
  name: 'Helsinki Trams',
}, {
  id: '7rn4Cav8R3uudiwEltwqdQ',
  type: 'streams',
  name: 'Twitter Firehose Sample',
}]

export const searchStreams = ({ search = '' }: SearchStreams): Promise<SearchResult[]> => {
  /* const searchParams = {
    uiChannel: false,
    operation: 'STREAM_GET',
    search,
  }

  return get({
    url: `${API_URL}/streams`,
    data: {
      ...searchParams,
    },
  }) */

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(fakeResults)
    }, 250)
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
