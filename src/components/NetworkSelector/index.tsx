import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { SANS } from '../../utils/styled'
import { Tooltip } from '../Tooltip'

const GlobeIcon = () => (
  <svg width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7.934 16.73a8 8 0 118.995-8.996M7.073 16.566C5.99 14.98 5.267 12.095 5.267 8.8c0-3.294.724-6.178 1.806-7.766M1.018 8.267h6.916M2.6 4h12.8M1.924 12.534h3.673M10.928 1.034a12.105 12.105 0 011.642 5.103"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const TickIcon = () => (
  <svg width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2.094 7.562l2.38 2.57 5.658-5.657"
      stroke="#525252"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const MainnetTheme = {
  color: '#0EAC1B',
}

const NetworkIndicator = styled.div`
  border-radius: 50%;
  width: 8px;
  height: 8px;
  background-color: ${({ theme }) => theme.color};
`

const Button = styled.button`
  appearance: none;
  border: 0;
  background: none;
  outline: none;
  background-color: #ffffff;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  width: 40px;
  height: 40px;
  position: relative;
  color: #323232;
  transition: 300ms color ease-in-out;
  cursor: pointer;
  padding: 0;
  margin: 0;

  svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  ${NetworkIndicator} {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) translate(4px, 4px);
  }

  &:hover,
  &:focus-within {
    color: #a3a3a3;
  }
`

const NetworkList = styled.div`
  background-color: #ffffff;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  position: absolute;
  right: 0;
  top: 48px;
  padding: 4px 0px;
`

const NetworkName = styled.div`
  font-family: ${SANS};
  font-size: 14px;
`

const NetworkItem = styled.button`
  height: 28px;
  display: flex;
  align-items: center;
  width: 100%;
  appearance: none;
  border: 0;
  background: none;
  outline: none;
  text-align: left;
  padding: 0;
  margin: 0;
  padding: 0px 14px;

  ${NetworkName} {
    flex: 1;
    margin-left: 12px;
    min-width: 64px;
  }

  &:hover {
    background-color: #ebebeb;
  }
`

const NetworkSelectorRoot = styled.div`
  pointer-events: auto;
`

export default function NetworkSelector() {
  const [open, setOpen] = useState<boolean>(false)

  const containerRef = useRef<HTMLDivElement>(null)

  const toggleOpen = useCallback(() => {
    setOpen((wasOpen) => !wasOpen)
  }, [])

  useEffect(() => {
    if (!open || !containerRef.current) {
      return undefined
    }

    // close on esc
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    const onMouseDown = (e: MouseEvent) => {
      const { current: el } = containerRef

      if (!el) {
        return
      }

      if (!el.contains(e.target as Element)) {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('mousedown', onMouseDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('mousedown', onMouseDown)
    }
  }, [open])

  return (
    <NetworkSelectorRoot ref={containerRef}>
      <Tooltip value={!open ? 'Network selector' : undefined}>
        <Button type="button" onClick={toggleOpen}>
          <GlobeIcon />
          <NetworkIndicator theme={MainnetTheme} />
        </Button>
      </Tooltip>
      {!!open && (
        <NetworkList>
          <NetworkItem type="button">
            <NetworkIndicator theme={MainnetTheme} />
            <NetworkName>Mainnet</NetworkName>
            <div>
              <TickIcon />
            </div>
          </NetworkItem>
        </NetworkList>
      )}
    </NetworkSelectorRoot>
  )
}
