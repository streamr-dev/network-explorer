import React from 'react'
import { render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import * as Store from '../../contexts/Store'
import * as streamrApi from '../../utils/api/streamr'
import * as mapApi from '../../utils/api/mapbox'

import useSearch from './useSearch'

jest.mock('../../contexts/Pending', () => ({
  usePending: () => ({
    start: jest.fn(),
    end: jest.fn(),
  }),
}))
jest.mock('../../contexts/Store')
jest.mock('../../utils/api/streamr')
jest.mock('../../utils/api/mapbox')

let container

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  document.body.removeChild(container)
  container = null
})

describe('useSearch', () => {
  afterEach(() => {
    Store.useStore.mockClear()
    streamrApi.searchStreams.mockClear()
    mapApi.getLocations.mockClear()
  })

  it('returns empty results by default', () => {
    let search
    function Test() {
      search = useSearch()

      return null
    }

    Store.useStore.mockReturnValue({
      nodes: [],
    })

    render(<Test />, container)

    expect(search.results).toStrictEqual([])
  })

  it('searches from nodes', async () => {
    let search
    function Test() {
      search = useSearch()

      return null
    }

    Store.useStore.mockReturnValue({
      nodes: [{
        id: '1',
        title: 'Berlin',
      }, {
        id: '2',
        title: 'Helsinki',
      }, {
        id: '3',
        title: 'New York',
      }],
    })
    streamrApi.searchStreams.mockResolvedValue([])
    mapApi.getLocations.mockResolvedValue([])

    render(<Test />, container)

    await act(async () => {
      await search.updateResults({ search: 'new' })
      await new Promise((resolve) => setTimeout(resolve, 500))
    })

    expect(search.results).toStrictEqual([{
      id: '3',
      description: '3',
      type: 'nodes',
      name: 'New York',
    }])
  })

  it('searches from streams, appends results', async () => {
    let search
    function Test() {
      search = useSearch()

      return null
    }

    Store.useStore.mockReturnValue({
      nodes: [{
        id: '1',
        title: 'Berlin',
      }],
    })
    const streamSearchMock = jest.fn(() => Promise.resolve([{
      id: '2',
      name: 'Stream',
      type: 'streams',
      description: 'My Stream',
    }]))
    streamrApi.searchStreams.mockImplementation(streamSearchMock)
    mapApi.getLocations.mockResolvedValue([])

    render(<Test />, container)

    await act(async () => {
      await search.updateResults({ search: 'berlin' })
      await new Promise((resolve) => setTimeout(resolve, 500))
    })

    expect(streamSearchMock).toBeCalledWith({
      search: 'berlin',
    })
    expect(search.results).toStrictEqual([{
      id: '1',
      description: '1',
      type: 'nodes',
      name: 'Berlin',
    }, {
      id: '2',
      name: 'Stream',
      type: 'streams',
      description: 'My Stream',
    }])
  })

  it('searches from locations, appends results', async () => {
    let search
    function Test() {
      search = useSearch()

      return null
    }

    Store.useStore.mockReturnValue({
      nodes: [{
        id: '1',
        title: 'Berlin',
      }],
    })
    const getLocationsMock = jest.fn(() => Promise.resolve([{
      id: 'places.abc123',
      name: 'Berlin',
      description: 'Berlin, Germany',
      type: 'locations',
    }]))
    mapApi.getLocations.mockImplementation(getLocationsMock)
    streamrApi.searchStreams.mockResolvedValue([])

    render(<Test />, container)

    await act(async () => {
      await search.updateResults({ search: 'berlin' })
      await new Promise((resolve) => setTimeout(resolve, 500))
    })

    expect(getLocationsMock).toBeCalledWith({
      search: 'berlin',
    })
    expect(search.results).toStrictEqual([{
      id: '1',
      description: '1',
      type: 'nodes',
      name: 'Berlin',
    }, {
      id: 'places.abc123',
      name: 'Berlin',
      description: 'Berlin, Germany',
      type: 'locations',
    }])
  })
})
