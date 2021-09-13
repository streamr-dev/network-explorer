type TrackerConfig =
  | {
    source: 'contract'
    contractAddress: string
    jsonRpcProvider: string
  }
  | {
    source: 'http'
    http: string[]
  }

export type EnvConfig = {
  title: string,
  tracker: TrackerConfig
  streamr: {
    http: string
    ws: string
  }
}

type Envs = Record<string, EnvConfig>

const envs: Envs = {
  /* mainnet: {
    tracker: {
      source: 'contract',
      contractAddress: '0xb21df4018dee577cd33f5b99f269ea7b23b8e6eb',
      jsonRpcProvider: 'https://mainnet.infura.io/v3/17c3985baecb4c4d94a1edc2c4d23206',
    },
    streamr: {
      http: 'https://streamr.network/api/v1',
      ws: 'wss://streamr.network/api/v1/ws',
    },
  }, */
  testnet1: {
    title: 'Testnet 1',
    tracker: {
      source: 'http',
      http: [
        'https://testnet1.streamr.network:30300',
      ],
    },
    streamr: {
      http: 'https://streamr.network/api/v1',
      ws: 'wss://testnet1.streamr.network:7001',
    },
  },
  testnet2: {
    title: 'Testnet 2',
    tracker: {
      source: 'http',
      http: [
        'https://testnet3.streamr.network:30401',
        'https://testnet3.streamr.network:30402',
        'https://testnet3.streamr.network:30403',
        'https://testnet3.streamr.network:30404',
        'https://testnet3.streamr.network:30405',
        'https://testnet4.streamr.network:30401',
        'https://testnet4.streamr.network:30402',
        'https://testnet4.streamr.network:30403',
        'https://testnet4.streamr.network:30404',
        'https://testnet4.streamr.network:30405',
      ],
    },
    streamr: {
      http: 'https://streamr.network/api/v1',
      ws: 'wss://testnet1.streamr.network:7006',
    },
  },
  /* local: {
    tracker: {
      source: 'contract',
      contractAddress: process.env.REACT_APP_TRACKER_REGISTRY_ADDRESS || '',
      jsonRpcProvider: process.env.REACT_APP_TRACKER_REGISTRY_PROVIDER || '',
    },
    streamr: {
      http: process.env.REACT_APP_STREAMR_API_URL || '',
      ws: process.env.REACT_APP_STREAMR_WS_URL || '',
    },
  }, */
}

export default envs
