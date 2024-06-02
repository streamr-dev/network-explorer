import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMap as useProvidedMap } from 'react-map-gl'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useStore } from './Store'
import { MapId } from './consts'
import { ActiveView } from './types'
import { isFramed } from './utils'
import { getNodeLocationId, setNodeFeatureState } from './utils/map'

export function useGlobalKeyDownEffect(
  key: string | RegExp,
  fn: () => void,
  { preventDefault = false } = {},
) {
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

        if (match && preventDefault) {
          e.preventDefault()
        }
      }

      window.addEventListener('keydown', onKeyDown)

      return () => {
        window.removeEventListener('keydown', onKeyDown)
      }
    },
    [key, preventDefault],
  )
}

function useLocationFromParams() {
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

export function useNavigateToNodeCallback() {
  const navigate = useNavigate()

  const streamId = useStreamIdParam()

  const { setSearchPhrase, setActiveView } = useStore()

  return useCallback(
    (nodeId: string, { replace = false } = {}) => {
      const nodePath = nodeId ? `nodes/${encodeURIComponent(nodeId)}/` : ''

      navigate(
        {
          pathname: streamId
            ? `/streams/${encodeURIComponent(streamId)}/${nodePath}`
            : `/${nodePath}`,
          search: window.location.search,
        },
        {
          replace: isFramed() || replace,
        },
      )

      if (streamId) {
        setSearchPhrase(streamId)
      } else if (nodeId) {
        setSearchPhrase(nodeId)
      } else {
        setSearchPhrase('')
      }

      setActiveView(ActiveView.Map)
    },
    [navigate, streamId, setSearchPhrase, setActiveView],
  )
}

export function useMap() {
  return useProvidedMap()[MapId]
}

export function useSelectedNodeLocationEffect(
  onLocationUpdate: (location: [number, number]) => void,
) {
  const map = useMap()

  const { selectedNode, nodeIdParamKey } = useStore()

  const { longitude, latitude } = selectedNode?.location || {}

  const onLocationUpdateRef = useRef(onLocationUpdate)

  if (onLocationUpdateRef.current !== onLocationUpdate) {
    onLocationUpdateRef.current = onLocationUpdate
  }

  useEffect(
    function propagateLocationChange() {
      if (longitude != null && latitude != null) {
        onLocationUpdateRef.current([longitude, latitude])
      }
    },
    [longitude, latitude, nodeIdParamKey],
  )

  const selectedNodeLocationIdRef = useRef<string | null>(null)

  const { current: prevSelectedNodeLocationId } = selectedNodeLocationIdRef

  const selectedNodeLocationId = selectedNode ? getNodeLocationId(selectedNode.location) : undefined

  if (prevSelectedNodeLocationId !== selectedNodeLocationId) {
    if (prevSelectedNodeLocationId) {
      setNodeFeatureState(map?.getMap(), prevSelectedNodeLocationId, { active: false })
    }

    if (selectedNodeLocationId) {
      setNodeFeatureState(map?.getMap(), selectedNodeLocationId, { active: true })
    }

    selectedNodeLocationIdRef.current = selectedNodeLocationId || null
  }
}

interface LocationFromParams {
  longitude: number
  latitude: number
  zoom: number
}

export function useSelectedPlaceLocationEffect(
  onLocationUpdate: (location: LocationFromParams) => void,
) {
  const { longitude, latitude, zoom } = useLocationFromParams() || {}

  const { locationParamKey } = useStore()

  const onLocationUpdateRef = useRef(onLocationUpdate)

  if (onLocationUpdateRef.current !== onLocationUpdate) {
    onLocationUpdateRef.current = onLocationUpdate
  }

  useEffect(
    function propagatePlaceChange() {
      if (longitude != null && latitude != null && zoom != null) {
        onLocationUpdateRef.current({ longitude, latitude, zoom })
      }
    },
    [longitude, latitude, zoom, locationParamKey],
  )
}
