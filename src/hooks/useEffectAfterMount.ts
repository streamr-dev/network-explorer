import { useRef, useEffect } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function useEffectAfterMount(effect: Function, dependencies: any[]) {
  const mounted = useRef(false)

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return undefined
    }

    const unmount = effect()

    return () => {
      if (typeof unmount === 'function') {
        unmount()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)
}
