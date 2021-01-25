import React, { useCallback, useMemo } from 'react'
import { LinearInterpolator, ViewportProps } from 'react-map-gl'
import styled from 'styled-components/macro'

import { useStore } from '../../contexts/Store'
import useKeyDown from '../../hooks/useKeyDown'
import { getCenteredViewport } from './utils'

const Container = styled.div`
  position: absolute;
  right: 32px;
  bottom: 32px;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.08);
  border-radius: 4px;
`

const Button = styled.button`
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  outline: none;
  font: inherit;
  color: inherit;
  background: none;

  &:not(:last-child) {
    border-bottom: 1px solid #EFEFEF;
  }
`

const LINEAR_TRANSITION_PROPS = {
  transitionDuration: 300,
  transitionEasing: (t: number) => t,
  transitionInterpolator: new LinearInterpolator(),
}

const RefreshIcon = () => (
  <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.2413 4.66639C12.5205 3.79333 11.5479 3.16398 10.4562 2.86423C9.3644 2.56449 8.20675 2.60897 7.14122 2.99159C6.07569 3.37421 5.15419 4.07633 4.50251 5.00212C3.85084 5.9279 3.50074 7.03224 3.5 8.16439V9.66639" stroke="#323232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 11.939C5.75586 12.74 6.73476 13.2955 7.80995 13.5338C8.88514 13.7721 10.0071 13.6821 11.0306 13.2756C12.0541 12.869 12.9319 12.1645 13.5505 11.2533C14.169 10.3422 14.4998 9.26632 14.5 8.16504V7.16504" stroke="#323232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1.5 7.66504L3.5 9.66504L5.5 7.66504" stroke="#323232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16.5 9.16504L14.5 7.16504L12.5 9.16504" stroke="#323232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const MinusIcon = () => (
  <svg width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M27 20H13" stroke="#323232" strokeWidth="2" />
  </svg>
)

const PlusIcon = () => (
  <svg width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path stroke="#323232" strokeWidth="2" d="M7 0v14M14 7H0" />
  </svg>
)

type Props = {
  setViewport: React.Dispatch<React.SetStateAction<ViewportProps>>,
}

const NavigationControl = ({ setViewport }: Props) => {
  const { visibleNodes } = useStore()

  const zoomIn = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      zoom: prev.zoom + 1,
      LINEAR_TRANSITION_PROPS,
    }))
  }, [setViewport])

  const zoomOut = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      zoom: prev.zoom - 1,
      LINEAR_TRANSITION_PROPS,
    }))
  }, [setViewport])

  const reset = useCallback(() => {
    setViewport((prev) => {
      const viewport = getCenteredViewport(visibleNodes, prev.width, prev.height)
      return {
        ...prev,
        ...viewport,
        LINEAR_TRANSITION_PROPS,
      }
    })
  }, [setViewport, visibleNodes])

  useKeyDown(useMemo(() => ({
    '0': () => {
      reset()
    },
  }), [reset]))

  return (
    <Container>
      <Button onClick={reset}><RefreshIcon /></Button>
      <Button onClick={zoomIn}><PlusIcon /></Button>
      <Button onClick={zoomOut}><MinusIcon /></Button>
    </Container>
  )
}

export default NavigationControl
