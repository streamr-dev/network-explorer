import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActiveRoute, ActiveView } from '../../types'
import { NetworkStats } from '../NetworkStats'
import { StreamStats } from '../StreamStats'
import { NoSearchResults } from './NoSearchResults'
import { Search, SlideHandle } from './Search'
import { SearchInput } from './SearchInput'
import { SearchResults } from './SearchResults'
import { useSearch } from '../../utils'
import { useStore } from '../../hooks/useStore'

function focusLocation(..._: any[]) {}

export function SearchBox() {
  const { streamId, activeNode, activeRoute, activeView, setActiveView, env } = useStore()

  const isStreamLoading = false

  const isSearchPending = false

  const [phrase, setPhrase] = useState('')

  const searchResults = useSearch({ phrase })

  const searchRef = useRef<HTMLDivElement>(null)

  const navigate = useNavigate()

  const hasStream = !!(activeRoute === ActiveRoute.Stream)

  const isDisabled = hasStream && !!isStreamLoading

  const isNodeSelected = activeNode && phrase === activeNode.title

  const { id: activeNodeId } = activeNode || {}

  const defaultSearchValue: string = useMemo(() => {
    if (activeRoute === ActiveRoute.Stream) {
      return streamId || ''
    }

    return activeNodeId || ''
  }, [activeRoute, streamId, activeNodeId])

  useEffect(() => {
    if (activeView !== ActiveView.List || !searchRef.current) {
      return undefined
    }

    const onMouseDown = (e: MouseEvent) => {
      const { current: el } = searchRef

      if (!el) {
        return
      }

      if (!el.contains(e.target as Element)) {
        setActiveView(ActiveView.Map)
      }
    }

    window.addEventListener('mousedown', onMouseDown)

    return () => {
      window.removeEventListener('mousedown', onMouseDown)
    }
  }, [activeView, setActiveView])

  return (
    <>
      <Search
        theme={{
          activeView,
          resultsActive: searchResults.length > 0,
          hasStats: true,
        }}
        key={env}
        ref={searchRef}
      >
        <SlideHandle />
        <SearchInput
          value={phrase}
          defaultValue={defaultSearchValue}
          onChange={setPhrase}
          onClear={() => {
            setPhrase('')
          }}
          disabled={!!isDisabled}
          onFocus={() => {
            setActiveView(ActiveView.List)

            // For mobile Safari 14 this scrollTo(0, 0) is needed to make input element
            // visible on screen. This has something to do with Safari calculating
            // element position at focus time but since we animate that position, it's
            // not correct after animation without this.
            setTimeout(() => {
              window.scrollTo(0, 0)
            }, 100)
          }}
        />
        {/* Show if there's a stream. */}
        <StreamStats />
        {/* Show if there's no stream */}
        <NetworkStats />
        {/* Show when there are search results */}
        <SearchResults results={[]} onClick={() => {}} highlight={phrase} />
      </Search>
      {/* Show when: the search results are empty, search phrase isn't, … */}
      {!isSearchPending && !isNodeSelected && <NoSearchResults search={phrase} />}
    </>
  )
}
