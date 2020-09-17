import React, { useCallback, ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components/macro'

import { useLoading } from '../../contexts/Loading'

const DebugWrapper = styled.div`
  position: fixed;
  bottom: 40px;
  left: 40px;
  width: 200px;
  height: 200px;
  padding: 10px;
  background: white;
`

const Debug = () => {
  const { loading, setLoading } = useLoading()
  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLoading(e.target.checked)
  }, [setLoading])

  return (
    <DebugWrapper>
      <Link to="/">Top</Link>
      <br />
      <Link to="/streams/123">stream 1</Link>
      <br />
      <Link to="/streams/456">stream 2</Link>
      <br />
      <Link to="/nodes/abc">node 1</Link>
      <br />
      <br />
      <input type="checkbox" onChange={onChange} checked={loading} /> loading
    </DebugWrapper>
  )
}

export default Debug
