import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

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

  const match = location.match(/^(-?\d+(?=\.\d+)?),(-?\d+(?=\.\d+)?),(\d+)z$/)

  if (!match) {
    return null
  }

  const [longitude, latitude, zoom] = match.slice(1, 4).map(Number)

  return {
    latitude,
    longitude,
    zoom,
  }
}
