import getConfig, { getEnvironment, setEnvironment, APP_ENV_KEY } from './config'

jest.mock('./envs', () => ({
  local: 'local',
  staging: 'staging',
  production: 'production',
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

      expect(getConfig()).toStrictEqual('local')
    })

    it('gets default env config (env flag)', () => {
      process.env.REACT_APP_DEFAULT_ENV = 'production'

      expect(getConfig()).toStrictEqual('production')
    })

    it('gets default env config (localstorage)', () => {
      process.env.REACT_APP_DEFAULT_ENV = 'production'
      setEnvironment('staging')

      expect(getConfig()).toStrictEqual('staging')
    })

    it('returns the given env', () => {
      process.env.REACT_APP_DEFAULT_ENV = 'production'
      setEnvironment('staging')

      expect(getConfig({ env: 'local' })).toStrictEqual('local')
      expect(getConfig({ env: 'staging' })).toStrictEqual('staging')
      expect(getConfig({ env: 'production' })).toStrictEqual('production')
    })
  })
})
