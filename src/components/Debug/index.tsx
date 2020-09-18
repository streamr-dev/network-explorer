import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components/macro'

import { useAllPending } from '../../contexts/Pending'
import { useNodes } from '../../contexts/Nodes'

const DebugWrapper = styled.div`
  position: fixed;
  bottom: 40px;
  left: 40px;
  width: 300px;
  padding: 10px;
  background: white;
  font-size: 12px;
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
  const { nodes, visibleNodes, nodeConnections } = useNodes()

  return (
    <DebugWrapper>
      <Link to="/">Top</Link>
      <br />
      <Link to="/streams/1Llar67vQnSqEq8Dwr_hRQ">stream 1Llar67vQnSqEq8Dwr_hRQ</Link>
      <br />
      <Link to="/streams/x5KBQw5eRKWl5OIjEr1_3A">stream x5KBQw5eRKWl5OIjEr1_3A</Link>
      <br />
      <br />
      <Variables>
        {JSON.stringify({
          pending,
          visibleNodes,
          nodeConnections,
          nodes,
        }, null, 2)}
      </Variables>
    </DebugWrapper>
  )
}

export default Debug
