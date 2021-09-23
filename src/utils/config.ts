import sample from 'lodash/sample'

import { isLocalStorageAvailable } from './storage'
import envs, { StreamrConfig, EnvConfigResult } from './envs'

export const APP_ENV_KEY = 'network-explorer.env'
const storage = isLocalStorageAvailable() ? window.localStorage : null

export function setEnvironment(value: string) {
  if (!storage) {
    return
  }
  storage.setItem(APP_ENV_KEY, JSON.stringify(value))
}

export function clearEnvironment() {
  if (!storage) {
    return
  }
  storage.removeItem(APP_ENV_KEY)
}

export function getEnvironment() {
  let env

  try {
    env = (!!storage && JSON.parse(storage.getItem(APP_ENV_KEY) || 'false')) || process.env.REACT_APP_DEFAULT_ENV
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Failed to get env, clearing storage value')
    clearEnvironment()
  } finally {
    if (!!env && !envs[env]) {
      // eslint-disable-next-line no-console
      console.warn(`Unknown env "${env}", resetting to default`)
      clearEnvironment()
      env = process.env.REACT_APP_DEFAULT_ENV
    } else if (!env) {
      env = process.env.REACT_APP_DEFAULT_ENV
    }
  }

  return env
}

const cachedStreamrConfig: Record<string, StreamrConfig> = {}

function getConfig(options = {}): EnvConfigResult {
  const envNames = Object.keys(envs)
  const { env, reload } = {
    ...{
      env: getEnvironment() || (envNames.length > 0 && envNames[0]),
      reload: false,
    },
    ...(options || {}),
  }

  const { title, tracker, streamr } = envs[env]

  if (!cachedStreamrConfig[env] || !!reload) {
    cachedStreamrConfig[env] = (sample(streamr) as StreamrConfig)
  }

  return {
    title,
    tracker,
    streamr: cachedStreamrConfig[env],
  }
}

export default getConfig
