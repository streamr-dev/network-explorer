import * as trackerUtils from 'streamr-client-protocol'

import * as all from './tracker'
import * as request from '../request'
import * as config from '../config'

jest.mock('streamr-client-protocol', () => {
  const originalModule = jest.requireActual('streamr-client-protocol')

  return {
    __esModule: true,
    ...originalModule,
    Utils: {
      ...originalModule.Utils,
    },
  }
})
jest.mock('../request')
jest.mock('../config')

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
  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  describe('getNodes', () => {
    it('gets list of nodes from a tracker', async () => {
      const requestSpy = jest.spyOn(request, 'get').mockResolvedValue(locations)

      const mnemonicSpy = jest.spyOn(trackerUtils.Utils, 'generateMnemonicFromAddress').mockImplementation((id) => {
        const mnemonics = {
          '0xC983de43c5d22186F1e051c6da419c5a17F19544': 'Strong Wooden Table',
          '0xc3075C2556A1FD30c67530F1ac5ddAE618762CAa': 'Fierce Concrete Spoon',
          '0xe61611feb4a4Bd058E2b7f23E53786da530AdA7d': 'Mild Sunny Building',
        }

        if (!mnemonics[id]) {
          throw new Error('Mnemonic failed!')
        }

        return mnemonics[id]
      })

      const http = 'http://testurl'
      const result = await all.getNodes(http)

      expect(requestSpy).toBeCalledWith({
        url: `${http}/location/`,
      })
      expect(result).toStrictEqual([{
        id: '0xC983de43c5d22186F1e051c6da419c5a17F19544#4caa44ec-c26d-4cb2-9056-c54e60eceafe',
        address: '0xC983de43c5d22186F1e051c6da419c5a17F19544',
        title: 'Strong Wooden Table',
        location: {
          id: '0xC983de43c5d22186F1e051c6da419c5a17F19544#4caa44ec-c26d-4cb2-9056-c54e60eceafe',
          latitude: 51,
          longitude: 17,
          title: 'Poland',
        },
      }, {
        id: '0xc3075C2556A1FD30c67530F1ac5ddAE618762CAa',
        address: '0xc3075C2556A1FD30c67530F1ac5ddAE618762CAa',
        title: 'Fierce Concrete Spoon',
        location: {
          id: '0xc3075C2556A1FD30c67530F1ac5ddAE618762CAa',
          latitude: 41,
          longitude: 2,
          title: 'Spain',
        },
      }, {
        id: '0xe61611feb4a4Bd058E2b7f23E53786da530AdA7d#490eb3e7-33c2-45e4-9ab2-b09de1e29990',
        address: '0xe61611feb4a4Bd058E2b7f23E53786da530AdA7d',
        title: 'Mild Sunny Building',
        location: {
          id: '0xe61611feb4a4Bd058E2b7f23E53786da530AdA7d#490eb3e7-33c2-45e4-9ab2-b09de1e29990',
          latitude: 60,
          longitude: 24,
          title: 'Finland',
        },
      }])

      requestSpy.mockRestore()
      mnemonicSpy.mockRestore()
    })

    it('uses address as title if mnemonic cannot be generated', async () => {
      const requestSpy = jest.spyOn(request, 'get').mockResolvedValue(locations)
      // don't show warnigns when console.warn is called
      // eslint-disable-next-line no-console
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation((...args) => {})

      const mnemonicSpy = jest.spyOn(trackerUtils.Utils, 'generateMnemonicFromAddress').mockImplementation((id) => {
        throw new Error('Mnemonic failed!')
      })

      const http = 'http://testurl'
      const result = await all.getNodes(http)

      expect(requestSpy).toBeCalledWith({
        url: `${http}/location/`,
      })
      expect(result).toStrictEqual([{
        id: '0xC983de43c5d22186F1e051c6da419c5a17F19544#4caa44ec-c26d-4cb2-9056-c54e60eceafe',
        address: '0xC983de43c5d22186F1e051c6da419c5a17F19544',
        title: '0xC983de43c5d22186F1e051c6da419c5a17F19544',
        location: {
          id: '0xC983de43c5d22186F1e051c6da419c5a17F19544#4caa44ec-c26d-4cb2-9056-c54e60eceafe',
          latitude: 51,
          longitude: 17,
          title: 'Poland',
        },
      }, {
        id: '0xc3075C2556A1FD30c67530F1ac5ddAE618762CAa',
        address: '0xc3075C2556A1FD30c67530F1ac5ddAE618762CAa',
        title: '0xc3075C2556A1FD30c67530F1ac5ddAE618762CAa',
        location: {
          id: '0xc3075C2556A1FD30c67530F1ac5ddAE618762CAa',
          latitude: 41,
          longitude: 2,
          title: 'Spain',
        },
      }, {
        id: '0xe61611feb4a4Bd058E2b7f23E53786da530AdA7d#490eb3e7-33c2-45e4-9ab2-b09de1e29990',
        address: '0xe61611feb4a4Bd058E2b7f23E53786da530AdA7d',
        title: '0xe61611feb4a4Bd058E2b7f23E53786da530AdA7d',
        location: {
          id: '0xe61611feb4a4Bd058E2b7f23E53786da530AdA7d#490eb3e7-33c2-45e4-9ab2-b09de1e29990',
          latitude: 60,
          longitude: 24,
          title: 'Finland',
        },
      }])

      requestSpy.mockRestore()
      mnemonicSpy.mockRestore()
      consoleSpy.mockRestore()
    })
  })

  describe('getTrackers', () => {
    it('gets list of addresses from contract', async () => {
      const configSpy = jest.spyOn(config, 'default').mockReturnValue({
        tracker: {
          source: 'contract',
          contractAddress: '0x123',
        },
      })
      const getAllTrackersMock = jest.fn(() => {
        return ([{
          http: 'http://streamr.network/:30301',
        }, {
          http: 'http://streamr.network/:30302',
        }])
      })

      const trackerSpy = jest.spyOn(trackerUtils.Utils, 'getTrackerRegistryFromContract').mockResolvedValue({
        getAllTrackers: getAllTrackersMock,
      })
      const result = await all.getTrackers()

      expect(getAllTrackersMock).toBeCalled()
      expect(result).toStrictEqual([
        'http://streamr.network/:30301',
        'http://streamr.network/:30302',
      ])

      configSpy.mockRestore()
      trackerSpy.mockRestore()
    })

    it('gets testnet addresses', async () => {
      const trackers = [{
        id: '1',
        ws: 'wss://streamr.network/:30301',
        http: 'http://streamr.network/:30301',
      }, {
        id: '2',
        ws: 'wss://streamr.network/:30302',
        http: 'http://streamr.network/:30302',
      }, {
        id: '3',
        ws: 'wss://streamr.network/:30303',
        http: 'http://streamr.network/:30303',
      }]
      const configSpy = jest.spyOn(config, 'default').mockReturnValue({
        tracker: {
          source: 'http',
          trackers,
        },
      })
      const getAllTrackersMock = jest.fn(() => trackers)

      const trackerSpy = jest.spyOn(trackerUtils.Utils, 'createTrackerRegistry').mockResolvedValue({
        getAllTrackers: getAllTrackersMock,
      })

      const result = await all.getTrackers()

      expect(result).toStrictEqual([
        'http://streamr.network/:30301',
        'http://streamr.network/:30302',
        'http://streamr.network/:30303',
      ])

      configSpy.mockRestore()
      trackerSpy.mockRestore()
    })
  })

  describe('getTracker', () => {
    it('gets tracker with id from contract', async () => {
      const configSpy = jest.spyOn(config, 'default').mockReturnValue({
        tracker: {
          source: 'contract',
          contractAddress: '0x123',
        },
      })
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

      const trackerSpy = jest.spyOn(trackerUtils.Utils, 'getTrackerRegistryFromContract').mockResolvedValue({
        getTracker: getTrackerMock,
      })

      const result1 = await all.getTrackerForStream({ id: 'mystream' })
      const result2 = await all.getTrackerForStream({ id: '0x1234/path/tostream' })

      expect(result1).toStrictEqual('http://streamr.network/:30301')
      expect(result2).toStrictEqual('http://streamr.network/:30302')
      expect(getTrackerMock).toBeCalledWith('mystream', 0)
      expect(getTrackerMock).toBeCalledWith('0x1234/path/tostream', 0)

      configSpy.mockRestore()
      trackerSpy.mockRestore()
    })

    it('gets tracker with id and partition from contract', async () => {
      const configSpy = jest.spyOn(config, 'default').mockReturnValue({
        tracker: {
          source: 'contract',
          contractAddress: '0x123',
        },
      })
      const getTrackerMock = jest.fn((id) => ({
        http: 'http://streamr.network/:30301',
      }))

      const trackerSpy = jest.spyOn(trackerUtils.Utils, 'getTrackerRegistryFromContract').mockResolvedValue({
        getTracker: getTrackerMock,
      })

      const result1 = await all.getTrackerForStream({ id: 'mystream', partition: 3 })

      expect(result1).toStrictEqual('http://streamr.network/:30301')
      expect(getTrackerMock).toBeCalledWith('mystream', 3)

      configSpy.mockRestore()
      trackerSpy.mockRestore()
    })

    it('gets tracker with id from testnet', async () => {
      const trackers = [{
        id: '1',
        ws: 'wss://streamr.network/:30301',
        http: 'http://streamr.network/:30301',
      }, {
        id: '2',
        ws: 'wss://streamr.network/:30302',
        http: 'http://streamr.network/:30302',
      }, {
        id: '3',
        ws: 'wss://streamr.network/:30303',
        http: 'http://streamr.network/:30303',
      }]
      const configSpy = jest.spyOn(config, 'default').mockReturnValue({
        tracker: {
          source: 'http',
          trackers,
        },
      })

      const getTrackerMock = jest.fn((id) => ({
        http: 'http://streamr.network/:30301',
      }))

      const trackerSpy = jest.spyOn(trackerUtils.Utils, 'createTrackerRegistry').mockResolvedValue({
        getTracker: getTrackerMock,
      })

      const result = await all.getTrackerForStream({ id: 'mystream', partition: 3 })

      expect(result).toStrictEqual(trackers[0].http)
      expect(getTrackerMock).toBeCalledWith('mystream', 3)

      configSpy.mockRestore()
      trackerSpy.mockRestore()
    })
  })

  describe('getTopology', () => {
    it('calls API with encoded stream id', async () => {
      const configSpy = jest.spyOn(config, 'default').mockReturnValue({
        tracker: {
          source: 'contract',
          contractAddress: '0x123',
        },
      })
      const http = 'http://streamr.network/:30301'
      const getTrackerMock = jest.fn((id) => ({
        http,
      }))

      const trackerSpy = jest.spyOn(trackerUtils.Utils, 'getTrackerRegistryFromContract').mockResolvedValue({
        getTracker: getTrackerMock,
      })

      const requestSpy = jest.spyOn(request, 'get').mockResolvedValue({
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

      const result = await all.getTopology({ id: '0x1234/path/tostream' })

      expect(getTrackerMock).toBeCalledWith('0x1234/path/tostream', 0)
      expect(requestSpy).toBeCalledWith({
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

      configSpy.mockRestore()
      requestSpy.mockRestore()
      trackerSpy.mockRestore()
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

      const configSpy = jest.spyOn(config, 'default').mockReturnValue({
        tracker: {
          source: 'contract',
          contractAddress: '0x123',
        },
      })
      const trackerSpy = jest.spyOn(trackerUtils.Utils, 'getTrackerRegistryFromContract').mockResolvedValue({
        getAllTrackers: getAllTrackersMock,
      })

      const requestSpy = jest.spyOn(request, 'get').mockImplementation(({ url }) => {
        const { topology } = results.find(({ http }) => `${http}/node-connections/` === url)

        return Promise.resolve(topology)
      })

      const result = await all.getNodeConnections()

      expect(getAllTrackersMock).toBeCalled()
      expect(requestSpy).toBeCalledWith({
        url: 'http://tracker1/node-connections/',
      })
      expect(requestSpy).toBeCalledWith({
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

      configSpy.mockRestore()
      requestSpy.mockRestore()
      trackerSpy.mockRestore()
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

      const configSpy = jest.spyOn(config, 'default').mockReturnValue({
        tracker: {
          source: 'contract',
          contractAddress: '0x123',
        },
      })
      const trackerSpy = jest.spyOn(trackerUtils.Utils, 'getTrackerRegistryFromContract').mockResolvedValue({
        getAllTrackers: getAllTrackersMock,
      })

      const requestSpy = jest.spyOn(request, 'get').mockImplementation(({ url }) => {
        const { topology } = results.find(({ http }) => `${http}/node-connections/` === url)

        return Promise.resolve(topology)
      })

      const result = await all.getNodeConnections()

      expect(getAllTrackersMock).toBeCalled()
      expect(requestSpy).toBeCalledWith({
        url: 'http://tracker1/node-connections/',
      })
      expect(requestSpy).toBeCalledWith({
        url: 'http://tracker2/node-connections/',
      })
      expect(result).toStrictEqual({
        'node1': {},
        'node2': {},
        'node3': {},
        'node4': {},
      })

      configSpy.mockRestore()
      requestSpy.mockRestore()
      trackerSpy.mockRestore()
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
