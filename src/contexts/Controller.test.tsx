import React from 'react'
import { render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { Provider as PendingProvider } from './Pending'
import { Provider as StoreProvider, useStore } from './Store'
import { Provider as ControllerProvider, useController } from './Controller'
import * as streamrApi from '../utils/api/streamr'
import * as mapApi from '../utils/api/mapbox'
import * as trackerApi from '../utils/api/tracker'

jest.mock('../utils/api/streamr')
jest.mock('../utils/api/mapbox')
jest.mock('../utils/api/tracker')

let container

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  document.body.removeChild(container)
  container = null
})

describe('Controller', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  describe('loadTrackers', () => {
    it('loads trackers and nodes', async () => {
      let store
      let controller

      function Test() {
        store = useStore()
        controller = useController()

        return null
      }

      render(
        <PendingProvider>
          <StoreProvider>
            <ControllerProvider>
              <Test />
            </ControllerProvider>
          </StoreProvider>
        </PendingProvider>,
        container,
      )

      expect(store.trackers).toStrictEqual([])
      expect(store.nodes).toStrictEqual([])

      const getTrackersMock = jest.fn().mockResolvedValue([
        'tracker1',
        'tracker2',
      ])
      const getNodesMock = jest.fn()
        .mockResolvedValueOnce([{
          id: '1',
        }, {
          id: '2',
        }])
        .mockResolvedValueOnce([{
          id: '3',
        }])

      jest.spyOn(trackerApi, 'getTrackers').mockImplementation(getTrackersMock)
      jest.spyOn(trackerApi, 'getNodes').mockImplementation(getNodesMock)

      let result
      await act(async () => {
        result = await controller.loadTrackers()
      })

      expect(result.trackers).toStrictEqual([
        'tracker1',
        'tracker2',
      ])
      expect(result.nodes).toStrictEqual([{
        id: '1',
      }, {
        id: '2',
      }, {
        id: '3',
      }])
      expect(getNodesMock.mock.calls[0][0]).toBe('tracker1')
      expect(getNodesMock.mock.calls[1][0]).toBe('tracker2')
    })
  })

  describe('loadTopology', () => {
    it('loads topology and tracker nodes by default', async () => {
      let store
      let controller

      function Test() {
        store = useStore()
        controller = useController()

        return null
      }

      render(
        <PendingProvider>
          <StoreProvider>
            <ControllerProvider>
              <Test />
            </ControllerProvider>
          </StoreProvider>
        </PendingProvider>,
        container,
      )

      expect(store.topology).toStrictEqual({})
      expect(store.visibleNodes).toStrictEqual([])

      const nextNodes = [{
        id: '1',
        title: 'Node 1',
      },
      {
        id: '2',
        title: 'Node 2',
      },
      {
        id: '3',
        title: 'Node 3',
      },
      {
        id: '4',
        title: 'Node 4',
      }]
      const getTopologyMock = jest.fn()
      const getTrackersMock = jest.fn().mockResolvedValue([
        'tracker1',
      ])
      const getNodesMock = jest.fn().mockResolvedValue(nextNodes)

      jest.spyOn(trackerApi, 'getTrackers').mockImplementation(getTrackersMock)
      jest.spyOn(trackerApi, 'getNodes').mockImplementation(getNodesMock)

      await act(async () => {
        await controller.loadTopology()
      })

      expect(getTopologyMock).not.toBeCalled()
      expect(store.topology).toStrictEqual({
        '1': [],
        '2': [],
        '3': [],
        '4': [],
      })
      expect(store.latencies).toStrictEqual({
        '1': {},
        '2': {},
        '3': {},
        '4': {},
      })
      expect(store.visibleNodes).toStrictEqual(nextNodes)
    })

    it('loads topology for a stream', async () => {
      let store
      let controller

      function Test() {
        store = useStore()
        controller = useController()

        return null
      }

      render(
        <PendingProvider>
          <StoreProvider>
            <ControllerProvider>
              <Test />
            </ControllerProvider>
          </StoreProvider>
        </PendingProvider>,
        container,
      )

      expect(store.topology).toStrictEqual({})
      expect(store.visibleNodes).toStrictEqual([])

      const nextNodes = [
        {
          id: '1',
          title: 'Node 1',
        },
        {
          id: '2',
          title: 'Node 2',
        },
        {
          id: '3',
          title: 'Node 3',
        },
        {
          id: '4',
          title: 'Node 4',
        },
      ]

      const getTrackersMock = jest.fn().mockResolvedValue([
        'tracker1',
      ])
      const getNodesMock = jest.fn().mockResolvedValue(nextNodes)
      const getNodeConnectionsMock = jest.fn()
      const getTopologyMock = jest.fn().mockResolvedValue({
        '1': {
          '3': 1,
        },
        '2': {
          '3': 6,
        },
        '3': {
          '1': 7,
          '2': 4,
        },
      })
      jest.spyOn(trackerApi, 'getTrackers').mockImplementation(getTrackersMock)
      jest.spyOn(trackerApi, 'getNodes').mockImplementation(getNodesMock)
      jest.spyOn(trackerApi, 'getNodeConnections').mockImplementation(getNodeConnectionsMock)
      jest.spyOn(trackerApi, 'getTopology').mockImplementation(getTopologyMock)

      await act(async () => {
        await controller.loadTopology({
          streamId: 'streamr.eth/stream-id',
        })
      })

      expect(getNodeConnectionsMock).not.toBeCalled()
      expect(getTopologyMock).toBeCalledWith({
        id: 'streamr.eth/stream-id',
      })
      expect(store.topology).toStrictEqual({
        '1': ['3'],
        '2': ['3'],
        '3': ['1', '2'],
      })
      expect(store.latencies).toStrictEqual({
        '1': {
          '3': 1,
        },
        '2': {
          '3': 6,
        },
        '3': {
          '1': 7,
          '2': 4,
        },
      })
      expect(store.visibleNodes).toStrictEqual([
        {
          id: '1',
          title: 'Node 1',
        },
        {
          id: '2',
          title: 'Node 2',
        },
        {
          id: '3',
          title: 'Node 3',
        },
      ])
    })

    it('it does not reload trackers if topology does not change', async () => {
      let store
      let controller

      function Test() {
        store = useStore()
        controller = useController()

        return null
      }

      render(
        <PendingProvider>
          <StoreProvider>
            <ControllerProvider>
              <Test />
            </ControllerProvider>
          </StoreProvider>
        </PendingProvider>,
        container,
      )

      expect(store.topology).toStrictEqual({})
      expect(store.visibleNodes).toStrictEqual([])

      const nextNodes = [{
        id: '1',
        title: 'Node 1',
      },
      {
        id: '2',
        title: 'Node 2',
      },
      {
        id: '3',
        title: 'Node 3',
      },
      {
        id: '4',
        title: 'Node 4',
      }]
      const getTopologyMock = jest.fn().mockResolvedValue({
        '1': {
          '3': 5,
          '4': 1,
        },
        '2': {},
        '3': {
          '1': 9,
        },
        '4': {
          '1': 4,
        },
      })
      const getTrackersMock = jest.fn().mockResolvedValue([
        'tracker1',
      ])
      const getNodesMock = jest.fn().mockResolvedValue(nextNodes)

      jest.spyOn(trackerApi, 'getTrackers').mockImplementation(getTrackersMock)
      jest.spyOn(trackerApi, 'getNodes').mockImplementation(getNodesMock)
      jest.spyOn(trackerApi, 'getTopology').mockImplementation(getTopologyMock)

      await act(async () => {
        await controller.loadTopology({
          streamId: '1',
        })
      })

      await act(async () => {
        await controller.loadTopology({
          streamId: '1',
        })
      })

      expect(getTrackersMock).toBeCalledTimes(1)
      expect(store.topology).toStrictEqual({
        '1': ['3', '4'],
        '2': [],
        '3': ['1'],
        '4': ['1'],
      })
      expect(store.latencies).toStrictEqual({
        '1': {
          '3': 5,
          '4': 1,
        },
        '2': {},
        '3': {
          '1': 9,
        },
        '4': {
          '1': 4,
        },
      })
      expect(store.visibleNodes).toStrictEqual(nextNodes)
    })

    it('it reloads trackers if topology changes', async () => {
      let store
      let controller

      function Test() {
        store = useStore()
        controller = useController()

        return null
      }

      render(
        <PendingProvider>
          <StoreProvider>
            <ControllerProvider>
              <Test />
            </ControllerProvider>
          </StoreProvider>
        </PendingProvider>,
        container,
      )

      expect(store.topology).toStrictEqual({})
      expect(store.visibleNodes).toStrictEqual([])

      const nodes1 = [{
        id: '1',
        title: 'Node 1',
      },
      {
        id: '2',
        title: 'Node 2',
      },
      {
        id: '3',
        title: 'Node 3',
      }]
      const nodes2 = [{
        id: '1',
        title: 'Node 1',
      },
      {
        id: '2',
        title: 'Node 2',
      },
      {
        id: '3',
        title: 'Node 3',
      },
      {
        id: '4',
        title: 'Node 4',
      }]
      const getTopologyMock = jest.fn()
        .mockResolvedValueOnce({
          '1': {
            '3': 5,
            '2': 1,
          },
          '2': {},
          '3': {
            '1': 9,
          },
        })
        .mockResolvedValueOnce({
          '1': {
            '3': 5,
            '4': 1,
          },
          '2': {},
          '3': {
            '1': 9,
          },
          '4': {
            '1': 4,
          },
        })
      const getTrackersMock = jest.fn().mockResolvedValue([
        'tracker1',
      ])
      const getNodesMock = jest.fn()
        .mockResolvedValueOnce(nodes1)
        .mockResolvedValueOnce(nodes2)

      jest.spyOn(trackerApi, 'getTrackers').mockImplementation(getTrackersMock)
      jest.spyOn(trackerApi, 'getNodes').mockImplementation(getNodesMock)
      jest.spyOn(trackerApi, 'getTopology').mockImplementation(getTopologyMock)

      await act(async () => {
        await controller.loadTopology({
          streamId: '1',
        })
      })

      expect(getTopologyMock).toBeCalledTimes(1)
      expect(store.topology).toStrictEqual({
        '1': ['2', '3'],
        '2': [],
        '3': ['1'],
      })
      expect(store.latencies).toStrictEqual({
        '1': {
          '2': 1,
          '3': 5,
        },
        '2': {},
        '3': {
          '1': 9,
        },
      })
      expect(store.visibleNodes).toStrictEqual(nodes1)

      await act(async () => {
        await controller.loadTopology({
          streamId: '1',
        })
      })

      expect(getTopologyMock).toBeCalledTimes(2)
      expect(store.topology).toStrictEqual({
        '1': ['3', '4'],
        '2': [],
        '3': ['1'],
        '4': ['1'],
      })
      expect(store.latencies).toStrictEqual({
        '1': {
          '3': 5,
          '4': 1,
        },
        '2': {},
        '3': {
          '1': 9,
        },
        '4': {
          '1': 4,
        },
      })
      expect(store.visibleNodes).toStrictEqual(nodes2)
    })
  })

  describe('loadNodeLocations', () => {
    it('loads locations', async () => {
      let store
      let controller

      function Test() {
        store = useStore()
        controller = useController()

        return null
      }

      render(
        <PendingProvider>
          <StoreProvider>
            <ControllerProvider>
              <Test />
            </ControllerProvider>
          </StoreProvider>
        </PendingProvider>,
        container,
      )

      expect(store.visibleNodes).toStrictEqual([])

      const getReversedGeocodedLocationMock = jest.fn(({ longitude, latitude }) => Promise.resolve({
        region: `${longitude}-${latitude}`,
      }))
      jest.spyOn(mapApi, 'getReversedGeocodedLocation').mockImplementation(getReversedGeocodedLocationMock)

      const nodes = [{
        id: '1',
        location: {
          id: '1',
          latitude: '11',
          longitude: '22',
        },
      }, {
        id: '2',
        location: {
          id: '2',
          latitude: '33',
          longitude: '44',
        },
      }, {
        id: '3',
        location: {
          id: '3',
          latitude: '55',
          longitude: '66',
        },
      }]

      act(() => {
        store.setNodes(nodes)
        store.setTopology({
          latencies: {
            '1': {},
            '2': {},
            '3': {},
          },
        })
      })

      await act(async () => {
        await controller.loadNodeLocations(nodes)
      })

      expect(store.visibleNodes).toStrictEqual(nodes.map(({ id, location }) => ({
        id,
        location: {
          ...location,
          title: `${location.longitude}-${location.latitude}`,
          isReverseGeoCoded: true,
        },
      })))
    })
  })

  describe('search', () => {
    it('returns empty results by default', () => {
      let store

      function Test() {
        store = useStore()

        return null
      }

      render(
        <PendingProvider>
          <StoreProvider>
            <ControllerProvider>
              <Test />
            </ControllerProvider>
          </StoreProvider>
        </PendingProvider>,
        container,
      )

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

      jest.spyOn(streamrApi, 'searchStreams').mockResolvedValue([])
      jest.spyOn(mapApi, 'getLocations').mockResolvedValue([])

      render(
        <PendingProvider>
          <StoreProvider>
            <ControllerProvider>
              <Test />
            </ControllerProvider>
          </StoreProvider>
        </PendingProvider>,
        container,
      )

      act(() => {
        store.setNodes([
          {
            id: '1',
            title: 'Berlin',
          },
          {
            id: '2',
            title: 'Helsinki',
          },
          {
            id: '3',
            title: 'New York',
          },
        ])
      })

      await act(async () => {
        await controller.updateSearch({ search: 'new' })
        await new Promise((resolve) => setTimeout(resolve, 1000))
      })

      expect(store.search).toStrictEqual('new')
      expect(store.searchResults).toStrictEqual([
        {
          id: '3',
          description: '3',
          type: 'nodes',
          name: 'New York',
        },
      ])
    })

    it('searches from streams, appends results', async () => {
      let store
      let controller

      function Test() {
        controller = useController()
        store = useStore()

        return null
      }

      const streamSearchMock = jest.fn(() =>
        Promise.resolve([
          {
            id: '2',
            name: 'Stream',
            type: 'streams',
            description: 'My Stream',
          },
        ]),
      )
      jest.spyOn(streamrApi, 'searchStreams').mockImplementation(streamSearchMock)
      jest.spyOn(mapApi, 'getLocations').mockResolvedValue([])

      render(
        <PendingProvider>
          <StoreProvider>
            <ControllerProvider>
              <Test />
            </ControllerProvider>
          </StoreProvider>
        </PendingProvider>,
        container,
      )

      act(() => {
        store.setNodes([
          {
            id: '1',
            title: 'Berlin',
          },
        ])
      })

      await act(async () => {
        await controller.updateSearch({ search: 'berlin' })
        await new Promise((resolve) => setTimeout(resolve, 1000))
      })

      expect(store.search).toStrictEqual('berlin')
      expect(streamSearchMock.mock.calls[0][0].search).toBe('berlin')
      expect(store.searchResults).toStrictEqual([
        {
          id: '1',
          description: '1',
          type: 'nodes',
          name: 'Berlin',
        },
        {
          id: '2',
          name: 'Stream',
          type: 'streams',
          description: 'My Stream',
        },
      ])
    })

    it('searches from locations, appends results', async () => {
      let store
      let controller

      function Test() {
        controller = useController()
        store = useStore()

        return null
      }

      const getLocationsMock = jest.fn(() =>
        Promise.resolve([
          {
            id: 'places.abc123',
            name: 'Berlin',
            description: 'Berlin, Germany',
            type: 'locations',
          },
        ]),
      )
      jest.spyOn(mapApi, 'getLocations').mockImplementation(getLocationsMock)
      jest.spyOn(streamrApi, 'searchStreams').mockResolvedValue([])

      render(
        <PendingProvider>
          <StoreProvider>
            <ControllerProvider>
              <Test />
            </ControllerProvider>
          </StoreProvider>
        </PendingProvider>,
        container,
      )

      act(() => {
        store.setNodes([
          {
            id: '1',
            title: 'Berlin',
          },
        ])
      })

      await act(async () => {
        await controller.updateSearch({ search: 'berlin' })
        await new Promise((resolve) => setTimeout(resolve, 1000))
      })

      expect(store.search).toStrictEqual('berlin')
      expect(getLocationsMock.mock.calls[0][0].search).toBe('berlin')
      expect(store.searchResults).toStrictEqual([
        {
          id: '1',
          description: '1',
          type: 'nodes',
          name: 'Berlin',
        },
        {
          id: 'places.abc123',
          name: 'Berlin',
          description: 'Berlin, Germany',
          type: 'locations',
        },
      ])
    })
  })
})
