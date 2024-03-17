import React from 'react'
import styled, { css } from 'styled-components'
import { SANS } from '../utils/styled'

const Root = styled.div<{
  readonly $tooltip?: string | undefined
}>`
  position: relative;
  display: inline-block;
  line-height: 1;

  ${({ $tooltip = '' }) =>
    !!$tooltip &&
    css`
      &::after {
        content: '${$tooltip}';
        visibility: hidden;
        opacity: 0;
        transition: 0s all;
        position: absolute;
        background-color: #323232;
        border-radius: 4px;
        color: white;
        font-size: 12px;
        font-family: ${SANS};
        line-height: 24px;
        padding: 0px 6px;
        white-space: nowrap;
        z-index: 1;
        text-align: center;

        top: 50%;
        right: 0;
        transform: translate(-48px, -50%);
      }
    `}

  &:hover::after {
    visibility: visible;
    opacity: 1;
  }
`

type Props = {
  value: string | undefined
  children: React.ReactNode
}

export function Tooltip({ value, ...props }: Props) {
  return <Root {...props} $tooltip={value} />
}
