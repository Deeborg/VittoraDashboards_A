/**
 * ROVASSET.TS
 * 
 * Defines the structure of a Right-of-Use (ROU) Asset
 * compliant with IFRS 16 and Ind AS 116 standards.
 * 
 * A ROU asset represents the lessee's right to use an underlying asset
 * over the lease term (typically a vehicle, equipment, or property lease).
 * 
 * Key accounting concepts:
 * - ROU Asset Value: Initial recognition at present value of lease payments
 * - Lease Liability: Discounted future lease payment obligations
 * - Depreciation: Straight-line over lease term (matching IFRS 16 requirements)
 * - Interest: Unwound daily on lease liability
 */

export interface ROUAsset {
    id: string;                        // Unique identifier (e.g., "ROU-0001")
    assetName: string;                 // Descriptive name (e.g., "Lease: Factory Equipment")
    leaseType: 'Equipment' | 'Vehicle' | 'Property' | 'Other';  // Type of lease
    vendor: string;                    // Lessor/equipment vendor
    leaseStartDate: string;            // Lease commencement date (YYYY-MM-DD)
    leaseEndDate: string;              // Lease end date
    
    /**
     * ACCOUNTING VALUES (as per IFRS 16 balance sheet)
     */
    rouAssetValue: number;             // Gross ROU asset recognized at lease commencement
    leaseLiability: number;            // Outstanding lease liability balance
    rouDepreciation: number;           // Accumulated depreciation on ROU asset (to date)
    leaseInterest: number;             // Interest accrued on lease liability (to date)
    
    /**
     * LEASE TERM DETAILS
     */
    remainingLeaseTermYears: number;   // Years remaining on the lease
    leaseTermYears: number;            // Total original lease term (years)
    
    /**
     * DERIVED CALCULATIONS (for reporting)
     */
    netROUAsset?: number;              // rouAssetValue - accumulatedDepreciation
    location?: string;                 // Physical location of asset
    department?: string;               // Responsible department
}

/**
 * LEASE TYPES ENUM
 * 
 * Categories of leases for reporting and analysis.
 * Different lease types may have different compliance requirements.
 */
export enum LeaseType {
    EQUIPMENT = 'Equipment',
    VEHICLE = 'Vehicle',
    PROPERTY = 'Property',
    OTHER = 'Other'
}

/**
 * ROU ASSET STATISTICS
 * 
 * Used for dashboard KPI calculations
 */
export interface ROUAssetMetrics {
    totalROUAssets: number;             // Count of ROU assets
    totalROUAssetValue: number;         // Sum of all ROU asset values
    totalLeaseLiability: number;        // Sum of all lease liabilities
    totalAccumulatedDepreciation: number; // Total ROU depreciation to date
    totalLeaseInterest: number;        // Total interest accrued
    avgRemainingTermYears: number;      // Average lease term remaining
    netROUAssets: number;              // Total (ROU Asset - Accumulated Depreciation)
}
