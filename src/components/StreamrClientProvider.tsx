import React, { useState } from 'react'
import Provider from 'streamr-client-react'
import { getStreamrClientConfig } from '../utils/streams'

interface Props {
  children: React.ReactNode
}

const StreamrClientProvider = ({ children }: Props) => {
  const [config] = useState(getStreamrClientConfig())

  return <Provider {...config}>{children}</Provider>
}

export default StreamrClientProvider
