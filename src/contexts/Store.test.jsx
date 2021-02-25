import React from 'react'
import { render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { Provider as StoreProvider, useStore } from './Store'

let container

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  document.body.removeChild(container)
  container = null
})

describe('Store', () => {
  describe('nodes', () => {
    it('returns nodes', () => {
      let store

      function Test() {
        store = useStore()

        return null
      }

      render((
        <StoreProvider>
          <Test />
        </StoreProvider>
      ), container)

      act(() => {
        store.addNodes([{
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

      expect(store.nodes).toStrictEqual([{
        id: '1',
        title: 'Node 1',
      }, {
        id: '2',
        title: 'Node 2',
      }, {
        id: '3',
        title: 'Node 3',
      }])
      expect(store.visibleNodes).toStrictEqual([])
      expect(store.activeNode).toStrictEqual(undefined)
    })

    it('returns the active node', () => {
      let store

      function Test() {
        store = useStore()

        return null
      }

      render((
        <StoreProvider>
          <Test />
        </StoreProvider>
      ), container)

      act(() => {
        store.addNodes([{
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

      expect(store.activeNode).toStrictEqual(undefined)

      act(() => {
        store.setActiveNodeId('2')
      })

      expect(store.visibleNodes).toStrictEqual([])
      expect(store.activeNode).toStrictEqual({
        id: '2',
        title: 'Node 2',
      })
    })

    it('returns visible nodes when topology is set', () => {
      let store

      function Test() {
        store = useStore()

        return null
      }

      render((
        <StoreProvider>
          <Test />
        </StoreProvider>
      ), container)

      act(() => {
        store.addNodes([{
          id: 'node1',
          title: 'Node 1',
        }, {
          id: 'node2',
          title: 'Node 2',
        }, {
          id: 'node3',
          title: 'Node 3',
        }, {
          id: 'node4',
          title: 'Node 4',
        }])
      })

      expect(store.visibleNodes).toStrictEqual([])

      act(() => {
        store.setTopology({
          'node1': {
            'node3': 1,
            'node4': 2,
          },
          'node3': {
            'node1': 1,
          },
          'node4': {
            'node1': 3,
          },
        })
      })

      expect(store.topology).toStrictEqual({
        'node1': ['node3', 'node4'],
        'node3': ['node1'],
        'node4': ['node1'],
      })
      expect(store.latencies).toStrictEqual({
        'node1': {
          'node3': 1,
          'node4': 2,
        },
        'node3': {
          'node1': 1,
        },
        'node4': {
          'node1': 3,
        },
      })
      expect(store.visibleNodes).toStrictEqual([{
        id: 'node1',
        title: 'Node 1',
      }, {
        id: 'node3',
        title: 'Node 3',
      }, {
        id: 'node4',
        title: 'Node 4',
      }])
      expect(store.activeNode).toStrictEqual(undefined)
    })
  })

  describe('streams', () => {
    it('returns active stream', () => {
      let store

      function Test() {
        store = useStore()

        return null
      }

      render((
        <StoreProvider>
          <Test />
        </StoreProvider>
      ), container)

      expect(store.stream).toStrictEqual(undefined)

      act(() => {
        store.setStream({
          id: '0x123/test/stream',
          description: 'My test stream',
        })
      })

      expect(store.stream).toStrictEqual({
        id: '0x123/test/stream',
        description: 'My test stream',
      })
    })

    it('resets active stream', () => {
      let store

      function Test() {
        store = useStore()

        return null
      }

      render((
        <StoreProvider>
          <Test />
        </StoreProvider>
      ), container)

      act(() => {
        store.setStream({
          id: '0x123/test/stream',
          description: 'My test stream',
        })
      })

      expect(store.stream).toStrictEqual({
        id: '0x123/test/stream',
        description: 'My test stream',
      })

      act(() => {
        store.setStream(undefined)
      })

      expect(store.stream).toStrictEqual(undefined)
    })
  })
})
