import { useEffect } from 'react'

const blacklistedTags = ['INPUT', 'TEXTAREA', 'SELECT']
type Bindings = Record<string, () => void>

export default (bindings: Bindings) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const targetHtmlElement = e.target as HTMLElement
      if (blacklistedTags.includes(targetHtmlElement.tagName)) {
        return
      }

      if (Object.prototype.hasOwnProperty.call(bindings, e.key)) {
        bindings[e.key]()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [bindings])
}
