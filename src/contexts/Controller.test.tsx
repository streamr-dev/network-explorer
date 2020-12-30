import React from 'react'
import { render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { Provider as PendingProvider } from './Pending'
import { Provider as StoreProvider, useStore } from './Store'
import { Provider as ControllerProvider, useController } from './Controller'
import * as streamrApi from '../utils/api/streamr'
import * as mapApi from '../utils/api/mapbox'

jest.mock('../utils/api/streamr')
jest.mock('../utils/api/mapbox')

let container

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  document.body.removeChild(container)
  container = null
})

describe('search', () => {
  afterEach(() => {
    streamrApi.searchStreams.mockClear()
    mapApi.getLocations.mockClear()
  })

  it('returns empty results by default', () => {
    let store

    function Test() {
      store = useStore()

      return null
    }

    render((
      <PendingProvider>
        <StoreProvider>
          <ControllerProvider>
            <Test />
          </ControllerProvider>
        </StoreProvider>
      </PendingProvider>
    ), container)

    expect(store.search).toStrictEqual('')
    expect(store.searchResults).toStrictEqual([])
  })

  it('searches from nodes', async () => {
    let store
    let controller

    function Test() {
      controller = useController()
      store = useStore()

      return null
    }

    streamrApi.searchStreams.mockResolvedValue([])
    mapApi.getLocations.mockResolvedValue([])

    render((
      <PendingProvider>
        <StoreProvider>
          <ControllerProvider>
            <Test />
          </ControllerProvider>
        </StoreProvider>
      </PendingProvider>
    ), container)

    act(() => {
      store.addNodes([{
        id: '1',
        title: 'Berlin',
      }, {
        id: '2',
        title: 'Helsinki',
      }, {
        id: '3',
        title: 'New York',
      }])
    })

    await act(async () => {
      await controller.updateSearch({ search: 'new' })
      await new Promise((resolve) => setTimeout(resolve, 500))
    })

    expect(store.search).toStrictEqual('new')
    expect(store.searchResults).toStrictEqual([{
      id: '3',
      description: '3',
      type: 'nodes',
      name: 'New York',
    }])
  })

  it('searches from streams, appends results', async () => {
    let store
    let controller

    function Test() {
      controller = useController()
      store = useStore()

      return null
    }

    const streamSearchMock = jest.fn(() => Promise.resolve([{
      id: '2',
      name: 'Stream',
      type: 'streams',
      description: 'My Stream',
    }]))
    streamrApi.searchStreams.mockImplementation(streamSearchMock)
    mapApi.getLocations.mockResolvedValue([])

    render((
      <PendingProvider>
        <StoreProvider>
          <ControllerProvider>
            <Test />
          </ControllerProvider>
        </StoreProvider>
      </PendingProvider>
    ), container)

    act(() => {
      store.addNodes([{
        id: '1',
        title: 'Berlin',
      }])
    })

    await act(async () => {
      await controller.updateSearch({ search: 'berlin' })
      await new Promise((resolve) => setTimeout(resolve, 500))
    })

    expect(store.search).toStrictEqual('berlin')
    expect(streamSearchMock).toBeCalledWith({
      search: 'berlin',
    })
    expect(store.searchResults).toStrictEqual([{
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
    let store
    let controller

    function Test() {
      controller = useController()
      store = useStore()

      return null
    }

    const getLocationsMock = jest.fn(() => Promise.resolve([{
      id: 'places.abc123',
      name: 'Berlin',
      description: 'Berlin, Germany',
      type: 'locations',
    }]))
    mapApi.getLocations.mockImplementation(getLocationsMock)
    streamrApi.searchStreams.mockResolvedValue([])

    render((
      <PendingProvider>
        <StoreProvider>
          <ControllerProvider>
            <Test />
          </ControllerProvider>
        </StoreProvider>
      </PendingProvider>
    ), container)

    act(() => {
      store.addNodes([{
        id: '1',
        title: 'Berlin',
      }])
    })

    await act(async () => {
      await controller.updateSearch({ search: 'berlin' })
      await new Promise((resolve) => setTimeout(resolve, 500))
    })

    expect(store.search).toStrictEqual('berlin')
    expect(getLocationsMock).toBeCalledWith({
      search: 'berlin',
    })
    expect(store.searchResults).toStrictEqual([{
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
