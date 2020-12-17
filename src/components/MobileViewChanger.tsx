import React from 'react'
import styled, { css } from 'styled-components'

import { SM } from '../utils/styled'
import { useStore } from '../contexts/Store'

type Props = {}

const UnstyledListIcon = (props: Props) => (
  <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M2.6 4.2a1.6 1.6 0 100-3.2 1.6 1.6 0 000 3.2zM2.6 10.6a1.6 1.6 0 100-3.2 1.6 1.6 0 000 3.2zM2.6 17a1.6 1.6 0 100-3.2 1.6 1.6 0 000 3.2zM6.333 2.6H17M6.333 9H17M6.333 15.4H17"
      stroke="#0324FF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ListIcon = styled(UnstyledListIcon)``

const UnstyledMapIcon = (props: Props) => (
  <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M17 6.867V3.773a1.067 1.067 0 00-.67-.99l-4.267-1.707a1.066 1.066 0 00-.793 0L6.73 2.893a1.067 1.067 0 01-.793 0L1.732 1.211A.533.533 0 001 1.708V11.93a1.066 1.066 0 00.67.99l4.267 1.707c.254.102.538.102.792 0l2.049-.82M6.333 2.969v11.733M11.666 1v5.333M13.8 11.452a.266.266 0 01.266.267M13.533 11.719a.267.267 0 01.267-.267M13.8 11.986a.267.267 0 01-.267-.266M14.066 11.719a.267.267 0 01-.266.266"
      stroke="#0324FF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.8 8.52a3.2 3.2 0 013.2 3.2c0 1.365-1.912 3.964-2.78 5.075a.534.534 0 01-.84 0c-.869-1.11-2.78-3.71-2.78-5.076a3.2 3.2 0 013.2-3.2z"
      stroke="#0324FF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const MapIcon = styled(UnstyledMapIcon)``

const Circle = styled.div`
  border: 8px solid #FFFFFF;
  border-radius: 50%;
  background-color: #EFEFEF;
  width: 48px;
  height: 48px;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.08);
  position: relative;

  svg {
    position: absolute;
    width: 18px;
    height: 18px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: opacity 200ms ease-in-out;
    opacity: 0;
  }

  ${({ theme }) => theme.activeView === 'map' && css`
    ${MapIcon} {
      opacity: 0;
    }

    ${ListIcon} {
      opacity: 1;
    }
  `}

  ${({ theme }) => theme.activeView === 'list' && css`
    ${ListIcon} {
      opacity: 0;
    }

    ${MapIcon} {
      opacity: 1;
    }
  `}
`

const UnstyledMobileViewChanger = (props: Props) => {
  const { activeView, toggleActiveView } = useStore()

  return (
    <button type="button" {...props} onClick={() => toggleActiveView()}>
      <Circle theme={{
        activeView,
      }}
      >
        <ListIcon />
        <MapIcon />
      </Circle>
    </button>
  )
}

const MobileViewChanger = styled(UnstyledMobileViewChanger)`
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  border: none;
  appearance: none;
  background: transparent;
  outline: none;
  margin: 0;
  padding: 0;
  z-index: 3;
  cursor: pointer;

  @media (min-width: ${SM}px) {
    display: none;
  }
`

export default MobileViewChanger
