import React from 'react'
import { render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import useSearch from './useSearch'

jest.mock('lodash/debounce', () => jest.fn((fn) => {
  // eslint-disable-next-line no-param-reassign
  fn.cancel = jest.fn()
  return fn
}))

describe('search', () => {
  it ('has empty results by default', () => {
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

    const { rerender, unmount } = render(<Test />)

    expect(search.results).toStrictEqual([])

    await act(async () => {
      await rerender(
        <Test str="test" />,
      )
    })

    await act(async () => {
      await unmount()
    })

    expect(startMock).toHaveBeenCalled()
    expect(endMock).toHaveBeenCalled()
  })
})
