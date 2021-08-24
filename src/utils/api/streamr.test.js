import * as all from './streamr'
import * as request from '../request'
import * as config from '../config'

jest.mock('../request')
jest.mock('../config')

describe('streamr API', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('searchStreams', () => {
    it('does not search for specific stream if search is empty', async () => {
      jest.spyOn(config, 'default').mockReturnValue({
        streamr: {
          http: '',
        },
      })
      const getMock = jest.fn().mockResolvedValue(undefined)
      jest.spyOn(request, 'get').mockImplementation(getMock)

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
    })

    it('searches for specific stream and other results', async () => {
      jest.spyOn(config, 'default').mockReturnValue({
        streamr: {
          http: '',
        },
      })

      const getMock = jest.fn().mockResolvedValue(undefined)
      jest.spyOn(request, 'get').mockImplementation(getMock)

      const result = await all.searchStreams({
        search: 'Helsinki',
      })

      expect(getMock).toBeCalledTimes(2)
      expect(getMock).toBeCalledWith({
        url: '/streams',
        options: {
          params: {
            public: true,
            search: 'helsinki',
          },
        },
      })
      expect(getMock).toBeCalledWith({
        url: '/streams/Helsinki/validation',
      })
      expect(result).toStrictEqual([])
    })

    it('ignores if specific stream is not found', async () => {
      jest.spyOn(config, 'default').mockReturnValue({
        streamr: {
          http: '',
        },
      })

      const getMock = jest.fn(({ url }) => {
        if (url === '/streams/Helsinki/validation') {
          const error = new Error()
          error.response = {
            status: 404,
          }
          throw error
        }

        if (url === '/streams') {
          return Promise.resolve([{
            id: 'streamr.eth/trams',
            description: 'Helsinki trams demo',
          }])
        }

        throw new Error()
      })
      jest.spyOn(request, 'get').mockImplementation(getMock)

      const result = await all.searchStreams({
        search: 'Helsinki',
      })

      expect(getMock).toBeCalledTimes(2)
      expect(result).toStrictEqual([{
        type: 'streams',
        id: 'streamr.eth/trams',
        name: 'streamr.eth/trams',
        description: 'Helsinki trams demo',
      }])
    })

    it('places specific stream result first', async () => {
      jest.spyOn(config, 'default').mockReturnValue({
        streamr: {
          http: '',
        },
      })

      const getMock = jest.fn(({ url }) => {
        if (url === '/streams/streamr.eth%2Ftrams/validation') {
          return Promise.resolve({
            id: 'streamr.eth/trams',
            description: 'Helsinki trams demo',
          })
        }

        if (url === '/streams') {
          return Promise.resolve([{
            id: '1',
            description: 'streamr.eth/trams fake 1',
          }, {
            id: '2',
            description: 'streamr.eth/trams fake 2',
          }])
        }

        throw new Error()
      })
      jest.spyOn(request, 'get').mockImplementation(getMock)

      const result = await all.searchStreams({
        search: 'streamr.eth/trams',
      })

      expect(getMock).toBeCalledTimes(2)
      expect(result).toStrictEqual([{
        type: 'streams',
        id: 'streamr.eth/trams',
        name: 'streamr.eth/trams',
        description: 'Helsinki trams demo',
      }, {
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
    })
  })

  describe('getStreams', () => {
    it('calls API with params', async () => {
      jest.spyOn(config, 'default').mockReturnValue({
        streamr: {
          http: '',
        },
      })

      const getMock = jest.fn().mockResolvedValue([{
        id: 'stream-1',
      }, {
        id: 'stream-2',
      }])
      jest.spyOn(request, 'get').mockImplementation(getMock)

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
    })
  })

  describe('getStream', () => {
    it('calls API with encoded stream id', async () => {
      jest.spyOn(config, 'default').mockReturnValue({
        streamr: {
          http: '',
        },
      })

      const getMock = jest.fn().mockResolvedValue({
        id: '0x123/test/my-stream',
      })
      jest.spyOn(request, 'get').mockImplementation(getMock)

      const result = await all.getStream({
        id: '0x123/test/my-stream',
      })

      expect(getMock).toBeCalledWith({
        url: '/streams/0x123%2Ftest%2Fmy-stream/validation',
      })
      expect(result).toStrictEqual({
        id: '0x123/test/my-stream',
      })
    })
  })
})
