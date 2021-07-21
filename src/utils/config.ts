import { isLocalStorageAvailable } from './storage'
import envs, { EnvConfig } from './envs'

export const APP_ENV_KEY = 'network-eplorer.env'
const storage = isLocalStorageAvailable() ? window.localStorage : null

export function getEnvironment() {
  return (
    (!!storage && JSON.parse(storage.getItem(APP_ENV_KEY) || 'false')) || process.env.REACT_APP_DEFAULT_ENV
  )
}

export function setEnvironment(value: string) {
  if (!storage) {
    return
  }
  storage.setItem(APP_ENV_KEY, JSON.stringify(value))
}

function getConfig(options = {}): EnvConfig {
  const { env } = {
    ...{
      env: getEnvironment() || 'local',
    },
    ...(options || {}),
  }

  if (!envs[env]) {
    throw new Error(`Unknown env "${env}"!`)
  }

  return envs[env]
}

export default getConfig
