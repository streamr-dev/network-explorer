import { get } from '../request'

export const MAPBOX_TOKEN = 'pk.eyJ1IjoibWF0dGlubmVzIiwiYSI6ImNrNWhrN2FubDA0cGgzam1ycHV6Nmg2dHoifQ.HC5_Wu1R-OqRLza1u6P3Ig'

type GeoCodeResultFeature = {
  place_type: Array<string>,
  place_name: string,
  bbox: Array<number>,
}

type GeoCodeResult = {
  features: Array<GeoCodeResultFeature>
}

type ReversedGeocodedLocation = {
  region: string,
  bbox: Array<number>,
}

type ReversedGeocodedLocationParams = {
  longitude: number,
  latitude: number,
}

export const getReversedGeocodedLocation = async ({
  longitude,
  latitude,
}: ReversedGeocodedLocationParams) => {
  let result: GeoCodeResult | undefined

  try {
    result = await get<GeoCodeResult>({
      url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`,
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to reverse geocode ${longitude},${latitude}`)
  }

  const {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    place_name,
    bbox,
  } = (result && result.features || []).find(({ place_type }) => place_type[0] === 'region') || {}

  return {
    region: place_name,
    bbox,
  }
}
