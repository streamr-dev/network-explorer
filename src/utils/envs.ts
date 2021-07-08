type TrackerConfig =
  | {
    source: 'contract'
    contractAddress: string
    jsonRpcProvider: string
  }
  | {
    source: 'http'
    http: string
  }

export type EnvConfig = {
  tracker: TrackerConfig
  streamr: {
    http: string
    ws: string
  }
}

type Envs = Record<string, EnvConfig>

const envs: Envs = {
  'mock-api': {
    tracker: {
      source: 'http',
      http: process.env.REACT_APP_MOCK_API_URL || '',
    },
    streamr: {
      http: process.env.REACT_APP_MOCK_API_URL || '',
      ws: process.env.REACT_APP_MOCK_API_URL || '',
    },
  },
  local: {
    tracker: {
      source: 'contract',
      contractAddress: process.env.REACT_APP_TRACKER_REGISTRY_ADDRESS || '',
      jsonRpcProvider: process.env.REACT_APP_TRACKER_REGISTRY_PROVIDER || '',
    },
    streamr: {
      http: process.env.REACT_APP_STREAMR_API_URL || '',
      ws: process.env.REACT_APP_STREAMR_WS_URL || '',
    },
  },
  production: {
    tracker: {
      source: 'contract',
      contractAddress: '0xb21df4018dee577cd33f5b99f269ea7b23b8e6eb',
      jsonRpcProvider: 'https://mainnet.infura.io/v3/17c3985baecb4c4d94a1edc2c4d23206',
    },
    streamr: {
      http: 'https://streamr.network/api/v1',
      ws: 'wss://streamr.network/api/v1/ws',
    },
  },
}

export default envs
