import { useEffect, useRef, useCallback } from 'react'

const useIsMounted = (): (() => boolean) => {
  const ref = useRef(true)

  useEffect(
    () => () => {
      ref.current = false
    },
    [],
  )

  return useCallback(() => ref.current, [])
}

export default useIsMounted
