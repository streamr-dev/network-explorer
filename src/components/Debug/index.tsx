import React, { useState, useRef } from 'react'
import styled from 'styled-components/macro'
import JsonView from 'react-pretty-json'

import { useAllPending } from '../../contexts/Pending'
import { useStore } from '../../contexts/Store'
import {
  MONO, SANS, MD,
} from '../../utils/styled'
import { isLocalStorageAvailable } from '../../utils/storage'

export const APP_DEBUG_MODE_KEY = 'network-eplorer.debug'
export const APP_DEBUG_WINDOW_POS_KEY = 'network-eplorer.debug_window_pos'
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

type WindowPos = {
  x: number,
  y: number,
}

export function getDebugWindowPos(): WindowPos {
  return !!storage && JSON.parse(storage.getItem(APP_DEBUG_WINDOW_POS_KEY) || '{"x":0,"y":0}')
}

export function setDebugWindowPos(value: WindowPos) {
  if (!storage) {
    return
  }
  storage.setItem(APP_DEBUG_WINDOW_POS_KEY, JSON.stringify(value))
}

const DebugContainer = styled.div`
  position: fixed;
  border-radius: 4px;
  color: white;
  font-family: ${SANS};
  font-size: 12px;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 8px;
  z-index: 10001;

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
  const [pos, setPos] = useState<WindowPos>(getDebugWindowPos())
  const ref = useRef<HTMLDivElement>(null)

  const onMouseDown = ({ clientX: x0, clientY: y0, button }: React.MouseEvent<HTMLElement>) => {
    const { current: el } = ref

    if (button !== 0 || !el) { return }

    const { offsetLeft, offsetTop } = el || {}

    const onMove = (e: MouseEvent) => {
      e.preventDefault()

      setPos({
        x: offsetLeft - (x0 - e.clientX),
        y: offsetTop - (y0 - e.clientY),
      })
    }

    const onUp = (e: MouseEvent) => {
      setDebugWindowPos({
        x: offsetLeft - (x0 - e.clientX),
        y: offsetTop - (y0 - e.clientY),
      })

      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // Hide debug view if not enabled in local storage
  if (!isDebugEnabled) {
    return null
  }

  return (
    <DebugContainer
      onMouseDown={onMouseDown}
      ref={ref}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
      }}
    >
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
