import React, { useMemo } from 'react'
import escapeRegExp from 'lodash/escapeRegExp'

type Props = {
  children: React.ReactNode,
  search?: string,
}

const Highlight = ({ search: originalSearch, children: text, ...props }: Props) => {
  const displayText = useMemo(() => {
    const search = (originalSearch || '').trim()

    if (!search) {
      return text
    }

    const regex = new RegExp(`(${escapeRegExp(search)})`, 'gi')
    const parts = String(text).split(regex)

    return parts.filter(Boolean).map((part, index) => (
      // eslint-disable-next-line react/no-array-index-key
      regex.test(part) ? <mark key={index}>{part}</mark> : part
    ))
  }, [originalSearch, text])

  return displayText ? (<>{displayText}</>) : null
}

export default Highlight
