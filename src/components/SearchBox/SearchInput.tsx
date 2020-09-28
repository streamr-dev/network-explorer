/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useRef } from 'react'
import styled from 'styled-components/macro'

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 56px;
  width: 100%;
  height: 100%;
  padding: 0;
  box-sizing: border-box;
`

const Input = styled.input`
  margin: 0;
  border: 0;
  padding: 0;
  padding-left: 24px;
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

const ButtonWrapper = styled.div`
    align-self: center;
    justify-self: center;
`

const ClearButton = styled.button`
  appearance: none;
  border: none;
  background: none;
  display: grid;
  margin: 0;
  padding: 6px;
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
  }
`

const SearchIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.6412 13.4832C13.371 12.3231 14.6435 9.1696 13.4833 6.43976C12.3232 3.70993 9.16972 2.43745 6.43988 3.5976C3.71004 4.75775 2.43756 7.91121 3.59771 10.6411C4.75787 13.3709 7.91133 14.6434 10.6412 13.4832Z" stroke="#B8B8B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.3379 12.3379L16.5032 16.5038" stroke="#B8B8B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ClearIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 16A8 8 0 108 0a8 8 0 000 16z" fill="#CDCDCD" />
    <path d="M5.455 5.454l5.09 5.091M10.545 5.454l-5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

type Props = {
  value: string,
  onChange: (text: string) => void,
  onClear: () => void,
  onFocus?: Function,
  onBlur?: Function,
  disabled?: boolean,
}

const SearchInput = ({
  value,
  onChange,
  onClear,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  disabled = false,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const onFocus = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.select()
    }

    if (onFocusProp) {
      onFocusProp()
    }
  }, [onFocusProp])

  const onBlur = useCallback(() => {
    if (onBlurProp) {
      onBlurProp()
    }
  }, [onBlurProp])

  return (
    <Container>
      <Input
        id="input"
        placeholder="Search Streamr Network"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!!disabled}
        autoComplete="off"
        ref={inputRef}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {!value && (
        <InputLabel htmlFor="input">
          <SearchIcon />
        </InputLabel>
      )}
      {!!value && (
        <ButtonWrapper>
          <ClearButton type="button" onClick={onClear}>
            <ClearIcon />
          </ClearButton>
        </ButtonWrapper>
      )}
    </Container>
  )
}

export default SearchInput
