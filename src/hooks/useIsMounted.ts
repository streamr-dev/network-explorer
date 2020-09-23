import { useEffect, useRef, useCallback } from 'react'

export const useIsMountedRef = () => {
  const ref = useRef<boolean>(true)

  useEffect(() => () => {
    ref.current = false
  }, [])

  return ref
}

export const useIsMounted = (): (() => boolean) => {
  const isMountedRef = useIsMountedRef()
  return useCallback(() => !!isMountedRef.current, [isMountedRef])
}
