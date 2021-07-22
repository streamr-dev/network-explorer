import React from 'react'
import styled from 'styled-components/macro'

type Props = {
  children: React.ReactNode
}

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 16px;
    height: 16px;
  }
`

const Message = styled.div`
  font-size: 12px;
  color: #adadad;
  margin-right: 16px;
  padding: 8px 0;
`

type IconProps = {}

const UnstyledErrorIcon = (props: IconProps) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M8 16A8 8 0 108 0a8 8 0 000 16z" fill="#ADADAD" />
    <path
      d="M8 9.249v-5.25"
      stroke="#fff"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 11.65v-.042"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ErrorIcon = styled(UnstyledErrorIcon)``

const UnstyledError = ({ children, ...props }: Props) => (
  <div {...props}>
    <IconWrapper>
      <ErrorIcon />
    </IconWrapper>
    <Message>{children || null}</Message>
  </div>
)

const Error = styled(UnstyledError)`
  background-color: #f8f8f8;
  min-height: 32px;
  display: flex;
  flex-direction: row;
  align-items: center;

  ${IconWrapper} {
    width: 64px;
  }

  ${Message} {
    width: 100%;
  }
`

export default Error
