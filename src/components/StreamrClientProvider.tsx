import React from 'react'
import Provider from 'streamr-client-react'

interface Props {
  children: React.ReactNode
}

const StreamrClientProvider = ({ children }: Props) => {
  return <Provider>{children}</Provider>
}

export default StreamrClientProvider
