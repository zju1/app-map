import type { YMapLocationRequest } from "ymaps3";
const asset = require("./pointer.png");

(document.getElementById("marker") as HTMLImageElement).src = asset;

interface GeoResult {
  response: Response;
}

interface Response {
  GeoObjectCollection: GeoObjectCollection;
}

interface GeoObjectCollection {
  metaDataProperty: GeoObjectCollectionMetaDataProperty;
  featureMember: FeatureMember[];
}

interface FeatureMember {
  GeoObject: GeoObject;
}

interface GeoObject {
  metaDataProperty: GeoObjectMetaDataProperty;
  name: string;
  description?: string;
  boundedBy: BoundedBy;
  uri: string;
  Point: Point;
}

interface Point {
  pos: string;
}

interface BoundedBy {
  Envelope: Envelope;
}

interface Envelope {
  lowerCorner: string;
  upperCorner: string;
}

interface GeoObjectMetaDataProperty {
  GeocoderMetaData: GeocoderMetaData;
}

interface GeocoderMetaData {
  precision: string;
  text: string;
  kind: string;
  Address: Address;
  AddressDetails: AddressDetails;
}

interface Address {
  country_code?: string;
  formatted: string;
  Components: Component[];
}

interface Component {
  kind: string;
  name: string;
}

interface AddressDetails {
  Country?: Country;
  Address?: string;
}

interface Country {
  AddressLine: string;
  CountryNameCode: string;
  CountryName: string;
  AdministrativeArea?: AdministrativeArea;
}

interface AdministrativeArea {
  AdministrativeAreaName: string;
  SubAdministrativeArea?: SubAdministrativeArea;
}

interface SubAdministrativeArea {
  SubAdministrativeAreaName: string;
  Locality?: Locality;
}

interface Locality {
  LocalityName: string;
  DependentLocality?: DependentLocality;
}

interface DependentLocality {
  DependentLocalityName: string;
  Premise?: Premise;
}

interface Premise {
  PremiseNumber: string;
}

interface GeoObjectCollectionMetaDataProperty {
  GeocoderResponseMetaData: GeocoderResponseMetaData;
}

interface GeocoderResponseMetaData {
  Point: Point;
  request: string;
  results: string;
  found: string;
}

async function geocode(latlng: string): Promise<GeoResult> {
  const response = await fetch(
    `https://geocode-maps.yandex.ru/1.x/?apikey=36c7a31c-7cab-49a5-9e92-4c9afd547696&geocode=${latlng}&lang=ru_RU&format=json`
  );
  const data = (await response.json()) as GeoResult;
  return data as GeoResult;
}

async function initMap(): Promise<void> {
  await ymaps3.ready;

  const LOCATION: YMapLocationRequest = {
    center: [59.618922936523404, 42.46392713202458],
    zoom: 15,
  };

  const {
    YMap,
    YMapDefaultSchemeLayer,
    YMapListener,
    YMapFeature,
    YMapDefaultFeaturesLayer,
  } = ymaps3;
  const area = new YMapFeature({
    id: "branch",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [59.6022892, 42.4717804],
          [59.6172237, 42.4738695],
          [59.6197987, 42.4648792],
          [59.6161079, 42.464436],
          [59.6155071, 42.4664621],
          [59.6118164, 42.4660822],
          [59.6113229, 42.4673802],
          [59.6038556, 42.4663988],
          [59.6022892, 42.4717804],
        ],
        [
          [59.621172, 42.4607319],
          [59.6232748, 42.4609851],
          [59.6252918, 42.4622832],
          [59.627738, 42.4637712],
          [59.6330166, 42.4588955],
          [59.6240902, 42.4512964],
          [59.6211666, 42.460724],
        ],
      ],
    },
    style: {
      fill: "rgba(255, 217, 0, 0.78)",
      stroke: [
        {
          color: "rgb(255, 166, 0)",
          width: 2,
        },
      ],
    },
  });
  const map = new YMap(
    document.getElementById("map"),
    {
      location: LOCATION,
      worldOptions: {
        cycledX: true,
      },
      className: "ymaps",
      camera: {
        azimuth: 0,
        easing: "ease-in-out",
        tilt: 0,
      },
      copyrightsPosition: "bottom left",
      mode: "vector",
      zoomRange: {
        max: 19,
        min: 10,
      },
    },
    [new YMapDefaultFeaturesLayer({})]
  );
  map.addChild(area);
  const listener = new YMapListener({
    async onActionEnd({ location: { center } }) {
      const result = await geocode(`${center[0]},${center[1]}`);
      const address =
        result.response.GeoObjectCollection.featureMember?.[0].GeoObject.name;
      const locationName = document.getElementById("locationName");
      locationName.textContent = address;
    },
    onTouchStart() {
      document.getElementById("marker").classList.add("animated");
      document.getElementById("dot").classList.add("visible");
    },
    onTouchEnd() {
      document.getElementById("marker").classList.remove("animated");
      document.getElementById("dot").classList.remove("visible");
    },
    onMouseUp() {
      document.getElementById("marker").classList.remove("animated");
      document.getElementById("dot").classList.remove("visible");
    },
    onMouseDown() {
      document.getElementById("marker").classList.add("animated");
      document.getElementById("dot").classList.add("visible");
    },
  });

  map.addChild(new YMapDefaultSchemeLayer({}));
  map.addChild(listener);
}

initMap();
