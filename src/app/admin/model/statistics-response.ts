export interface StatisticsIntervalResponse {
    interval: string;
    since: string;
    until: string;
    values: IntervalResponse[];
}

export interface IntervalResponse {
    year: number;
    month?: number;
    week?: number;
    day?: number;
    monthTotal?: number;
    weekTotal?: number;
    dayTotal?: number;
}

export interface StatisticsPortionsResponse {
    interval: string;
    since: string;
    until: string;
    values: PortionResponse[];
}

export interface PortionResponse {
    key: string;
    value: number;
}
