import * as bip39 from 'bip39'
import * as trackerUtils from 'streamr-client-protocol'

import * as all from './tracker'
import * as request from '../request'
import * as mapbox from './mapbox'

jest.mock('bip39')
jest.mock('streamr-client-protocol')
jest.mock('../request')
jest.mock('./mapbox')

const locations = {
  '0xC983de43c5d22186F1e051c6da419c5a17F19544#4caa44ec-c26d-4cb2-9056-c54e60eceafe': {
    country: 'Poland',
    city: 'Wroclaw',
    latitude: 51,
    longitude: 17,
  },
  '0xc3075C2556A1FD30c67530F1ac5ddAE618762CAa': {
    country: 'Spain',
    city: 'Barcelona',
    latitude: 41,
    longitude: 2,
  },
  '0xe61611feb4a4Bd058E2b7f23E53786da530AdA7d#490eb3e7-33c2-45e4-9ab2-b09de1e29990': {
    country: 'Finland',
    city: 'Helsinki',
    latitude: 60,
    longitude: 24,
  },
}

describe('tracker API', () => {
  beforeAll(() => {
    // don't show warnigns when console.warn is called
    jest.spyOn(console, 'warn')
    // eslint-disable-next-line no-console
    console.warn.mockImplementation((...args) => {})
  })

  afterEach(() => {
    bip39.entropyToMnemonic.mockClear()
    trackerUtils.Utils.getTrackerRegistryFromContract.mockClear()
    request.get.mockClear()
    mapbox.getReversedGeocodedLocation.mockClear()
  })

  afterAll(() => {
    // eslint-disable-next-line no-console
    console.warn.mockRestore()
  })

  describe('generateMnemonic', () => {
    it('returns a mnemonic for an address', () => {
      const oldWordlist = bip39.wordlists
      const wordlist = ['solid', 'wooden', 'table', 'tree', 'desk', 'computer', 'android']
      Object.assign(bip39.wordlists, {
        english: wordlist,
      })
      const entropyToMnemonicMock = jest.fn((id, list) => list.join(' '))
      bip39.entropyToMnemonic.mockImplementation(entropyToMnemonicMock)

      const result = all.generateMnemonic('0x123')

      expect(entropyToMnemonicMock).toBeCalledWith('123', wordlist)
      expect(result).toStrictEqual('Solid Wooden Table')
      bip39.wordlists = oldWordlist
    })
  })

  describe('getAddress', () => {
    it('strips hash and returns the address', () => {
      expect(all.getAddress('0xC983de43c5d22186F1e051c6da419c5a17F19544#4caa44ec-c26d-4cb2-9056-c54e60eceafe'))
        .toBe('0xC983de43c5d22186F1e051c6da419c5a17F19544')
    })

    it('returns address as is', () => {
      expect(all.getAddress('0xC983de43c5d22186F1e051c6da419c5a17F19544'))
        .toBe('0xC983de43c5d22186F1e051c6da419c5a17F19544')
    })
  })

  describe('getNodes', () => {
    it('gets list of nodes from a tracker', async () => {
      const getMock = jest.fn().mockResolvedValue(locations)
      request.get.mockImplementation(getMock)

      const entropyToMnemonicMock = jest.fn((id, list) => {
        const mnemonics = {
          'C983de43c5d22186F1e051c6da419c5a17F19544': 'strong wooden table',
          'c3075C2556A1FD30c67530F1ac5ddAE618762CAa': 'fierce concrete spoon',
          'e61611feb4a4Bd058E2b7f23E53786da530AdA7d': 'mild sunny building',
        }

        if (!mnemonics[id]) {
          throw new Error('Mnemonic failed!')
        }

        return mnemonics[id]
      })
      bip39.entropyToMnemonic.mockImplementation(entropyToMnemonicMock)

      const getReversedGeocodedLocationMock = jest.fn(({ latitude, longitude }) => Promise.resolve({
        region: `${latitude}-${longitude}`,
      }))
      mapbox.getReversedGeocodedLocation.mockImplementation(getReversedGeocodedLocationMock)

      const http = 'http://testurl'
      const result = await all.getNodes(http)

      expect(getMock).toBeCalledWith({
        url: `${http}/location/`,
      })
      expect(result).toStrictEqual([{
        id: '0xC983de43c5d22186F1e051c6da419c5a17F19544#4caa44ec-c26d-4cb2-9056-c54e60eceafe',
        address: '0xC983de43c5d22186F1e051c6da419c5a17F19544',
        latitude: 51,
        longitude: 17,
        title: 'Strong Wooden Table',
        placeName: '51-17',
      }, {
        id: '0xc3075C2556A1FD30c67530F1ac5ddAE618762CAa',
        address: '0xc3075C2556A1FD30c67530F1ac5ddAE618762CAa',
        latitude: 41,
        longitude: 2,
        title: 'Fierce Concrete Spoon',
        placeName: '41-2',
      }, {
        id: '0xe61611feb4a4Bd058E2b7f23E53786da530AdA7d#490eb3e7-33c2-45e4-9ab2-b09de1e29990',
        address: '0xe61611feb4a4Bd058E2b7f23E53786da530AdA7d',
        latitude: 60,
        longitude: 24,
        title: 'Mild Sunny Building',
        placeName: '60-24',
      }])
    })

    it('uses address as title if mnemonic cannot be generated', async () => {
      const getMock = jest.fn().mockResolvedValue(locations)
      request.get.mockImplementation(getMock)

      const entropyToMnemonicMock = jest.fn((id, list) => {
        throw new Error('Mnemonic failed!')
      })
      bip39.entropyToMnemonic.mockImplementation(entropyToMnemonicMock)

      const getReversedGeocodedLocationMock = jest.fn(({ latitude, longitude }) => Promise.resolve({
        region: `${latitude}-${longitude}`,
      }))
      mapbox.getReversedGeocodedLocation.mockImplementation(getReversedGeocodedLocationMock)

      const http = 'http://testurl'
      const result = await all.getNodes(http)

      expect(getMock).toBeCalledWith({
        url: `${http}/location/`,
      })
      expect(result).toStrictEqual([{
        id: '0xC983de43c5d22186F1e051c6da419c5a17F19544#4caa44ec-c26d-4cb2-9056-c54e60eceafe',
        address: '0xC983de43c5d22186F1e051c6da419c5a17F19544',
        latitude: 51,
        longitude: 17,
        title: '0xC983de43c5d22186F1e051c6da419c5a17F19544',
        placeName: '51-17',
      }, {
        id: '0xc3075C2556A1FD30c67530F1ac5ddAE618762CAa',
        address: '0xc3075C2556A1FD30c67530F1ac5ddAE618762CAa',
        latitude: 41,
        longitude: 2,
        title: '0xc3075C2556A1FD30c67530F1ac5ddAE618762CAa',
        placeName: '41-2',
      }, {
        id: '0xe61611feb4a4Bd058E2b7f23E53786da530AdA7d#490eb3e7-33c2-45e4-9ab2-b09de1e29990',
        address: '0xe61611feb4a4Bd058E2b7f23E53786da530AdA7d',
        latitude: 60,
        longitude: 24,
        title: '0xe61611feb4a4Bd058E2b7f23E53786da530AdA7d',
        placeName: '60-24',
      }])
    })

    it('uses country from response if reverse geocoding fails', async () => {
      const getMock = jest.fn().mockResolvedValue(locations)
      request.get.mockImplementation(getMock)

      const entropyToMnemonicMock = jest.fn((id, list) => {
        throw new Error('Mnemonic failed!')
      })
      bip39.entropyToMnemonic.mockImplementation(entropyToMnemonicMock)

      const getReversedGeocodedLocationMock = jest.fn(({ latitude, longitude }) => Promise.resolve({
        region: undefined,
      }))
      mapbox.getReversedGeocodedLocation.mockImplementation(getReversedGeocodedLocationMock)

      const http = 'http://testurl'
      const result = await all.getNodes(http)

      expect(getMock).toBeCalledWith({
        url: `${http}/location/`,
      })
      expect(result).toStrictEqual([{
        id: '0xC983de43c5d22186F1e051c6da419c5a17F19544#4caa44ec-c26d-4cb2-9056-c54e60eceafe',
        address: '0xC983de43c5d22186F1e051c6da419c5a17F19544',
        latitude: 51,
        longitude: 17,
        title: '0xC983de43c5d22186F1e051c6da419c5a17F19544',
        placeName: 'Poland',
      }, {
        id: '0xc3075C2556A1FD30c67530F1ac5ddAE618762CAa',
        address: '0xc3075C2556A1FD30c67530F1ac5ddAE618762CAa',
        latitude: 41,
        longitude: 2,
        title: '0xc3075C2556A1FD30c67530F1ac5ddAE618762CAa',
        placeName: 'Spain',
      }, {
        id: '0xe61611feb4a4Bd058E2b7f23E53786da530AdA7d#490eb3e7-33c2-45e4-9ab2-b09de1e29990',
        address: '0xe61611feb4a4Bd058E2b7f23E53786da530AdA7d',
        latitude: 60,
        longitude: 24,
        title: '0xe61611feb4a4Bd058E2b7f23E53786da530AdA7d',
        placeName: 'Finland',
      }])
    })
  })

  describe('getTrackers', () => {
    it('gets list of addresses', async () => {
      const getAllTrackersMock = jest.fn(() => [{
        http: 'http://streamr.network/:30301',
      }, {
        http: 'http://streamr.network/:30302',
      }])

      trackerUtils.Utils.getTrackerRegistryFromContract.mockResolvedValue({
        getAllTrackers: getAllTrackersMock,
      })

      const result = await all.getTrackers()

      expect(result).toStrictEqual([
        'http://streamr.network/:30301',
        'http://streamr.network/:30302',
      ])
    })
  })

  describe('getTracker', () => {
    it('gets tracker with id', async () => {
      const getTrackerMock = jest.fn((id) => {
        if (id === 'mystream') {
          return {
            http: 'http://streamr.network/:30301',
          }
        }

        if (id === '0x1234/path/tostream') {
          return {
            http: 'http://streamr.network/:30302',
          }
        }

        return undefined
      })

      trackerUtils.Utils.getTrackerRegistryFromContract.mockResolvedValue({
        getTracker: getTrackerMock,
      })

      const result1 = await all.getTrackerForStream({ id: 'mystream' })
      const result2 = await all.getTrackerForStream({ id: '0x1234/path/tostream' })

      expect(result1).toStrictEqual('http://streamr.network/:30301')
      expect(result2).toStrictEqual('http://streamr.network/:30302')
      expect(getTrackerMock).toBeCalledWith('mystream', 0)
      expect(getTrackerMock).toBeCalledWith('0x1234/path/tostream', 0)
    })

    it('gets tracker with id and partition', async () => {
      const getTrackerMock = jest.fn((id) => ({
        http: 'http://streamr.network/:30301',
      }))

      trackerUtils.Utils.getTrackerRegistryFromContract.mockResolvedValue({
        getTracker: getTrackerMock,
      })

      const result1 = await all.getTrackerForStream({ id: 'mystream', partition: 3 })

      expect(result1).toStrictEqual('http://streamr.network/:30301')
      expect(getTrackerMock).toBeCalledWith('mystream', 3)
    })
  })

  describe('getTopology', () => {
    it('calls API with encoded stream id', async () => {
      const http = 'http://streamr.network/:30301'
      const getTrackerMock = jest.fn((id) => ({
        http,
      }))

      trackerUtils.Utils.getTrackerRegistryFromContract.mockResolvedValue({
        getTracker: getTrackerMock,
      })

      const getMock = jest.fn().mockResolvedValue({
        '0x1234/path/tostream': {
          'node1': [{
            neighborId: 'node2',
            rtt: 1,
          }, {
            neighborId: 'node3',
            rtt: 8,
          }],
          'node2': [{
            neighborId: 'node1',
            rtt: 4,
          }],
          'node3': [{
            neighborId: 'node1',
            rtt: 12,
          }],
        },
      })
      request.get.mockImplementation(getMock)

      const result = await all.getTopology({ id: '0x1234/path/tostream' })

      expect(getTrackerMock).toBeCalledWith('0x1234/path/tostream', 0)
      expect(getMock).toBeCalledWith({
        url: `${http}/topology/0x1234%2Fpath%2Ftostream/`,
      })
      expect(result).toStrictEqual({
        'node1': {
          'node2': 1,
          'node3': 8,
        },
        'node2': {
          'node1': 4,
        },
        'node3': {
          'node1': 12,
        },
      })
    })
  })

  describe('getNodeConnections', () => {
    it('combines topologies from multiple trackers, uses highest latency value', async () => {
      const results = [{
        http: 'http://tracker1',
        topology: {
          'node1': [{
            neighborId: 'node2',
            rtt: 11,
          }],
          'node2': [{
            neighborId: 'node1',
            rtt: 5,
          }, {
            neighborId: 'node3',
            rtt: 9,
          }],
          'node3': [{
            neighborId: 'node2',
            rtt: 15,
          }],
          'node4': [],
        },
      }, {
        http: 'http://tracker2',
        topology: {
          'node1': [{
            neighborId: 'node2',
            rtt: 1,
          }, {
            neighborId: 'node4',
            rtt: 2,
          }, {
            neighborId: 'node3',
            rtt: 6,
          }],
          'node2': [{
            neighborId: 'node1',
            rtt: 15,
          }],
          'node3': [{
            neighborId: 'node1',
            rtt: 7,
          }],
          'node4': [{
            neighborId: 'node1',
            rtt: 2,
          }],
        },
      }]
      const getAllTrackersMock = jest.fn(() => results)

      trackerUtils.Utils.getTrackerRegistryFromContract.mockResolvedValue({
        getAllTrackers: getAllTrackersMock,
      })

      const getMock = jest.fn().mockImplementation(({ url }) => {
        const { topology } = results.find(({ http }) => `${http}/node-connections/` === url)

        return Promise.resolve(topology)
      })

      request.get.mockImplementation(getMock)

      const result = await all.getNodeConnections()

      expect(getAllTrackersMock).toBeCalled()
      expect(getMock).toBeCalledWith({
        url: 'http://tracker1/node-connections/',
      })
      expect(getMock).toBeCalledWith({
        url: 'http://tracker2/node-connections/',
      })
      expect(result).toStrictEqual({
        'node1': {
          'node2': 11,
          'node3': 6,
          'node4': 2,
        },
        'node2': {
          'node1': 15,
          'node3': 9,
        },
        'node3': {
          'node1': 7,
          'node2': 15,
        },
        'node4': {
          'node1': 2,
        },
      })
    })

    it('handles empty topologies', async () => {
      const results = [{
        http: 'http://tracker1',
        topology: {
          'node1': [],
          'node2': [],
          'node3': [],
          'node4': [],
        },
      }, {
        http: 'http://tracker2',
        topology: {
          'node1': [],
          'node2': [],
          'node3': [],
          'node4': [],
        },
      }]
      const getAllTrackersMock = jest.fn(() => results)

      trackerUtils.Utils.getTrackerRegistryFromContract.mockResolvedValue({
        getAllTrackers: getAllTrackersMock,
      })

      const getMock = jest.fn().mockImplementation(({ url }) => {
        const { topology } = results.find(({ http }) => `${http}/node-connections/` === url)

        return Promise.resolve(topology)
      })

      request.get.mockImplementation(getMock)

      const result = await all.getNodeConnections()

      expect(getAllTrackersMock).toBeCalled()
      expect(getMock).toBeCalledWith({
        url: 'http://tracker1/node-connections/',
      })
      expect(getMock).toBeCalledWith({
        url: 'http://tracker2/node-connections/',
      })
      expect(result).toStrictEqual({
        'node1': {},
        'node2': {},
        'node3': {},
        'node4': {},
      })
    })
  })

  describe('getIndexedNodes', () => {
    it('calculates indexed nodes from topology', () => {
      const topology = all.getTopologyFromResponse({
        'node-1': [{
          'neighborId': 'node-2',
          'rtt': 10,
        }, {
          'neighborId': 'node-3',
          'rtt': null,
        }],
        'node-2': [{
          'neighborId': 'node-1',
          'rtt': 10,
        }, {
          'neighborId': 'node-3',
          'rtt': 120,
        }],
        'node-3': [{
          'neighborId': 'node-1',
          'rtt': null,
        }, {
          'neighborId': 'node-2',
          'rtt': 120,
        }],
      })

      expect(topology).toStrictEqual({
        'node-1': {
          'node-2': 10,
          'node-3': null,
        },
        'node-2': {
          'node-1': 10,
          'node-3': 120,
        },
        'node-3': {
          'node-1': null,
          'node-2': 120,
        },
      })

      const result = all.getIndexedNodes(topology)

      expect(result).toStrictEqual([
        [0, 1, 5],
        [1, 2, 60],
      ])
    })
  })
})
