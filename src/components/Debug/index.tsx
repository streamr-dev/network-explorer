import React from 'react'
import { Link } from 'react-router-dom'
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
  const { visibleNodes, nodeConnections } = useTopology()
  const { stream } = useStream()

  return (
    <ControlBox>
      <Wrapper>
        <Link to="/streams/7wa7APtlTq6EC5iTCBy6dw">Helsinki trams</Link>
        <br />
        <Link to="/streams/7rn4Cav8R3uudiwEltwqdQ">Twitter Firehose Sample</Link>
        <br />
        <Variables>
          {JSON.stringify({
            pending,
            visibleNodes,
            nodeConnections,
            stream,
            nodes,
          }, null, 2)}
        </Variables>
      </Wrapper>
    </ControlBox>
  )
}

export default Debug
