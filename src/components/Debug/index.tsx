import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components/macro'
import JsonView from 'react-pretty-json'

import { useAllPending } from '../../contexts/Pending'
import { useStore } from '../../contexts/Store'
import { useController } from '../../contexts/Controller'
import envs from '../../utils/envs'
import {
  MONO,
  SANS,
  MEDIUM,
  MD,
} from '../../utils/styled'
import { isLocalStorageAvailable } from '../../utils/storage'

export const APP_DEBUG_MODE_KEY = 'network-eplorer.debug'
const storage = isLocalStorageAvailable() ? window.localStorage : null

export function getDebugMode() {
  return (!!storage && JSON.parse(storage.getItem(APP_DEBUG_MODE_KEY) || 'false'))
}

export function setDebugMode(value: boolean) {
  if (!storage) { return }
  storage.setItem(APP_DEBUG_MODE_KEY, JSON.stringify(value))
}

const openTheme = {
  background: 'rgba(0, 0, 0, 0.3)',
}

const closeTheme = {
  background: 'transparent',
}

const DebugContainer = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  border-radius: 4px;
  color: white;
  font-family: ${SANS};
  font-size: 12px;
  background-color: ${({ theme }) => theme.background};
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

  .key { font-weight: strong; color: lightblue; }
  .boolean { color: cyan; }
  .string { color: #ffcc00; }
  .number { color: lightgreen; }
  a { color: pink; }
`

const EnvSelect = styled.label`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;

  span {
    flex-grow: 1;
  }

  select {
    flex-grow: 1;
    margin-left: 16px;
    height: 20px;
  }

  button {
    margin-left: 8px;
    font-size: 12px;
  }
`

const OpenView = styled.div`
  span {
    user-select: none;
    pointer-events: none;
    text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);

    strong {
      text-transform: uppercase;
      font-weight: ${MEDIUM};
      color: #FAFAD2;
    }
  }

  button {
    margin-left: 8px;
  }
`

const Debug = () => {
  const { pending } = useAllPending()
  const { env: selectedEnv, store } = useStore()
  const { changeEnv } = useController()
  const [open, setOpen] = useState<boolean>(getDebugMode())

  const toggleDebugMode = useCallback(() => {
    setOpen((wasOpen) => !wasOpen)
  }, [])

  useEffect(() => {
    setDebugMode(open)
  }, [open])

  return (
    <DebugContainer theme={open ? openTheme : closeTheme}>
      {!open && (
        <OpenView>
          <span>using <strong>{selectedEnv}</strong> data</span>
          <button type="button" onClick={toggleDebugMode}>
            &#8505;
          </button>
        </OpenView>
      )}
      {!!open && (
        <Wrapper>
          <EnvSelect htmlFor="env">
            <span>Selected env:</span>
            <select
              name="env"
              value={selectedEnv}
              onChange={(e) => changeEnv(e.currentTarget.value)}
            >
              {Object.keys(envs).map((env) => (
                <option key={env} value={env}>
                  {env}
                </option>
              ))}
            </select>
            <button type="button" onClick={toggleDebugMode}>&#x2715;</button>
          </EnvSelect>
          <Variables>
            <JsonView json={{
              pending,
              store,
            }}
            />
          </Variables>
        </Wrapper>
      )}
    </DebugContainer>
  )
}

export default Debug
