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
        }])
      })

      expect(store.visibleNodes).toStrictEqual([])

      act(() => {
        store.setTopology({
          '1': ['3', '4'],
          '3': ['1'],
          '4': ['1'],
        })
      })

      expect(store.visibleNodes).toStrictEqual([{
        id: '1',
        title: 'Node 1',
      }, {
        id: '3',
        title: 'Node 3',
      }, {
        id: '4',
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
