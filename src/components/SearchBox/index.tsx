import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useStore as useStoreOld } from '../../hooks/useStore'
import { ActiveRoute, ActiveView } from '../../types'
import { useIsSearching, useSearch } from '../../utils'
import { NetworkStats } from '../NetworkStats'
import { StreamStats } from '../StreamStats'
import { NoSearchResults } from './NoSearchResults'
import { Search, SlideHandle } from './Search'
import { SearchInput } from './SearchInput'
import { SearchResults } from './SearchResults'
import { useStore } from '../../contexts/Store'
import { useNavigate } from 'react-router-dom'

export function SearchBox() {
  const { activeRoute, activeView, setActiveView, env } = useStoreOld()

  const isStreamLoading = false

  const [phrase, setPhrase] = useState('')

  const { selectedNode } = useStore()

  const selectedNodeId = selectedNode?.id || null

  const searchMode = selectedNodeId === phrase ? 'node' : undefined

  const finalPhrase = searchMode === 'node' ? '' : phrase

  const isSearchPending = useIsSearching(finalPhrase)

  const searchResults = useSearch({ phrase: finalPhrase })

  const searchRef = useRef<HTMLDivElement>(null)

  const hasStream = !!(activeRoute === ActiveRoute.Stream)

  const isDisabled = hasStream && !!isStreamLoading

  useEffect(
    function setSelectedNodeIdAsPhrase() {
      setPhrase(selectedNodeId || '')
    },
    [selectedNodeId],
  )

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

  const navigate = useNavigate()

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
          onChange={(e) => {
            setPhrase(e.target.value)
          }}
          onClearButtonClick={() => {
            if (phrase === selectedNodeId) {
              navigate('/')
            } else {
              setPhrase('')
            }
          }}
          onFocus={() => {
            setActiveView(ActiveView.List)
          }}
        />
        {/* <StreamStats /> */}
        <NetworkStats />
        {searchResults.length > 0 && <SearchResults results={searchResults} highlight={phrase} />}
      </Search>
      {phrase.length > 0 &&
        !isSearchPending &&
        searchResults.length === 0 &&
        searchMode !== 'node' && <NoSearchResults search={phrase} />}
    </>
  )
}
