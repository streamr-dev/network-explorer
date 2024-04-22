import { getNodeLocationId } from './map'

describe('map utils', () => {
  describe('getNodeLocationId', () => {
    it('formats a pair of longitude and latitude', () => {
      expect(getNodeLocationId({})).toEqual('0,0')

      expect(getNodeLocationId({ longitude: 100 })).toEqual('100,0')

      expect(getNodeLocationId({ latitude: 100 })).toEqual('0,100')

      expect(getNodeLocationId({ longitude: -200.23, latitude: -100.12 })).toEqual(
        '-200.23,-100.12',
      )
    })
  })
})
