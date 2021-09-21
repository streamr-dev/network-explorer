import * as all from './streamr'
import * as request from '../request'
import * as config from '../config'

jest.mock('../request')
jest.mock('../config')

describe('streamr API', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  describe('searchStreams', () => {
    it('returns empty result list if search is empty', async () => {
      const configSpy = jest.spyOn(config, 'default').mockReturnValue({
        streamr: {
          http: '',
        },
      })
      const getMock = jest.fn().mockResolvedValue(undefined)
      const getSpy = jest.spyOn(request, 'get').mockImplementation(getMock)

      const result = await all.searchStreams()

      expect(getMock).toBeCalledWith({
        url: '/streams',
        options: {
          params: {
            public: true,
            search: '',
          },
        },
      })
      expect(getMock).toBeCalledTimes(1)
      expect(result).toStrictEqual([])

      configSpy.mockRestore()
      getSpy.mockRestore()
    })

    it('returns search results', async () => {
      const configSpy = jest.spyOn(config, 'default').mockReturnValue({
        streamr: {
          http: '',
        },
      })

      const getMock = jest.fn().mockResolvedValue([{
        id: '1',
        description: 'streamr.eth/trams fake 1',
      }, {
        id: '2',
        description: 'streamr.eth/trams fake 2',
      }])
      const getSpy = jest.spyOn(request, 'get').mockImplementation(getMock)

      const result = await all.searchStreams({
        search: 'Helsinki',
      })

      expect(getMock).toBeCalledTimes(1)
      expect(getMock).toBeCalledWith({
        url: '/streams',
        options: {
          params: {
            public: true,
            search: 'helsinki',
          },
        },
      })
      expect(result).toStrictEqual([{
        type: 'streams',
        id: '1',
        name: '1',
        description: 'streamr.eth/trams fake 1',
      }, {
        type: 'streams',
        id: '2',
        name: '2',
        description: 'streamr.eth/trams fake 2',
      }])

      configSpy.mockRestore()
      getSpy.mockRestore()
    })
  })

  describe('getStreams', () => {
    it('calls API with params', async () => {
      const configSpy = jest.spyOn(config, 'default').mockReturnValue({
        streamr: {
          http: '',
        },
      })

      const getMock = jest.fn().mockResolvedValue([{
        id: 'stream-1',
      }, {
        id: 'stream-2',
      }])
      const getSpy = jest.spyOn(request, 'get').mockImplementation(getMock)

      const result = await all.getStreams({
        params: {
          public: true,
          search: 'tram',
        },
      })

      expect(getMock).toBeCalledWith({
        url: '/streams',
        options: {
          params: {
            public: true,
            search: 'tram',
          },
        },
      })
      expect(result).toStrictEqual([{
        id: 'stream-1',
      }, {
        id: 'stream-2',
      }])

      configSpy.mockRestore()
      getSpy.mockRestore()
    })
  })

  describe('getStream', () => {
    it('calls API with encoded stream id', async () => {
      const configSpy = jest.spyOn(config, 'default').mockReturnValue({
        streamr: {
          http: '',
        },
      })

      const getMock = jest.fn().mockResolvedValue({
        id: '0x123/test/my-stream',
      })
      const getSpy = jest.spyOn(request, 'get').mockImplementation(getMock)

      const result = await all.getStream({
        id: '0x123/test/my-stream',
      })

      expect(getMock).toBeCalledWith({
        url: '/streams/0x123%2Ftest%2Fmy-stream/validation',
        options: {
          cancelToken: undefined,
        },
      })
      expect(result).toStrictEqual({
        id: '0x123/test/my-stream',
      })

      configSpy.mockRestore()
      getSpy.mockRestore()
    })
  })
})
