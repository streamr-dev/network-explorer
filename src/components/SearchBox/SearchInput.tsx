import React from 'react'
import styled from 'styled-components/macro'

const Input = styled.input`
  width: 100%;
  height: 100%;
  margin: 0;
  border: 0;
  padding: 0;
  background: none;

  &:hover, &:focus {
    outline: none;
  }
`

const SearchInput = () => {
  return (
    <Input
      placeholder="Todo..."
    />
  )
}

export default SearchInput
