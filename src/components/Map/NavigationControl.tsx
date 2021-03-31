import React from 'react'
import styled from 'styled-components/macro'

import { SM } from '../../utils/styled'

const Button = styled.button`
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  outline: none;
  font: inherit;
  color: inherit;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 14px;
    height: 14px;
  }
`

const ResetButton = styled(Button)`
  svg {
    width: 18px;
    height: 16px;
  }
`

const RefreshIcon = () => (
  <svg viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.2413 4.66639C12.5205 3.79333 11.5479 3.16398 10.4562 2.86423C9.3644 2.56449 8.20675 2.60897 7.14122 2.99159C6.07569 3.37421 5.15419 4.07633 4.50251 5.00212C3.85084 5.9279 3.50074 7.03224 3.5 8.16439V9.66639" stroke="#323232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 11.939C5.75586 12.74 6.73476 13.2955 7.80995 13.5338C8.88514 13.7721 10.0071 13.6821 11.0306 13.2756C12.0541 12.869 12.9319 12.1645 13.5505 11.2533C14.169 10.3422 14.4998 9.26632 14.5 8.16504V7.16504" stroke="#323232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1.5 7.66504L3.5 9.66504L5.5 7.66504" stroke="#323232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16.5 9.16504L14.5 7.16504L12.5 9.16504" stroke="#323232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const MinusIcon = () => (
  <svg viewBox="0 0 14 2" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 1L0 0.999999" stroke="#323232" strokeWidth="2" />
  </svg>
)

const PlusIcon = () => (
  <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path stroke="#323232" strokeWidth="2" d="M7 0v14M14 7H0" />
  </svg>
)

const ConnectionIcon = () => (
  <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 5.49902C10.1046 5.49902 11 4.60359 11 3.49902C11 2.39445 10.1046 1.49902 9 1.49902C7.89543 1.49902 7 2.39445 7 3.49902C7 4.60359 7.89543 5.49902 9 5.49902Z" stroke="#323232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.5 14.499C4.60457 14.499 5.5 13.6036 5.5 12.499C5.5 11.3945 4.60457 10.499 3.5 10.499C2.39543 10.499 1.5 11.3945 1.5 12.499C1.5 13.6036 2.39543 14.499 3.5 14.499Z" stroke="#323232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.5 14.499C15.6046 14.499 16.5 13.6036 16.5 12.499C16.5 11.3945 15.6046 10.499 14.5 10.499C13.3954 10.499 12.5 11.3945 12.5 12.499C12.5 13.6036 13.3954 14.499 14.5 14.499Z" stroke="#323232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.5 12.499H12.5" stroke="#323232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.106 5.16504L13.6273 10.6984" stroke="#323232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.89389 5.16504L4.37256 10.6984" stroke="#323232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export type Props = {
  onZoomIn?: () => void,
  onZoomOut?: () => void,
  onZoomReset?: () => void,
  onToggleConnections?: () => void,
}

const UnstyledNavigationControl = ({
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onToggleConnections,
  ...props
}: Props) => (
  <div {...props}>
    {typeof onToggleConnections === 'function' && (
      <Button type="button" onClick={() => onToggleConnections()}><ConnectionIcon /></Button>
    )}
    {typeof onZoomReset === 'function' && (
      <ResetButton type="button" onClick={() => onZoomReset()}><RefreshIcon /></ResetButton>
    )}
    {typeof onZoomIn === 'function' && (
      <Button type="button" onClick={() => onZoomIn()}><PlusIcon /></Button>
    )}
    {typeof onZoomOut === 'function' && (
      <Button type="button" onClick={() => onZoomOut()}><MinusIcon /></Button>
    )}
  </div>
)

const NavigationControl = styled(UnstyledNavigationControl)`
  position: absolute;
  right: 16px;
  top: 16px;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.08);
  border-radius: 4px;

  ${Button}:not(:last-child) {
    border-bottom: 1px solid #EFEFEF;
  }

  :empty {
    display: none;
  }

  @media (min-width: ${SM}px) {
    top: auto;
    right: 32px;
    bottom: 32px;
  }
`

export default NavigationControl
