import React from 'react'
import styled from 'styled-components/macro'

import { useAllPending } from '../../contexts/Pending'
import { useStore } from '../../contexts/Store'
import { useController } from '../../contexts/Controller'
import envs from '../../utils/envs'

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

const EnvSelect = styled.label`
  display: flex;
  flex-direction: row;
  margin-bottom: 16px;

  span {
    margin-right: 16px;
    flex-grow: 1;
  }

  select {
    flex-grow: 1;
  }
`

const Debug = () => {
  const { pending } = useAllPending()
  const { env: selectedEnv, store } = useStore()
  const { changeEnv } = useController()

  return (
    <ControlBox>
      <Wrapper>
        <EnvSelect htmlFor="env">
          <span>Selected env:</span>
          <select
            name="env"
            value={selectedEnv}
            onChange={(e) => changeEnv(e.currentTarget.value)}
          >
            {Object.keys(envs).map((env) => (
              <option key={env} value={env}>
                {env}
              </option>
            ))}
          </select>
        </EnvSelect>
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
