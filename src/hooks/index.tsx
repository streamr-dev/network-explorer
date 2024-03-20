import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

export function useGlobalKeyDownEffect(key: string | RegExp, fn: () => void) {
  const fnRef = useRef(fn)

  if (fnRef.current !== fn) {
    fnRef.current = fn
  }

  const keyRef = useRef(key)

  if (keyRef.current !== key) {
    keyRef.current = key
  }

  useEffect(
    function handleGlobalKeyDown() {
      function onKeyDown(e: KeyboardEvent) {
        if (/select|input|textarea/i.test((e.target as HTMLElement).tagName)) {
          return
        }

        const { current: k } = keyRef

        const match = typeof k === 'string' ? e.key === k : k.test(e.key)

        if (match) {
          fnRef.current()
        }
      }

      window.addEventListener('keydown', onKeyDown)

      return () => {
        window.removeEventListener('keydown', onKeyDown)
      }
    },
    [key],
  )
}

export function useLocationFromParams() {
  const location = useSearchParams()[0].get('l') || ''

  return useMemo(() => {
    const match = location.match(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(\d+)z$/i)

    if (!match) {
      return null
    }

    const [longitude, latitude, zoom] = match.slice(1, 4).map(Number)

    return {
      latitude,
      longitude,
      zoom,
    }
  }, [location])
}

interface UsePaginatedItemsOptions {
  pageSize?: number
  selectedId?: string
}

export function usePaginatedItems<T extends { id: string }>(
  items: T[],
  options: UsePaginatedItemsOptions = {},
) {
  const { pageSize = 10, selectedId = null } = options

  const [page, setPage] = useState(findPage(items, pageSize, selectedId) || 0)

  const totalPages = Math.ceil(items.length / pageSize)

  useEffect(
    function gotoSelectedId() {
      setPage(findPage(items, pageSize, selectedId) || 0)
    },
    [items, pageSize, selectedId],
  )

  return {
    totalPages,
    page,
    items: useMemo(
      () => items.slice(pageSize * page, pageSize * (page + 1)),
      [items, pageSize, page],
    ),
    setPage: useCallback(
      (value: number) => {
        setPage(Math.max(0, Math.min(totalPages - 1, value)))
      },
      [totalPages],
    ),
  }
}

function findPage<T extends { id: string }>(
  items: T[],
  pageSize: number,
  selectedId: string | null,
) {
  const index = selectedId !== null ? items.findIndex(({ id }) => id === selectedId) : -1

  if (index === -1) {
    return null
  }

  return Math.floor(index / pageSize)
}

export function useStreamIdParam() {
  const { streamId = null } = useParams<{ streamId: string }>()

  return streamId === null ? null : decodeURIComponent(streamId)
}
