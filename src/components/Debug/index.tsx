import React from 'react'
import styled from 'styled-components/macro'

import { useAllPending } from '../../contexts/Pending'
import { useStore } from '../../contexts/Store'

import ControlBox from '../ControlBox'

const Wrapper = styled.div`
  padding: 16px;
`

const Variables = styled.pre`
  overflow: scroll;
  display: block;
  height: 200px;
  font-size: 8px;
  background-color: #EFEFEF;
  padding: 5px 10px;
`

const Debug = () => {
  const { pending } = useAllPending()
  const { store } = useStore()

  return (
    <ControlBox>
      <Wrapper>
        <Variables>
          {JSON.stringify({
            pending,
            store,
          }, null, 2)}
        </Variables>
      </Wrapper>
    </ControlBox>
  )
}

export default Debug
