import React from 'react'
import styled from 'styled-components/macro'

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

export type Props = {
  onZoomIn?: () => void,
  onZoomOut?: () => void,
  onZoomReset?: () => void,
}

const UnstyledNavigationControl = ({
  onZoomIn,
  onZoomOut,
  onZoomReset,
  ...props
}: Props) => (
  <div {...props}>
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
  right: 32px;
  bottom: 32px;
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
`

export default NavigationControl
