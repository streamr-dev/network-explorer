import React, { useEffect, useReducer, useRef } from 'react'
import styled from 'styled-components/macro'
import JsonView from 'react-pretty-json'

import { useAllPending } from '../../contexts/Pending'
import { useStore } from '../../contexts/Store'
import {
  MONO, SANS, MD,
} from '../../utils/styled'
import { isLocalStorageAvailable } from '../../utils/storage'

export const APP_DEBUG_MODE_KEY = 'network-explorer.debug'
export const APP_DEBUG_WINDOW_PROPS_KEY = 'network-explorer.debug_window_props'
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

type WindowDimension = {
  width: number,
  height: number,
}

type WindowProps = WindowPos & WindowDimension

const initialState: WindowProps = {
  x: 0,
  y: 0,
  width: 320,
  height: 200,
}

export function getDebugWindowProps(): WindowProps {
  return !!storage && JSON.parse(storage.getItem(APP_DEBUG_WINDOW_PROPS_KEY) ||
    JSON.stringify(initialState))
}

export function setDebugWindowProps(value: WindowProps) {
  if (!storage) {
    return
  }
  storage.setItem(APP_DEBUG_WINDOW_PROPS_KEY, JSON.stringify(value))
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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const Header = styled.div`
  background-color: #323232;
  color: white;
  padding: 4px 8px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  cursor: grab;
`

const Variables = styled.pre`
  overflow: scroll;
  display: block;
  flex: 1;
  font-size: 8px;
  padding: 5px 10px;
  margin: 0;
  background-color: rgba(0, 0, 0, 0.3);
  font-family: ${MONO};
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;

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

const ResizeHandle = styled.div`
  position: absolute;
  right: 8px;
  bottom: 8px;
  z-index: 10002;
  cursor: nwse-resize;
  width: 0;
  height: 0;
  border-bottom: 16px solid #323232;
  border-left: 16px solid transparent;
  opacity: 0.8;
`

const isDebugEnabled = getDebugMode()

const Debug = () => {
  const { pending } = useAllPending()
  const { store } = useStore()
  const [windowProps, setWindowProps] = useReducer(
    (prevState: WindowProps, nextState: WindowPos | WindowDimension) => ({
      ...(prevState || {}),
      ...nextState,
    }), getDebugWindowProps())
  const ref = useRef<HTMLDivElement>(null)

  const onMoveContainer = ({ clientX: x0, clientY: y0, button }: React.MouseEvent<HTMLElement>) => {
    const { current: el } = ref

    if (button !== 0 || !el) { return }

    const { offsetLeft, offsetTop } = el || {}

    const onMove = (e: MouseEvent) => {
      e.preventDefault()

      setWindowProps({
        x: offsetLeft - (x0 - e.clientX),
        y: offsetTop - (y0 - e.clientY),
      })
    }

    const onUp = (e: MouseEvent) => {
      setWindowProps({
        x: offsetLeft - (x0 - e.clientX),
        y: offsetTop - (y0 - e.clientY),
      })

      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const onResizeContainer = ({
    clientX: x0,
    clientY: y0,
    button,
  }: React.MouseEvent<HTMLElement>) => {
    const { current: el } = ref

    if (button !== 0 || !el) { return }

    const { offsetWidth, offsetHeight } = el || {}

    const onMove = (e: MouseEvent) => {
      e.preventDefault()

      setWindowProps({
        width: offsetWidth - (x0 - e.clientX),
        height: offsetHeight - (y0 - e.clientY),
      })
    }

    const onUp = (e: MouseEvent) => {
      setWindowProps({
        width: offsetWidth - (x0 - e.clientX),
        height: offsetHeight - (y0 - e.clientY),
      })

      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  useEffect(() => {
    setDebugWindowProps(windowProps)
  }, [windowProps])

  // Hide debug view if not enabled in local storage
  if (!isDebugEnabled) {
    return null
  }

  return (
    <DebugContainer
      ref={ref}
      style={{
        left: `${windowProps.x}px`,
        top: `${windowProps.y}px`,
        width: `${windowProps.width}px`,
        height: `${windowProps.height}px`,
      }}
    >
      <Wrapper>
        <Header
          onMouseDown={onMoveContainer}
        >
          Debug
        </Header>
        <Variables>
          <JsonView
            json={{
              pending,
              store,
            }}
          />
        </Variables>
      </Wrapper>
      <ResizeHandle
        onMouseDown={onResizeContainer}
      />
    </DebugContainer>
  )
}

export default Debug
