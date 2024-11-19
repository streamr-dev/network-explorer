import React, { useMemo } from 'react'
import Provider from 'streamr-client-react'
import { getStreamrClientConfig } from '../utils/streams'
import { useStore } from '../Store'

interface Props {
  children: React.ReactNode
}

const StreamrClientProvider = ({ children }: Props) => {
  const { chainId } = useStore()
  const config = useMemo(() => getStreamrClientConfig(chainId), [chainId])

  return <Provider {...config}>{children}</Provider>
}

export default StreamrClientProvider
