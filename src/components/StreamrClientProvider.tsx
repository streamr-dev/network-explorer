import React, { useMemo } from 'react'
import Provider from 'streamr-client-react'
import getConfig from '../utils/config'
import { useStore } from '../hooks/useStore'

interface Props {
  children: React.ReactNode
}

const StreamrClientProvider = ({ children }: Props) => {
  const { env } = useStore()
  const clientConfig = useMemo(() => {
    const { http } = getConfig().streamr

    return {
      autoConnect: true,
      autoDisconnect: false,
      restUrl: http,
      verifySignatures: 'never',
    }
  }, [env]) // eslint-disable-line react-hooks/exhaustive-deps

  return <Provider {...clientConfig}>{children}</Provider>
}

export default StreamrClientProvider
