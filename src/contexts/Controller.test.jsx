import React from 'react'
import { render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import * as trackerApi from '../utils/api/tracker'

import { Provider as ControllerProvider, useController } from './Controller'
import { Provider as StoreProvider, useStore } from './Store'
import { Provider as PendingProvider } from './Pending'

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
    trackerApi.getNodeConnections.mockClear()
    trackerApi.getTopology.mockClear()
  })

  describe('loadTopology', () => {
    it('loads connections for all nodes by default', async () => {
      let store
      let controller

      function Test() {
        store = useStore()
        controller = useController()

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

      expect(store.topology).toStrictEqual({})
      expect(store.visibleNodes).toStrictEqual([])

      const nextNodes = [{
        id: '1',
        title: 'Node 1',
      }, {
        id: '2',
        title: 'Node 2',
      }, {
        id: '3',
        title: 'Node 3',
      }, {
        id: '4',
        title: 'Node 4',
      }]

      act(() => {
        store.addNodes(nextNodes)
      })

      const nextTopology = {
        '1': ['3', '4'],
        '2': [],
        '3': ['1'],
        '4': ['1'],
      }

      const getNodeConnectionsMock = jest.fn().mockResolvedValue(nextTopology)
      const getTopologyMock = jest.fn()
      trackerApi.getNodeConnections.mockImplementation(getNodeConnectionsMock)
      trackerApi.getTopology.mockImplementation(getTopologyMock)

      await act(async () => {
        await controller.loadTopology()
      })

      expect(getNodeConnectionsMock).toBeCalled()
      expect(getTopologyMock).not.toBeCalled()
      expect(store.topology).toStrictEqual(nextTopology)
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

      render((
        <PendingProvider>
          <StoreProvider>
            <ControllerProvider>
              <Test />
            </ControllerProvider>
          </StoreProvider>
        </PendingProvider>
      ), container)

      expect(store.topology).toStrictEqual({})
      expect(store.visibleNodes).toStrictEqual([])

      const nextNodes = [{
        id: '1',
        title: 'Node 1',
      }, {
        id: '2',
        title: 'Node 2',
      }, {
        id: '3',
        title: 'Node 3',
      }, {
        id: '4',
        title: 'Node 4',
      }]

      act(() => {
        store.addNodes(nextNodes)
      })

      const nextTopology = {
        '1': ['3'],
        '2': ['3'],
        '3': ['1', '2'],
      }

      const getNodeConnectionsMock = jest.fn()
      const getTopologyMock = jest.fn().mockResolvedValue(nextTopology)
      trackerApi.getNodeConnections.mockImplementation(getNodeConnectionsMock)
      trackerApi.getTopology.mockImplementation(getTopologyMock)

      await act(async () => {
        await controller.loadTopology({
          streamId: 'streamr.eth/stream-id',
        })
      })

      expect(getNodeConnectionsMock).not.toBeCalled()
      expect(getTopologyMock).toBeCalledWith({
        id: 'streamr.eth/stream-id',
      })
      expect(store.topology).toStrictEqual(nextTopology)
      expect(store.visibleNodes).toStrictEqual([{
        id: '1',
        title: 'Node 1',
      }, {
        id: '2',
        title: 'Node 2',
      }, {
        id: '3',
        title: 'Node 3',
      }])
    })
  })
})
