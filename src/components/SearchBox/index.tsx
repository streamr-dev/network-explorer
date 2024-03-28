import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../Store'
import { useStreamIdParam } from '../../hooks'
import { ActiveView } from '../../types'
import { useIsSearching, useSearch } from '../../utils/search'
import Stats, { ApyStat, MessagesPerSecondStat, NodeCountStat, TvlStat } from '../Stats'
import { NoSearchResults } from './NoSearchResults'
import { Search, SlideHandle } from './Search'
import { SearchInput } from './SearchInput'
import { SearchResults } from './SearchResults'

export function SearchBox() {
  const [phrase, setPhrase] = useState('')

  const { selectedNode, activeView, setActiveView } = useStore()

  const selectedNodeId = selectedNode?.id || null

  const streamId = useStreamIdParam()

  const hasSelection = phrase === selectedNodeId || phrase === streamId

  const finalPhrase = hasSelection ? '' : phrase

  const isSearchPending = useIsSearching(finalPhrase)

  const searchResults = useSearch({ phrase: finalPhrase })

  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(
    function setSelectedStreamIdOrNodeIdAsPhrase() {
      setPhrase(streamId ? streamId : selectedNodeId || '')
    },
    [selectedNodeId, streamId],
  )

  const navigate = useNavigate()

  const inputRef = useRef<HTMLInputElement>(null)

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
          value={phrase}
          onChange={(e) => {
            setPhrase(e.target.value)
          }}
          onClearButtonClick={() => {
            if (phrase === selectedNodeId || phrase === streamId) {
              navigate('/')
            }

            setPhrase('')

            inputRef.current?.focus()
          }}
          onFocus={() => {
            setActiveView(ActiveView.List)
          }}
          onBlur={() => {
            setActiveView(ActiveView.Map)
          }}
        />
        <Stats>
          <NodeCountStat />
          {streamId ? <MessagesPerSecondStat /> : <ApyStat />}
          <TvlStat />
        </Stats>
        {searchResults.length > 0 && (
          <SearchResults
            results={searchResults}
            highlight={phrase}
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
