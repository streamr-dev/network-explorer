import React, {
  useCallback, useMemo, useState, useEffect,
} from 'react'
import styled, { css } from 'styled-components/macro'

import { SANS } from '../utils/styled'

type StatProps = {
  id: string
  label: string
  value: number | string | undefined
  onClick?: () => void
  disabled?: boolean
  theme?: Record<string, number | string | boolean>
}

const UnstyledStat = ({
  label,
  value,
  onClick: onClickProp,
  disabled,
  theme,
  ...props
}: StatProps) => {
  const onClick = useCallback(() => {
    if (typeof onClickProp === 'function') {
      onClickProp()
    }
  }, [onClickProp])

  return (
    <button type="button" onClick={onClick} {...props}>
      <StatName>{label}</StatName>
      <StatValue>
        {value !== undefined && value}
        {value === undefined && <InfinityIcon />}
      </StatValue>
    </button>
  )
}

const StatName = styled.div`
  font-size: 10px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.05em;
  color: #adadad;
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
    color: #adadad;
  }
`

const Stat = styled(UnstyledStat)`
  background: transparent;
  border: 0;
  appearance: none;
  text-align: center;
  user-select: none;
  position: relative;
  font-family: inherit;
  outline: none;

  &:focus {
    outline: none;
  }

  ${StatName} {
    transition: color 300ms ease-in-out;
  }

  ${({ theme }) =>
    !!theme.clickable &&
    !theme.disabled &&
    !theme.active &&
    css`
      &:hover {
        cursor: pointer;

        ${StatName} {
          color: #0324ff;
        }
      }
    `}

  ${({ theme }) =>
    !!theme.disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.5;
    `}
`

const InfinityIcon = () => (
  <svg viewBox="0 0 13 7" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3.682 6.16c1.2 0 2.144-.672 2.464-2.24h.08c.512 1.504 1.408 2.24 3.088 2.24 1.76 0 2.848-1.28 2.848-3.04S11.074.08 9.314.08c-1.2 0-2.144.672-2.464 2.24h-.08C6.258.816 5.362.08 3.682.08 1.922.08.834 1.36.834 3.12s1.088 3.04 2.848 3.04zm0-1.088c-.928 0-1.536-.624-1.536-1.552v-.8c0-.928.608-1.552 1.536-1.552 1.04 0 1.792.56 2.16 1.952-.368 1.392-1.12 1.952-2.16 1.952zm5.632 0c-1.04 0-1.792-.56-2.16-1.952.368-1.392 1.12-1.952 2.16-1.952.928 0 1.536.624 1.536 1.552v.8c0 .928-.608 1.552-1.536 1.552z"
      fill="currentColor"
    />
  </svg>
)

const ButtonGrid = styled.div`
  display: flex;
  flex-direction: row;
  padding-top: 12px;
  font-family: ${SANS};

  > ${Stat} {
    flex-grow: 1;
    flex-basis: 0;
  }
`

const Underline = styled.div`
  border-bottom: 1.5px solid #0324ff;
  width: 32px;
  z-index: 1;
`

const UnderlineContainer = styled.div`
  transition: all 300ms ease-in-out;
  display: flex;
  justify-content: center;
  position: absolute;
  bottom: -1px;
  opacity: 0;
  width: ${({ theme }) => 100 / Math.max(1, theme.childCount)}%;

  ${({ theme }) =>
    theme.active !== undefined &&
    css`
      left: ${theme.active * (100 / Math.max(1, theme.childCount))}%;
    `}

  ${({ theme }) =>
    !!theme.visible &&
    css`
      opacity: 1;
    `}
`

type StatsProps = {
  children: React.ReactNode
  active?: string | number
}

type ChildProps = {
  props: React.Props<StatProps>
}

const UnstyledStats = ({ children, active, ...props }: StatsProps) => {
  const childrenArray = useMemo(() => React.Children.toArray(children), [children])
  const [prevActiveIndex, setPrevActiveIndex] = useState<number | undefined>(undefined)

  const activeIndex = useMemo(() => {
    const index = childrenArray.findIndex((child) => {
      if (React.isValidElement<StatProps>(child)) {
        return child.props.id === active
      }
      return false
    })

    return index >= 0 ? index : undefined
  }, [childrenArray, active])

  useEffect(() => {
    if (activeIndex !== undefined) {
      setPrevActiveIndex(activeIndex)

      return () => {}
    }

    // clear previous value once animation has finished
    const timeoutId = setTimeout(() => {
      setPrevActiveIndex(undefined)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [activeIndex])

  return (
    <div {...props}>
      <ButtonGrid>
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement<StatProps>(child)) {
            return React.cloneElement(child, {
              theme: {
                active: child.props.id === active,
                clickable: !!(typeof child.props.onClick === 'function'),
                disabled: !!child.props.disabled,
              },
            })
          }

          return null
        })}
      </ButtonGrid>
      <UnderlineContainer
        theme={{
          childCount: childrenArray.length,
          active: prevActiveIndex,
          visible: active !== undefined,
        }}
      >
        <Underline />
      </UnderlineContainer>
    </div>
  )
}

const Stats = styled(UnstyledStats)`
  position: relative;
`

export default Object.assign(Stats, {
  Stat,
})
