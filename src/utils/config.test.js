import getConfig, { getEnvironment, setEnvironment, APP_ENV_KEY } from './config'

import envs from './envs'

jest.mock('./envs', () => ({
  local: {
    title: 'local',
    tracker: 'localTracker',
    streamr: ['localStreamr'],
  },
  staging: {
    title: 'staging',
    tracker: 'stagingTracker',
    streamr: ['stagingStreamr'],
  },
  production: {
    title: 'production',
    tracker: 'prodTracker',
    streamr: ['prodStreamr'],
  },
}))

describe('config', () => {
  let defaultEnv

  beforeEach(() => {
    defaultEnv = process.env.REACT_APP_DEFAULT_ENV
    global.localStorage.clear()
  })

  afterEach(() => {
    process.env.REACT_APP_DEFAULT_ENV = defaultEnv
  })

  afterAll(() => {
    global.localStorage.clear()
  })

  describe('getEnvironment', () => {
    it('returns default environment if localstorage not set', () => {
      process.env.REACT_APP_DEFAULT_ENV = 'staging'

      expect(getEnvironment()).toStrictEqual('staging')
      expect(global.localStorage[APP_ENV_KEY]).toStrictEqual(undefined)
    })

    it('returns default value if localstorage is not part of defined envs', () => {
      process.env.REACT_APP_DEFAULT_ENV = 'staging'
      global.localStorage.setItem(APP_ENV_KEY, JSON.stringify('someOtherValue'))

      expect(getEnvironment()).toStrictEqual('staging')
      expect(global.localStorage[APP_ENV_KEY]).toStrictEqual(undefined)
    })

    it('returns default value if localstorage is not part of defined envs', () => {
      process.env.REACT_APP_DEFAULT_ENV = 'staging'
      global.localStorage.setItem(APP_ENV_KEY, 'bad JSON')

      expect(getEnvironment()).toStrictEqual('staging')
      expect(global.localStorage[APP_ENV_KEY]).toStrictEqual(undefined)
    })
  })

  describe('setEnvironment', () => {
    it('sets the value to localstorage', () => {
      setEnvironment('someOtherValue')

      expect(global.localStorage.getItem(APP_ENV_KEY)).toStrictEqual(JSON.stringify('someOtherValue'))
    })
  })

  describe('getConfig', () => {
    it('gets default env config (no env flag)', () => {
      process.env.REACT_APP_DEFAULT_ENV = ''

      expect(getConfig()).toStrictEqual({
        title: 'local',
        tracker: 'localTracker',
        streamr: 'localStreamr',
      })
    })

    it('gets default env config (env flag)', () => {
      process.env.REACT_APP_DEFAULT_ENV = 'production'

      expect(getConfig()).toStrictEqual({
        title: 'production',
        tracker: 'prodTracker',
        streamr: 'prodStreamr',
      })
    })

    it('gets default env config (localstorage)', () => {
      process.env.REACT_APP_DEFAULT_ENV = 'production'
      setEnvironment('staging')

      expect(getConfig()).toStrictEqual({
        title: 'staging',
        tracker: 'stagingTracker',
        streamr: 'stagingStreamr',
      })
    })

    it('returns the given env', () => {
      process.env.REACT_APP_DEFAULT_ENV = 'production'
      setEnvironment('staging')

      expect(getConfig({ env: 'local' }).title).toStrictEqual('local')
      expect(getConfig({ env: 'staging' }).title).toStrictEqual('staging')
      expect(getConfig({ env: 'production' }).title).toStrictEqual('production')
    })

    it('selects streamr config at random', () => {
      const config = {
        title: 'mainnet',
        tracker: {
          source: 'contract',
          contractAddress: '0xb21df4018dee577cd33f5b99f269ea7b23b8e6eb',
          jsonRpcProvider: 'https://mainnet.infura.io/v3/17c3985baecb4c4d94a1edc2c4d23206',
        },
        streamr: [{
          http: 'https://streamr.network/api/v1',
          ws: 'wss://streamr.network/api/v1/ws',
        }, {
          http: 'https://streamr.network/api/v2',
          ws: 'wss://streamr.network/api/v2/ws',
        }],
      }

      const oldEnvs = envs

      Object.defineProperty(envs, 'production', {
        get: () => config,
      })

      const result = getConfig({ env: 'production', reload: true })

      expect([{
        title: 'mainnet',
        tracker: {
          source: 'contract',
          contractAddress: '0xb21df4018dee577cd33f5b99f269ea7b23b8e6eb',
          jsonRpcProvider: 'https://mainnet.infura.io/v3/17c3985baecb4c4d94a1edc2c4d23206',
        },
        streamr: {
          http: 'https://streamr.network/api/v1',
          ws: 'wss://streamr.network/api/v1/ws',
        },
      }, {
        title: 'mainnet',
        tracker: {
          source: 'contract',
          contractAddress: '0xb21df4018dee577cd33f5b99f269ea7b23b8e6eb',
          jsonRpcProvider: 'https://mainnet.infura.io/v3/17c3985baecb4c4d94a1edc2c4d23206',
        },
        streamr: {
          http: 'https://streamr.network/api/v2',
          ws: 'wss://streamr.network/api/v2/ws',
        },
      }]).toContainEqual(result)

      // expect to get the same thing again
      expect(getConfig({ env: 'production' })).toStrictEqual(result)

      Object.defineProperties(envs, oldEnvs)
    })
  })
})
