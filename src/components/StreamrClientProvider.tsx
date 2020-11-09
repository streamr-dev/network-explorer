import React from 'react'
import Provider from 'streamr-client-react'

const clientConfig = {
  autoConnect: true,
  autoDisconnect: false,
  // restUrl: process.env.STREAMR_API_URL,
  // url: process.env.STREAMR_WS_URL,
  verifySignatures: 'never',
}

interface Props  {
  children: React.ReactNode
}

const StreamrClientProvider = ({ children }: Props) => (
  <Provider {...clientConfig}>
    {children}
  </Provider>
)

export default StreamrClientProvider
