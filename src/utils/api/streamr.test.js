import * as all from './streamr'
import * as request from '../request'
import * as config from '../config'

jest.mock('../request')
jest.mock('../config')

describe('streamr API', () => {
  afterEach(() => {
    config.default.mockClear()
    request.get.mockClear()
  })

  describe('getStreams', () => {
    it('calls API with params', async () => {
      config.default.mockReturnValue({
        streamr: {
          http: '',
        },
      })

      const getMock = jest.fn().mockResolvedValue([{
        id: 'stream-1',
      }, {
        id: 'stream-2',
      }])
      request.get.mockImplementation(getMock)

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
      config.default.mockReturnValue({
        streamr: {
          http: '',
        },
      })

      const getMock = jest.fn().mockResolvedValue({
        id: '0x123/test/my-stream',
      })
      request.get.mockImplementation(getMock)

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
