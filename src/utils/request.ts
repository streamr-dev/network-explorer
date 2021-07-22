// @flow

import axios from 'axios'
import merge from 'lodash/merge'

type Data = {
  data: unknown
}

type Request = {
  url: string
  options?: Object
  method?: 'get' | 'post' | 'put' | 'delete'
  data?: Object | null
}

export default function request<T>({
  url,
  options = {},
  method = 'get',
  data = null,
}: Request): Promise<T> {
  const defaultOptions = {
    headers: {},
  }

  if (data !== null) {
    defaultOptions.headers = {
      ...defaultOptions.headers,
      'Content-Type': 'application/json',
    }
  }

  // Merge options with defaults
  const requestOptions = merge(defaultOptions, options)

  return axios
    .request<T>({
    ...requestOptions,
    url,
    method,
    data,
  })
    .then((response) => {
      // `response` is of type `AxiosResponse<ServerData>`
      const { data: result } = response
      return result
    })
    .catch((error) => {
      throw error
    })
}

export const get = <T>(args: Request) =>
  request<T>({
    ...args,
    method: 'get',
  })
