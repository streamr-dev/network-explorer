import React, { useEffect } from 'react'
import { withRouter } from 'react-router-dom'

import { useNodes } from '../../contexts/Nodes'

type NodeProps = {
  id: string,
}

const Node = ({ id }: NodeProps) => {
  const { setVisibleNodes } = useNodes()

  useEffect(() => {
    setVisibleNodes([1, 2, 3, 4])
  }, [setVisibleNodes, id])

  return null
}

export default withRouter(({ match }) => {
  const { params: { id } } = match || {}

  if (!id) {
    return null
  }

  return <Node id={id} key={id} />
})
