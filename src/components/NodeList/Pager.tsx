import React, { useCallback } from 'react'
import styled from 'styled-components'

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

const Partition = styled.div`
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

const PartitionIcon = () => (
  <svg width="21" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path stroke="#323232" strokeWidth="1.5" strokeLinecap="round" d="M.75 8.031h4.078M10.313 8.033h8.937" />
    <circle cx="7.703" cy="8.158" r="2.5" transform="rotate(-90 7.703 8.158)" stroke="#323232" strokeWidth="1.5" />
    <path d="M19.375 1.49h-6.042c-4.21 0-5.297 3.038-5.556 4.165M19.375 14.824h-6.042c-4.059 0-5.215-2.824-5.524-4.037M19.375 4.824h-6.888c-1.5 0-2.496.714-3.085 1.348M19.375 11.523h-6.888c-1.532 0-2.538-.743-3.12-1.386" stroke="#323232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

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
      <Partition>
        <PartitionIcon />
      </Partition>
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

  ${Partition}, ${Icon} {
    width: 32px;
    height: 32px;
  }

  > * + * {
    margin-left: 16px;
  }
`

export default Pager
