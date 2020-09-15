import React, { useEffect } from 'react'
import { withRouter } from 'react-router-dom'

import { useMapState } from '../../contexts/MapState'

type StreamProps = {
  id: string,
}

const Stream = ({ id }: StreamProps) => {
  const { setNodes } = useMapState()

  useEffect(() => {
    if (id === '123') {
      setNodes([
        {
          id: 1,
          latitude: 60.15952,
          longitude: 24.93545,
        },
        {
          id: 2,
          latitude: 60.15852,
          longitude: 24.94545,
        },
        {
          id: 3,
          latitude: 60.18952,
          longitude: 24.91545,
        },
        {
          id: 4,
          latitude: 60.19952,
          longitude: 24.92545,
        },
        {
          id: 5,
          latitude: 60.17952,
          longitude: 24.92545,
        },
      ])
    } else {
      setNodes([
        {
          id: 1,
          latitude: 30.15952,
          longitude: 54.93545,
        },
        {
          id: 2,
          latitude: 30.15852,
          longitude: 54.94545,
        },
      ])
    }
  }, [setNodes, id])

  return null
}

export default withRouter(({ match }) => {
  const { params: { id } } = match || {}

  if (!id) {
    return null
  }

  return <Stream id={id} key={id} />
})
