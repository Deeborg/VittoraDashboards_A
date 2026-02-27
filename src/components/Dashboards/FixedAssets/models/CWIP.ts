/**
 * CWIP.TS
 * 
 * Capital Work in Progress structure.
 * 
 * Represents projects/assets under construction that haven't
 * been capitalized yet.
 * 
 * Finance rule: CWIP > 365 days requires investigation
 * (might be improperly classified or stalled projects).
 */

export interface CWIP {
    id: string;              // Project ID (e.g., "CWIP-001")
    projectName: string;     // Name of the project
    startDate: string;       // Project start date (YYYY-MM-DD)
    amountSpent: number;     // Total amount spent to date
    ageingDays: number;      // Days since project started
    ageingBucket: string;    // Category: "0-90", "91-180", "181-365", ">365 days"
    status: string;          // "Active", "On Hold", "Completed"
}

/**
 * AGEING BUCKETS
 * 
 * Standard ageing classification for CWIP monitoring.
 */
export enum CWIPAgeingBucket {
    BUCKET_0_90 = '0-90 days',
    BUCKET_91_180 = '91-180 days',
    BUCKET_181_365 = '181-365 days',
    BUCKET_OVER_365 = '>365 days'
}

/**
 * CWIP STATUS
 */
export enum CWIPStatus {
    ACTIVE = 'Active',
    ON_HOLD = 'On Hold',
    UNDER_REVIEW = 'Under Review',
    READY_TO_CAPITALIZE = 'Ready to Capitalize'
}