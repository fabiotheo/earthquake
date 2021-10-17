export type MetadataResponse = {
    totalCount: number;
};

export type GeometryFeatures = {
    type: string;
    coordinates: number[];
};

export type PropertiesFeatures = {
    lastupdate: Date;
    magtype: string;
    evtype: string;
    lon: number;
    auth: string;
    lat: number;
    depth: number;
    unid: string;
    mag: number;
    time: Date;
    source_id: string;
    source_catalog: string;
    flynn_region: string;
};

export type FeaturesResponse = {
    geometry: GeometryFeatures;
    type: string;
    id: string;
    properties: PropertiesFeatures;
};

export type DataResponse = {
    type: string;
    metadata: MetadataResponse;
    features: FeaturesResponse[];
};

export type DataCreated = {
    id: string;
    magnitude: number;
    latitude: number;
    longitude: number;
    depth: number;
    time: Date;
    source_id: string;
    region: string;
    last24: number;
    alreadyCreated?: boolean;
};

export type EarthquakeData = {
    data: DataCreated;
};

export type MessageProps = {
    mag: number;
    hour: Date;
    local: string;
    lat: number;
    lon: number;
    last: number;
};
