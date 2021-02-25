import * as bip39 from 'bip39'
import * as trackerUtils from 'streamr-client-protocol'

import * as all from './tracker'
import * as request from '../request'

jest.mock('bip39')
jest.mock('streamr-client-protocol')
jest.mock('../request')

describe('tracker API', () => {
  afterEach(() => {
    bip39.entropyToMnemonic.mockClear()
    trackerUtils.Utils.getTrackerRegistryFromContract.mockClear()
    request.get.mockClear()
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
  })

  describe('getIndexedNodes', () => {
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
