import React from 'react'
import styled from 'styled-components/macro'

import { useAllPending } from '../../contexts/Pending'
import { useNodes } from '../../contexts/Nodes'
import { useTopology } from '../../contexts/Topology'
import { useStream } from '../../contexts/Stream'

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
  const { nodes } = useNodes()
  const { visibleNodes, topology } = useTopology()
  const { stream } = useStream()

  return (
    <ControlBox>
      <Wrapper>
        <Variables>
          {JSON.stringify({
            pending,
            visibleNodes,
            topology,
            stream,
            nodes,
          }, null, 2)}
        </Variables>
      </Wrapper>
    </ControlBox>
  )
}

export default Debug
