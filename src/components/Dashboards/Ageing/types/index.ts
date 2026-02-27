export interface AgeingBucket {
  days30: number;
  days60: number;
  days90: number;
  days120: number;
  days180: number;
  days360: number;
  total: number;
}

export interface AgeingData {
  summary: AgeingBucket;
}