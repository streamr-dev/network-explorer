import React from 'react'
import { render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { StreamrClient } from 'streamr-client'

import * as mapApi from '../../utils/api/mapbox'
import useSearch from './useSearch'

// Jest does not mock async generator functions so we need to add one
// for searchStreams
jest.mock('streamr-client', () => {
  const originalModule = jest.requireActual('streamr-client')

  return {
    __esModule: true,
    ...originalModule,
    StreamrClient: {
      ...originalModule.StreamrClient,
      searchStreams: jest.fn(() => 'mocked'),
    },
  }
})

jest.mock('streamr-client-react', () => {
  const originalModule = jest.requireActual('streamr-client-react')
  const originalClient = jest.requireMock('streamr-client')

  return {
    __esModule: true,
    ...originalModule,
    useClient: () => originalClient.StreamrClient,
  }
})

jest.mock('lodash/debounce', () => jest.fn((fn) => {
  // eslint-disable-next-line no-param-reassign
  fn.cancel = jest.fn()
  return fn
}))

describe('search', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('has empty results by default', () => {
    let search
    function Test() {
      search = useSearch()
      return null
    }

    render(<Test />)

    expect(search.results).toStrictEqual([])
  })

  it('does not call start & end methods on mount', () => {
    let search

    const startMock = jest.fn()
    const endMock = jest.fn()

    const streamsSpy = jest.spyOn(StreamrClient, 'searchStreams').mockReturnValue([])
    const placesSpy = jest.spyOn(mapApi, 'getLocations').mockResolvedValue([])

    function Test() {
      search = useSearch({
        onStart: startMock,
        onEnd: endMock,
      })
      return null
    }

    render(<Test />)

    expect(search.results).toStrictEqual([])
    expect(startMock).not.toHaveBeenCalled()
    expect(endMock).not.toHaveBeenCalled()
  })

  it('calls start & end methods if search updates', async () => {
    let search

    const startMock = jest.fn()
    const endMock = jest.fn()

    function Test({ str = '' }) {
      search = useSearch({
        search: str,
        onStart: startMock,
        onEnd: endMock,
      })
      return null
    }

    const { rerender } = render(<Test />)

    expect(search.results).toStrictEqual([])

    const streamsSpy = jest.spyOn(StreamrClient, 'searchStreams').mockReturnValue([])
    const placesSpy = jest.spyOn(mapApi, 'getLocations').mockResolvedValue([])

    await act(async () => {
      await rerender(
        <Test str="test" />,
      )
    })

    expect(startMock).toHaveBeenCalled()
    expect(endMock).toHaveBeenCalled()
  })

  it('searches from streams & maps', async () => {
    let search

    const startMock = jest.fn()
    const endMock = jest.fn()

    function Test({ str = '' }) {
      search = useSearch({
        search: str,
        onStart: startMock,
        onEnd: endMock,
      })
      return null
    }

    const { rerender } = render(<Test />)

    expect(search.results).toStrictEqual([])

    const streamsSpy = jest.spyOn(StreamrClient, 'searchStreams').mockReturnValue([{
      type: 'streams',
      id: 'stream-1',
      name: 'stream-1',
      description: 'stream-1',
    }])
    const placesSpy = jest.spyOn(mapApi, 'getLocations').mockResolvedValue([{
      type: 'locations',
      id: 'location-1',
      name: 'location-1',
      description: 'location-1',
      longitude: 24,
      latitude: 32,
    }])

    await act(async () => {
      await rerender(
        <Test str="test" />,
      )
    })

    expect(startMock).toHaveBeenCalled()
    expect(endMock).toHaveBeenCalled()
    expect(search.results).toStrictEqual([{
      type: 'locations',
      id: 'location-1',
      name: 'location-1',
      description: 'location-1',
      longitude: 24,
      latitude: 32,
    }, {
      type: 'streams',
      id: 'stream-1',
      name: 'stream-1',
      description: 'stream-1',
    }])
  })

  it('includes existing values in search results', async () => {
    let search

    const startMock = jest.fn()
    const endMock = jest.fn()
    const nodes = [{
      type: 'nodes',
      id: 'node-1',
      name: 'test node',
      description: 'test node desc',
      longitude: 31,
      latitude: 12,
    }, {
      type: 'nodes',
      id: 'node-2',
      name: 'some node',
      description: 'some node desc',
      longitude: 14,
      latitude: 56,
    }]

    function Test({ str = '' }) {
      search = useSearch({
        search: str,
        onStart: startMock,
        onEnd: endMock,
        existingResults: nodes,
      })
      return null
    }

    const { rerender } = render(<Test />)

    expect(search.results).toStrictEqual([])

    const streamsSpy = jest.spyOn(StreamrClient, 'searchStreams').mockReturnValue([{
      type: 'streams',
      id: 'stream-1',
      name: 'stream-1',
      description: 'stream-1',
    }])
    const placesSpy = jest.spyOn(mapApi, 'getLocations').mockResolvedValue([{
      type: 'locations',
      id: 'location-1',
      name: 'location-1',
      description: 'location-1',
      longitude: 24,
      latitude: 32,
    }])

    await act(async () => {
      await rerender(
        <Test str="test" />,
      )
    })

    expect(startMock).toHaveBeenCalled()
    expect(endMock).toHaveBeenCalled()
    expect(search.results).toStrictEqual([{
      type: 'nodes',
      id: 'node-1',
      name: 'test node',
      description: 'test node desc',
      longitude: 31,
      latitude: 12,
    }, {
      type: 'locations',
      id: 'location-1',
      name: 'location-1',
      description: 'location-1',
      longitude: 24,
      latitude: 32,
    }, {
      type: 'streams',
      id: 'stream-1',
      name: 'stream-1',
      description: 'stream-1',
    }])
  })

  it('can reset the search results', async () => {
    let search

    const startMock = jest.fn()
    const endMock = jest.fn()

    function Test({ str = '' }) {
      search = useSearch({
        search: str,
        onStart: startMock,
        onEnd: endMock,
      })
      return null
    }

    const { rerender } = render(<Test />)

    expect(search.results).toStrictEqual([])

    const streamsSpy = jest.spyOn(StreamrClient, 'searchStreams').mockReturnValue([{
      type: 'streams',
      id: 'stream-1',
      name: 'stream-1',
      description: 'stream-1',
    }])
    const placesSpy = jest.spyOn(mapApi, 'getLocations').mockResolvedValue([{
      type: 'locations',
      id: 'location-1',
      name: 'location-1',
      description: 'location-1',
      longitude: 24,
      latitude: 32,
    }])

    await act(async () => {
      await rerender(
        <Test str="test" />,
      )
    })

    expect(startMock).toHaveBeenCalled()
    expect(endMock).toHaveBeenCalled()
    expect(search.results).toStrictEqual([{
      type: 'locations',
      id: 'location-1',
      name: 'location-1',
      description: 'location-1',
      longitude: 24,
      latitude: 32,
    }, {
      type: 'streams',
      id: 'stream-1',
      name: 'stream-1',
      description: 'stream-1',
    }])

    act(() => {
      search.reset()
    })

    expect(search.results).toStrictEqual([])
  })
})
