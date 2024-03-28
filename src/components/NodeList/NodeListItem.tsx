import React, { ReactNode, useEffect, useRef } from 'react'
import Identicon from 'react-identicons'
import { animated, useTransition } from 'react-spring'
import styled, { css } from 'styled-components'
import { MEDIUM, SANS } from '../../utils/styled'
import Error from '../Error'
import Graphs from '../Graphs'
import Stats from '../Stats'
import { setNodeFeatureState } from '../../utils/map'
import { useStore } from '../../Store'

const Name = styled.div`
  color: #323232;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  strong {
    font-weight: ${MEDIUM};
  }
`

const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px;

  ${Name} {
    flex: 1;
  }
`

const IconWrapper = styled.div``

const Content = styled.div`
  transition: max-height 300ms ease-in-out;
  max-height: 0;
`

const NodeElement = styled.div`
  background: #ffffff;
  border: 1px solid #f5f5f5;
  border-radius: 4px;

  & + & {
    margin-top: 12px;
    scroll-margin-top: 12px;
  }

  ${IconWrapper} {
    margin: 0 4px;
  }

  ${Name} {
    margin-left: 20px;
  }

  ${Stats},
  ${Graphs},
  ${Error} {
    border-top: 1px solid #f5f5f5;
  }

  ${({ theme }) =>
    !!theme.clickable &&
    css`
      ${TitleRow}:hover {
        background: #f8f8f8;
      }

      ${TitleRow} {
        cursor: pointer;
      }
    `}

  ${({ theme }) =>
    !!theme.isActive &&
    css`
      box-shadow: 0 0 0 3px #ddd;

      ${Content} {
        max-height: 100vh;
      }
    `}
`

const PlacenameOrAddress = styled.div`
  position: relative;
  height: 16px;

  * > div {
    position: absolute;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

const PlaceName = styled.div`
  font-size: 10px;
  color: #adadad;
  margin-top: 2px;
  font-weight: ${MEDIUM};
`

const Address = styled(PlaceName)`
  font-family: ${SANS};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-feature-settings: 'zero' on;
`

type Props = {
  children?: React.ReactNode
  highlightPointOnHover?: boolean
  isActive?: boolean
  nodeId: string
  nodeLocationId: string
  onClick?: (id: string) => void
  placeName: ReactNode
  title: string
}

export const NodeListItem = ({
  children,
  highlightPointOnHover = false,
  isActive,
  nodeId,
  nodeLocationId,
  onClick,
  placeName,
  title,
  ...props
}: Props) => {
  const transition = useTransition(isActive, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  })

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mounted = true

    if (isActive) {
      setTimeout(function scrollReffedElementIntoView() {
        const { current: el } = ref

        if (!el || !mounted) {
          return
        }

        el.scrollIntoView({
          block: 'start',
          behavior: 'smooth',
        })
      }, 1000)
    }

    return () => {
      mounted = false
    }
  }, [isActive])

  const { mapRef } = useStore()

  return (
    <NodeElement
      {...props}
      ref={ref}
      theme={{
        clickable: !!onClick,
        isActive,
      }}
    >
      <TitleRow
        onClick={() => {
          onClick?.(nodeId)
        }}
        onMouseEnter={() => {
          if (highlightPointOnHover) {
            setNodeFeatureState(mapRef, nodeLocationId, { hover: true })
          }
        }}
        onMouseLeave={() => {
          if (highlightPointOnHover) {
            setNodeFeatureState(mapRef, nodeLocationId, { hover: false })
          }
        }}
      >
        <IconWrapper>
          <Identicon string={nodeId} size={20} />
        </IconWrapper>
        <Name>
          <strong>{title}</strong>
          <PlacenameOrAddress>
            {transition((style, item) =>
              item ? (
                <animated.div style={style}>
                  <Address title={nodeId}>{nodeId}</Address>
                </animated.div>
              ) : (
                <animated.div style={style}>
                  <PlaceName>{placeName}</PlaceName>
                </animated.div>
              ),
            )}
          </PlacenameOrAddress>
        </Name>
      </TitleRow>
      <Content>
        {transition(
          (style, item) => !!item && <animated.div style={style}>{children || null}</animated.div>,
        )}
      </Content>
    </NodeElement>
  )
}
