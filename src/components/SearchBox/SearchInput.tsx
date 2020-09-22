/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react'
import styled from 'styled-components/macro'

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 32px;
  width: 100%;
  height: 100%;
  padding: 0 16px 0 24px;
  box-sizing: border-box;
`

const Input = styled.input`
  margin: 0;
  border: 0;
  background: none;
  font-weight: 500;
  font-size: 16px;
  line-height: 21px;

  &::placeholder {
    color: #CDCDCD;
  }

  &:hover, &:focus {
    outline: none;
  }
`

const InputLabel = styled.label`
  display: grid;

  svg {
    width: 18px;
    height: 18px;
    align-self: center;
    justify-self: center;
  }
`

const SearchIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.6412 13.4832C13.371 12.3231 14.6435 9.1696 13.4833 6.43976C12.3232 3.70993 9.16972 2.43745 6.43988 3.5976C3.71004 4.75775 2.43756 7.91121 3.59771 10.6411C4.75787 13.3709 7.91133 14.6434 10.6412 13.4832Z" stroke="#B8B8B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.3379 12.3379L16.5032 16.5038" stroke="#B8B8B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

type Props = {
  onChange: (text: string) => void,
}

const SearchInput = ({ onChange }: Props) => {
  return (
    <Container>
      <Input
        id="input"
        placeholder="Search Streamr Network"
        onChange={(e) => onChange(e.target.value)}
      />
      <InputLabel htmlFor="input">
        <SearchIcon />
      </InputLabel>
    </Container>
  )
}

export default SearchInput
