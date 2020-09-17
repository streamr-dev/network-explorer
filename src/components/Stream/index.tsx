import React, { useEffect } from 'react'
import { withRouter } from 'react-router-dom'

import { useNodes } from '../../contexts/Nodes'

type StreamProps = {
  id: string,
}

const Stream = ({ id }: StreamProps) => {
  const { setVisibleNodes } = useNodes()

  useEffect(() => {
    if (id === '123') {
      setVisibleNodes([5, 6, 7, 8, 9])
    } else {
      setVisibleNodes([10, 11])
    }
  }, [setVisibleNodes, id])

  return null
}

export default withRouter(({ match }) => {
  const { params: { id } } = match || {}

  if (!id) {
    return null
  }

  return <Stream id={id} key={id} />
})
