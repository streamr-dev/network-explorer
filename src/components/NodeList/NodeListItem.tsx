import React, { useCallback } from 'react'
import styled, { css } from 'styled-components/macro'
import Identicon from 'react-identicons'

import { MONO, MEDIUM } from '../../utils/styled'
import { truncate } from '../../utils/text'
import Stats from '../Stats'
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
`

const IconWrapper = styled.div``

const NodeElement = styled.div`
  background: #FFFFFF;
  border: 1px solid #F5F5F5;
  border-radius: 4px;

  & + & {
    margin-top: 12px;
  }

  ${IconWrapper} {
    margin: 0 4px;
  }

  ${Name} {
    margin-left: 20px;
  }

  ${Stats},
  ${Error} {
    border-top: 1px solid #F5F5F5;
  }

  ${({ theme }) => !!theme.clickable && css`
    ${TitleRow} {
      cursor: pointer;

      :hover {
        background: #F8F8F8;
      }
    }
  `}
`

const PlaceName = styled.div`
  font-size: 10px;
  align-items: center;
  color: #ADADAD;
  margin-top: 2px;
  font-weight: ${MEDIUM};
`

const Address = styled(PlaceName)`
  font-family: ${MONO};
  letter-spacing: 0.05em;
`

type Props = {
  nodeId: string,
  title: string,
  placeName: string,
  onClick?: (id: string) => void,
  showAddress?: boolean,
  children?: React.ReactNode,
}

const NodeListItem = ({
  nodeId,
  title,
  placeName,
  onClick: onClickProp,
  showAddress,
  children,
  ...props
}: Props) => {
  const onClick = useCallback(() => {
    if (typeof onClickProp === 'function') {
      onClickProp(nodeId)
    }
  }, [onClickProp, nodeId])

  return (
    <NodeElement {...props} theme={{ clickable: typeof onClickProp === 'function' }}>
      <TitleRow onClick={onClick}>
        <IconWrapper>
          <Identicon
            string={nodeId}
            size={20}
          />
        </IconWrapper>
        <Name>
          <strong>{title}</strong>
          {!showAddress && (
            <PlaceName>{placeName}</PlaceName>
          )}
          {!!showAddress && (
            <Address title={nodeId}>{truncate(nodeId)}</Address>
          )}
        </Name>
      </TitleRow>
      {children || null}
    </NodeElement>
  )
}

export default NodeListItem
