import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../Store'
import { useGlobalKeyDownEffect, useStreamIdParam } from '../../hooks'
import { ActiveView } from '../../types'
import { useIsSearching, useSearch } from '../../utils/search'
import { NetworkStats, StreamStats } from '../Stats'
import { NoSearchResults } from './NoSearchResults'
import { Search, SlideHandle } from './Search'
import { SearchInput } from './SearchInput'
import { SearchResults } from './SearchResults'

export function SearchBox() {
  const {
    selectedNode,
    activeView,
    setActiveView,
    searchPhrase,
    setSearchPhrase,
    displaySearchPhrase,
  } = useStore()

  const selectedNodeId = selectedNode?.id || null

  const streamId = useStreamIdParam()

  const hasSelection = searchPhrase === selectedNodeId || searchPhrase === streamId

  const finalPhrase = hasSelection ? '' : searchPhrase

  const isSearchPending = useIsSearching(finalPhrase)

  const searchResults = useSearch({ phrase: finalPhrase })

  const searchRef = useRef<HTMLDivElement>(null)

  const navigate = useNavigate()

  const inputRef = useRef<HTMLInputElement>(null)

  useGlobalKeyDownEffect(
    '/',
    () => {
      inputRef.current?.focus()
    },
    {
      preventDefault: true,
    },
  )

  useSetInitialSearchPhraseEffect()

  return (
    <>
      <Search
        theme={{
          activeView,
          resultsActive: searchResults.length > 0,
          hasStats: true,
        }}
        ref={searchRef}
      >
        <SlideHandle />
        <SearchInput
          inputRef={inputRef}
          value={searchPhrase}
          displayValue={displaySearchPhrase}
          onChange={(e) => {
            const { value } = e.target

            setSearchPhrase(value)

            if (streamId) {
              if (value !== streamId) {
                navigate({ pathname: '/', search: window.location.search })
              }
            } else if (selectedNodeId && value !== selectedNodeId) {
              navigate({ pathname: '/', search: window.location.search })
            }
          }}
          onClearButtonClick={() => {
            if (searchPhrase === selectedNodeId || searchPhrase === streamId) {
              navigate({ pathname: '/', search: window.location.search })
            }

            setSearchPhrase('')

            inputRef.current?.focus()
          }}
          onFocus={() => {
            setActiveView(ActiveView.List)
          }}
          onBlur={() => {
            setActiveView(ActiveView.Map)
          }}
          onKeyDown={(e) => {
            if (e.key !== 'Escape') {
              return
            }

            if (searchPhrase === '') {
              inputRef.current?.blur()

              return
            }

            setSearchPhrase('')
          }}
        />
        {streamId ? <StreamStats streamId={streamId} /> : <NetworkStats />}
        {searchResults.length > 0 && (
          <SearchResults
            results={searchResults}
            highlight={searchPhrase}
            onItemClick={(item) => {
              if (item.type !== 'node' && item.type !== 'stream') {
                return
              }

              /**
               * If the user modified the phrase and the selected node/stream got on the
               * search result list then clicking it won't change the URL and won't trigger
               * the effect calling `setSelectedStreamIdOrNodeIdAsPhrase`. We have to set the phrase
               * manually to ensure things are in good order.
               */
              setSearchPhrase(item.payload.id)
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

function useSetInitialSearchPhraseEffect() {
  const { setSearchPhrase, selectedNode } = useStore()

  const streamId = useStreamIdParam()

  const selectedNodeId = selectedNode?.id

  useEffect(
    function setSearchPhraseOnMountOnly() {
      if (streamId) {
        setSearchPhrase(streamId)
      } else if (selectedNodeId) {
        setSearchPhrase(selectedNodeId)
      }
    },
    [streamId, selectedNodeId, setSearchPhrase],
  )
}
