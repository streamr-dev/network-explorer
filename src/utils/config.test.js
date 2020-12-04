import getConfig, { getEnvironment, setEnvironment, APP_ENV_KEY } from './config'

jest.mock('./envs', () => ({
  local: 'local',
  staging: 'staging',
  production: 'production',
}))

describe('config', () => {
  let defaultEnv

  beforeEach(() => {
    defaultEnv = process.env.DEFAULT_ENV
    global.localStorage.clear()
  })

  afterEach(() => {
    process.env.DEFAULT_ENV = defaultEnv
  })

  afterAll(() => {
    global.localStorage.clear()
  })

  describe('getEnvironment', () => {
    it('returns default environment if localstorage not set', () => {
      process.env.DEFAULT_ENV = 'staging'

      expect(getEnvironment()).toStrictEqual('staging')
    })

    it('returns value from localstorage', () => {
      process.env.DEFAULT_ENV = 'staging'
      global.localStorage.setItem(APP_ENV_KEY, JSON.stringify('someOtherValue'))

      expect(getEnvironment()).toStrictEqual('someOtherValue')
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
      process.env.DEFAULT_ENV = ''

      expect(getConfig()).toStrictEqual('local')
    })

    it('gets default env config (env flag)', () => {
      process.env.DEFAULT_ENV = 'production'

      expect(getConfig()).toStrictEqual('production')
    })

    it('gets default env config (localstorage)', () => {
      process.env.DEFAULT_ENV = 'production'
      setEnvironment('staging')

      expect(getConfig()).toStrictEqual('staging')
    })

    it('returns the given env', () => {
      process.env.DEFAULT_ENV = 'production'
      setEnvironment('staging')

      expect(getConfig({ env: 'local' })).toStrictEqual('local')
      expect(getConfig({ env: 'staging' })).toStrictEqual('staging')
      expect(getConfig({ env: 'production' })).toStrictEqual('production')
    })

    it('throws if env is not found', () => {
      setEnvironment('unknownEnv')

      expect(() => {
        getConfig()
      }).toThrow()
    })
  })
})
