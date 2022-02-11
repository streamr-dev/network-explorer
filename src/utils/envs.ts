import { SmartContractRecord } from 'streamr-client-protocol'

type TrackerConfig =
  | {
    source: 'contract'
    contractAddress: string
    jsonRpcProvider: string
  }
  | {
    source: 'http'
    trackers: SmartContractRecord[]
  }

export type StreamrConfig = {
  http: string
}

export type EnvConfig = {
  title: string,
  tracker: TrackerConfig
  streamr: Array<StreamrConfig>
}

export type EnvConfigResult = {
  title: string,
  tracker: TrackerConfig
  streamr: StreamrConfig
}

type Envs = Record<string, EnvConfig>

const envs: Envs = {
  /* mainnet: {
    tracker: {
      source: 'contract',
      contractAddress: '0xb21df4018dee577cd33f5b99f269ea7b23b8e6eb',
      jsonRpcProvider: 'https://mainnet.infura.io/v3/17c3985baecb4c4d94a1edc2c4d23206',
    },
    streamr: [{
      http: 'https://streamr.network/api/v1',
      ws: 'wss://streamr.network/api/v1/ws',
    }],
  }, */
  brubeck: {
    title: 'Brubeck',
    tracker: {
      source: 'http',
      trackers: [
        {
          id: '0xFBB6066c44bc8132bA794C73f58F391273E3bdA1',
          ws: 'wss://brubeck3.streamr.network:30401',
          http: 'https://brubeck3.streamr.network:30401',
        },
        {
          id: '0x3D61bFeFA09CEAC1AFceAA50c7d79BE409E1ec24',
          ws: 'wss://brubeck3.streamr.network:30402',
          http: 'https://brubeck3.streamr.network:30402',
        },
        {
          id: '0xE80FB5322231cBC1e761A0F896Da8E0CA2952A66',
          ws: 'wss://brubeck3.streamr.network:30403',
          http: 'https://brubeck3.streamr.network:30403',
        },
        {
          id: '0xf626285C6AACDE39ae969B9Be90b1D9855F186e0',
          ws: 'wss://brubeck3.streamr.network:30404',
          http: 'https://brubeck3.streamr.network:30404',
        },
        {
          id: '0xce88Da7FE0165C8b8586aA0c7C4B26d880068219',
          ws: 'wss://brubeck3.streamr.network:30405',
          http: 'https://brubeck3.streamr.network:30405',
        },
        {
          id: '0x05e7a0A64f88F84fB1945a225eE48fFC2c48C38E',
          ws: 'wss://brubeck4.streamr.network:30401',
          http: 'https://brubeck4.streamr.network:30401',
        },
        {
          id: '0xF15784106ACd35b0542309CDF2b35cb5BA642C4F',
          ws: 'wss://brubeck4.streamr.network:30402',
          http: 'https://brubeck4.streamr.network:30402',
        },
        {
          id: '0x77FA7Af34108abdf8e92B8f4C4AeC7CbfD1d6B09',
          ws: 'wss://brubeck4.streamr.network:30403',
          http: 'https://brubeck4.streamr.network:30403',
        },
        {
          id: '0x7E83e0bdAF1eF06F31A02f35A07aFB48179E536B',
          ws: 'wss://brubeck4.streamr.network:30404',
          http: 'https://brubeck4.streamr.network:30404',
        },
        {
          id: '0x2EeF37180691c75858Bf1e781D13ae96943Dd388',
          ws: 'wss://brubeck4.streamr.network:30405',
          http: 'https://brubeck4.streamr.network:30405',
        },
      ],
    },
    streamr: [{
      http: 'https://streamr.network/api/v2',
    }],
  },
  testnet3: {
    title: 'Testnet 3',
    tracker: {
      source: 'http',
      trackers: [{
        id: '0xFBB6066c44bc8132bA794C73f58F391273E3bdA1',
        ws: 'wss://testnet3.streamr.network:30401',
        http: 'https://testnet3.streamr.network:30401',
      },
      {
        id: '0x3D61bFeFA09CEAC1AFceAA50c7d79BE409E1ec24',
        ws: 'wss://testnet3.streamr.network:30402',
        http: 'https://testnet3.streamr.network:30402',
      },
      {
        id: '0xE80FB5322231cBC1e761A0F896Da8E0CA2952A66',
        ws: 'wss://testnet3.streamr.network:30403',
        http: 'https://testnet3.streamr.network:30403',
      },
      {
        id: '0xf626285C6AACDE39ae969B9Be90b1D9855F186e0',
        ws: 'wss://testnet3.streamr.network:30404',
        http: 'https://testnet3.streamr.network:30404',
      },
      {
        id: '0xce88Da7FE0165C8b8586aA0c7C4B26d880068219',
        ws: 'wss://testnet3.streamr.network:30405',
        http: 'https://testnet3.streamr.network:30405',
      },
      {
        id: '0x05e7a0A64f88F84fB1945a225eE48fFC2c48C38E',
        ws: 'wss://testnet4.streamr.network:30401',
        http: 'https://testnet4.streamr.network:30401',
      },
      {
        id: '0xF15784106ACd35b0542309CDF2b35cb5BA642C4F',
        ws: 'wss://testnet4.streamr.network:30402',
        http: 'https://testnet4.streamr.network:30402',
      },
      {
        id: '0x77FA7Af34108abdf8e92B8f4C4AeC7CbfD1d6B09',
        ws: 'wss://testnet4.streamr.network:30403',
        http: 'https://testnet4.streamr.network:30403',
      },
      {
        id: '0x7E83e0bdAF1eF06F31A02f35A07aFB48179E536B',
        ws: 'wss://testnet4.streamr.network:30404',
        http: 'https://testnet4.streamr.network:30404',
      },
      {
        id: '0x2EeF37180691c75858Bf1e781D13ae96943Dd388',
        ws: 'wss://testnet4.streamr.network:30405',
        http: 'https://testnet4.streamr.network:30405',
      }],
    },
    streamr: [{
      http: 'https://streamr.network/api/v1',
    }],
  },
}

export default envs
