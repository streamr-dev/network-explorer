import React, { useCallback } from 'react'
import styled, { css } from 'styled-components'
import Identicon from 'react-identicons'
import { useTransition, animated } from 'react-spring'
import { SANS, MEDIUM } from '../../utils/styled'
import { truncate } from '../../utils/text'
import Stats from '../Stats'
import Graphs from '../Graphs'
import Error from '../Error'

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
  color: #ADADAD;
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
  nodeId: string
  title: string
  address: string,
  placeName: string
  onClick?: (id: string) => void
  isActive?: boolean
  children?: React.ReactNode
}

export const NodeListItem = ({
  nodeId,
  title,
  address,
  placeName,
  onClick: onClickProp,
  isActive,
  children,
  ...props
}: Props) => {
  const onClick = useCallback(() => {
    if (typeof onClickProp === 'function') {
      onClickProp(nodeId)
    }
  }, [onClickProp, nodeId])

  const transition = useTransition(isActive, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  })

  return (
    <NodeElement
      {...props}
      theme={{
        clickable: typeof onClickProp === 'function',
        isActive,
      }}
    >
      <TitleRow onClick={onClick}>
        <IconWrapper>
          <Identicon string={address} size={20} />
        </IconWrapper>
        <Name>
          <strong>{title}</strong>
          <PlacenameOrAddress>
            {transition((style, item) =>
              item ? (
                <animated.div style={style}>
                  <Address title={address}>{truncate(address)}</Address>
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
