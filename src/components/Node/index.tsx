import React from 'react'
import { withRouter } from 'react-router-dom'

type NodeProps = {
  id: string,
}

const Node = ({ id }: NodeProps) => {
  return null
}

export default withRouter(({ match }) => {
  const { params: { id } } = match || {}

  if (!id) {
    return null
  }

  return <Node id={id} key={id} />
})
