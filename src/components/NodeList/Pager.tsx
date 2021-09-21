import React, { useCallback } from 'react'
import styled from 'styled-components'

import { ConnectionIcon } from '../Map/NavigationControl'
import { SANS, MEDIUM, BOLD } from '../../utils/styled'

const Title = styled.div`
  font-size: 14px;
  font-family: ${SANS};
  font-weight: ${MEDIUM};

  strong {
    font-weight: ${BOLD};
  }
`

const Icon = styled.button`
  position: relative;
  cursor: pointer;
  appearance: none;
  border: 0;
  background: none;
  outline: none;
  border-radius: 4px;
  transition: opacity 180ms ease-in-out;

  svg {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  :hover,
  :focus-within {
    background-color: #F8F8F8;
  }

  :active {
    background-color: #EFEFEF;
  }

  :disabled {
      cursor: not-allowed;
      opacity: 0.5;
  }
`

const Connection = styled.div`
  background-color: #F8F8F8;
  border-radius: 4px;
  position: relative;

  svg {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
`

const LeftArrow = () => (
  <svg width="13" height="10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.557 5h10M5 9 1 5l4-4" stroke="#323232" strokeLinecap="round" />
  </svg>
)

const RightArrow = () => (
  <svg width="13" height="10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 5H1M7.557 9l4-4-4-4" stroke="#323232" strokeLinecap="round" />
  </svg>
)

type Props = {
  currentPage: number,
  lastPage: number,
  onChange: Function
}

const UnstyledPager = ({
  currentPage,
  lastPage,
  onChange: onChangeProp,
  ...props
}: Props) => {
  const onChange = useCallback((...args) => {
    if (typeof onChangeProp === 'function') {
      onChangeProp(...args)
    }
  }, [onChangeProp])

  return (
    <div {...props}>
      <Connection>
        <ConnectionIcon />
      </Connection>
      <Title>
        Page <strong>{currentPage} of {lastPage}</strong>
      </Title>
      <Icon
        type="button"
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <LeftArrow />
      </Icon>
      <Icon
        type="button"
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage === lastPage}
      >
        <RightArrow />
      </Icon>
    </div>
  )
}

const Pager = styled(UnstyledPager)`
  background: #ffffff;
  border: 1px solid #f5f5f5;
  border-radius: 4px;
  height: 64px;
  padding: 0 16px;
  display: flex;
  align-items: center;

  ${Title} {
    flex: 1;
  }

  ${Connection}, ${Icon} {
    width: 32px;
    height: 32px;
  }

  > * + * {
    margin-left: 16px;
  }
`

export default Pager
