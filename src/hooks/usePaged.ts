import { useCallback, useMemo, useState } from 'react'

export default function usePaged<T>({ items, limit }: { items: T[]; limit: number }): {
  currentPage: number
  setPage: Function
  items: Array<T>
  pages: number
} {
  const [currentPage, setCurrentPage] = useState(1)

  const pages = useMemo(() => Math.ceil(items.length / limit), [items, limit])

  const filteredItems = useMemo(() => {
    const offset = (currentPage - 1) * limit

    return items.slice(offset, offset + limit)
  }, [items, currentPage, limit])

  const setPage = useCallback(
    (value: number) => {
      setCurrentPage(Math.max(1, Math.min(pages, value)))
    },
    [pages],
  )

  return useMemo(
    () => ({
      currentPage,
      setPage,
      items: filteredItems,
      pages,
    }),
    [currentPage, setPage, filteredItems, pages],
  )
}
