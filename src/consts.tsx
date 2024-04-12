import uniqueId from 'lodash/uniqueId'

export const MinuteMs = 60 * 1000

export const MapId = uniqueId('map-')

export const MapboxToken = process.env.REACT_APP_MAPBOX_TOKEN

export const DefaultViewState = {
  bearing: 0,
  latitude: 53.86859,
  longitude: -0.36616,
  pitch: 0,
  zoom: 3,
}
