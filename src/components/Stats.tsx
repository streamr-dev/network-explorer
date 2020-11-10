import React, { useCallback } from 'react'
import styled, { css } from 'styled-components/macro'

import { SANS } from '../utils/styled'

type StatContainerProps = {
  clickable?: boolean,
  disabled?: boolean,
}

const StatContainer = styled.div<StatContainerProps>`
  text-align: center;
  user-select: none;
  position: relative;

  ${({ clickable, disabled }) => !!clickable && !disabled && css`
    cursor: pointer;
  `}

  ${({ disabled }) => !!disabled && css`
    cursor: not-allowed;
    opacity: 0.5;
  `}
`

const StatName = styled.div`
  font-size: 10px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.05em;
  color: #ADADAD;
  text-transform: uppercase;
`

const StatValue = styled.div`
  font-size: 16px;
  line-height: 32px;
  padding-bottom: 4px;
  color: #323232;

  svg {
    width: 13px;
    height: 13px;
    color: #ADADAD;
  }
`

const UnderlineContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  position: absolute;
  bottom: -1px;
`

const Underline = styled.div`
  border-bottom: 1.5px solid #0324FF;
  width: 32px;
`

const InfinityIcon = () => (
  <svg viewBox="0 0 13 7" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3.682 6.16c1.2 0 2.144-.672 2.464-2.24h.08c.512 1.504 1.408 2.24 3.088 2.24 1.76 0 2.848-1.28 2.848-3.04S11.074.08 9.314.08c-1.2 0-2.144.672-2.464 2.24h-.08C6.258.816 5.362.08 3.682.08 1.922.08.834 1.36.834 3.12s1.088 3.04 2.848 3.04zm0-1.088c-.928 0-1.536-.624-1.536-1.552v-.8c0-.928.608-1.552 1.536-1.552 1.04 0 1.792.56 2.16 1.952-.368 1.392-1.12 1.952-2.16 1.952zm5.632 0c-1.04 0-1.792-.56-2.16-1.952.368-1.392 1.12-1.952 2.16-1.952.928 0 1.536.624 1.536 1.552v.8c0 .928-.608 1.552-1.536 1.552z"
      fill="currentColor"
    />
  </svg>
)

type StatProps = {
  label: string,
  value: number | string | undefined,
  onClick?: () => void,
  active?: boolean,
  disabled?: boolean,
}

export const Stat = ({
  label,
  value,
  onClick: onClickProp,
  active,
  disabled,
}: StatProps) => {
  const onClick = useCallback(() => {
    if (typeof onClickProp === 'function') {
      onClickProp()
    }
  }, [onClickProp])

  return (
    <StatContainer
      onClick={onClick}
      clickable={typeof onClickProp === 'function'}
      disabled={disabled}
    >
      <StatName>{label}</StatName>
      <StatValue>
        {value !== undefined && value}
        {value === undefined && (
          <InfinityIcon />
        )}
      </StatValue>
      {!!active && (
        <UnderlineContainer>
          <Underline />
        </UnderlineContainer>
      )}
    </StatContainer>
  )
}

export const Stats = styled.div`
  display: grid;
  grid-auto-flow: column;
  padding-top: 12px;
  font-family: ${SANS};
`
