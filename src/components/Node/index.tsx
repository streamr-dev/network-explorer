import React, { useEffect } from 'react'
import { withRouter } from 'react-router-dom'

import { useMapState } from '../../contexts/MapState'

type NodeProps = {
  id: string,
}

const Node = ({ id }: NodeProps) => {
  const { setNodes } = useMapState()

  useEffect(() => {
    setNodes([
      {
        id: 1,
        latitude: 20.15952,
        longitude: 44.93545,
      },
      {
        id: 2,
        latitude: 20.15852,
        longitude: 44.94545,
      },
      {
        id: 3,
        latitude: 20.18952,
        longitude: 44.91545,
      },
      {
        id: 4,
        latitude: 20.19952,
        longitude: 44.92545,
      },
    ])
  }, [setNodes, id])

  return null
}

export default withRouter(({ match }) => {
  const { params: { id } } = match || {}

  if (!id) {
    return null
  }

  return <Node id={id} key={id} />
})
