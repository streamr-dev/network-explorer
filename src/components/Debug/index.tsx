import React from 'react'
import styled from 'styled-components/macro'
import JsonView from 'react-pretty-json'

import { useAllPending } from '../../contexts/Pending'
import { useStore } from '../../contexts/Store'
import {
  MONO, SANS, MD,
} from '../../utils/styled'
import { isLocalStorageAvailable } from '../../utils/storage'

export const APP_DEBUG_MODE_KEY = 'network-eplorer.debug'
const storage = isLocalStorageAvailable() ? window.localStorage : null

export function getDebugMode() {
  return !!storage && JSON.parse(storage.getItem(APP_DEBUG_MODE_KEY) || 'false')
}

export function setDebugMode(value: boolean) {
  if (!storage) {
    return
  }
  storage.setItem(APP_DEBUG_MODE_KEY, JSON.stringify(value))
}

const DebugContainer = styled.div`
  position: fixed;
  bottom: 218px;
  right: 32px;
  border-radius: 4px;
  color: white;
  font-family: ${SANS};
  font-size: 12px;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 8px;

  button {
    padding: 0;
    margin: 0;
    border: 0;
    background-color: rgba(0, 0, 0, 0.3);
    color: white;
    border-radius: 4px;
    cursor: pointer;
    outline: none;
    apperance: none;
    height: 20px;
    min-width: 20px;

    :hover {
      background-color: rgba(0, 0, 0, 0.8);
    }
  }

  @media (max-width: ${MD}px) {
    display: none;
  }
`

const Wrapper = styled.div`
  width: 320px;
`

const Variables = styled.pre`
  overflow: scroll;
  display: block;
  height: 200px;
  font-size: 8px;
  padding: 5px 10px;
  margin: 0;
  background-color: rgba(0, 0, 0, 0.3);
  font-family: ${MONO};
  border-radius: 4px;

  .key {
    font-weight: strong;
    color: lightblue;
  }
  .boolean {
    color: cyan;
  }
  .string {
    color: #ffcc00;
  }
  .number {
    color: lightgreen;
  }
  a {
    color: pink;
  }
`

const isDebugEnabled = getDebugMode()

const Debug = () => {
  const { pending } = useAllPending()
  const { store } = useStore()

  // Hide debug view if not enabled in local storage
  if (!isDebugEnabled) {
    return null
  }

  return (
    <DebugContainer>
      <Wrapper>
        <Variables>
          <JsonView
            json={{
              pending,
              store,
            }}
          />
        </Variables>
      </Wrapper>
    </DebugContainer>
  )
}

export default Debug
