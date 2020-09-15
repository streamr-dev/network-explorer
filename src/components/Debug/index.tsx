import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

const DebugWrapper = styled.div`
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 200px;
  height: 200px;
  padding: 10px;
  background: white;
`

const Debug = () => (
  <DebugWrapper>
    <Link to="/">Top</Link>
    <br />
    <Link to="/streams/123">stream 1</Link>
    <br />
    <Link to="/streams/456">stream 2</Link>
    <br />
    <Link to="/nodes/abc">node 1</Link>
  </DebugWrapper>
)

export default Debug
