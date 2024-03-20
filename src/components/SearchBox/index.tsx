import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../contexts/Store'
import { useStore as useStoreOld } from '../../hooks/useStore'
import { ActiveView } from '../../types'
import { useIsSearching, useSearch } from '../../utils/search'
import { NetworkStats } from '../NetworkStats'
import { NoSearchResults } from './NoSearchResults'
import { Search, SlideHandle } from './Search'
import { SearchInput } from './SearchInput'
import { SearchResults } from './SearchResults'

export function SearchBox() {
  const { activeView, setActiveView, env } = useStoreOld()

  const [phrase, setPhrase] = useState('')

  const { selectedNode } = useStore()

  const selectedNodeId = selectedNode?.id || null

  const searchMode = selectedNodeId === phrase ? 'node' : undefined

  /**
   * For phrase equal to the selected node we don't
   * do the search.
   */
  const finalPhrase = searchMode === 'node' ? '' : phrase

  const isSearchPending = useIsSearching(finalPhrase)

  const searchResults = useSearch({ phrase: finalPhrase })

  const searchRef = useRef<HTMLDivElement>(null)

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
            }

            setPhrase('')
          }}
          onFocus={() => {
            setActiveView(ActiveView.List)
          }}
        />
        {/* <StreamStats /> */}
        <NetworkStats />
        {searchResults.length > 0 && (
          <SearchResults
            results={searchResults}
            highlight={phrase}
            onItemClick={(item) => {
              if (item.type !== 'node') {
                return
              }

              /**
               * If the user modified the phrase and the selected node got on the search
               * result list then clicking it won't change the URL and won't trigger the
               * effect calling `setSelectedNodeIdAsPhrase`. We have to set the phrase
               * manually to ensure things are in good order.
               */
              setPhrase(item.payload.id)
            }}
          />
        )}
      </Search>
      {finalPhrase.length > 0 && !isSearchPending && searchResults.length === 0 && (
        <NoSearchResults search={finalPhrase} />
      )}
    </>
  )
}
