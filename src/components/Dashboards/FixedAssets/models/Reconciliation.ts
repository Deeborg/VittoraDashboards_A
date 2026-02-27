/**
 * RECONCILIATION.TS
 * 
 * Depreciation reconciliation item structure.
 * 
 * Compares depreciation calculated by the asset system
 * vs. what's posted in the general ledger.
 * 
 * Purpose: Catch posting errors, ensure books are accurate.
 */

export interface ReconciliationItem {
    assetId: string;              // Link to asset
    assetName: string;            // Asset name (for display)
    assetCategory: string;        // Asset category (for policy rules)
    systemDepreciation: number;   // Depreciation per asset register
    glDepreciation: number;       // Depreciation per general ledger
    difference: number;           // Variance amount
    differencePercent: number;    // Variance as percentage
    status: ReconciliationStatus; // Classification of variance
    statusReason: string;         // Explanation of why this status was assigned
    depreciationMethod?: string;  // Optional: depreciation method (for policy checks)
}

/**
 * RECONCILIATION STATUS
 * 
 * Classification logic:
 * - Matched: difference = 0 (perfect match)
 * - Minor Variance: difference < 5% (acceptable tolerance)
 * - Investigate: difference >= 5% OR policy violation (requires review)
 * - Informational: Non-depreciable asset with zero depreciation (valid state)
 */
export enum ReconciliationStatus {
    MATCHED = 'Matched',
    MINOR_VARIANCE = 'Minor Variance',
    INVESTIGATE = 'Investigate',
    INFORMATIONAL = 'Informational'
}

/**
 * Non-depreciable asset categories
 */
const NON_DEPRECIABLE_CATEGORIES = ['Land', 'Leasehold Land'];

/**
 * Helper function to determine reconciliation status WITH policy rules
 * 
 * @param differencePercent - Numeric variance percentage
 * @param assetCategory - Category of asset (to identify non-depreciable)
 * @param systemDepreciation - System depreciation value
 * @param depreciationMethod - Assigned depreciation method
 * @returns { status, reason } tuple
 */
export function getReconciliationStatusWithReason(
    differencePercent: number,
    assetCategory: string,
    systemDepreciation: number,
    depreciationMethod?: string
): { status: ReconciliationStatus; reason: string } {
    
    // Check if asset is non-depreciable
    const isNonDepreciable = NON_DEPRECIABLE_CATEGORIES.some(
        cat => assetCategory.toLowerCase().includes(cat.toLowerCase())
    );
    
    // POLICY RULE 1: Non-depreciable assets
    if (isNonDepreciable) {
        // If non-depreciable has NO depreciation method assigned
        if (!depreciationMethod || depreciationMethod === 'None') {
            // Zero depreciation is valid
            return {
                status: ReconciliationStatus.INFORMATIONAL,
                reason: `Non-depreciable asset (${assetCategory}). Zero depreciation is correct.`
            };
        } else {
            // Error: non-depreciable assigned a depreciation method
            return {
                status: ReconciliationStatus.INVESTIGATE,
                reason: `Policy violation: ${assetCategory} is non-depreciable but has depreciation method "${depreciationMethod}" assigned.`
            };
        }
    }
    
    // NUMERIC VARIANCE LOGIC (for depreciable assets)
    if (differencePercent === 0) {
        return {
            status: ReconciliationStatus.MATCHED,
            reason: 'System and GL depreciation match perfectly.'
        };
    } else if (Math.abs(differencePercent) < 5) {
        return {
            status: ReconciliationStatus.MINOR_VARIANCE,
            reason: `Variance of ${Math.abs(differencePercent).toFixed(2)}% is within acceptable tolerance (< 5%).`
        };
    } else {
        return {
            status: ReconciliationStatus.INVESTIGATE,
            reason: `Variance of ${Math.abs(differencePercent).toFixed(2)}% exceeds tolerance threshold (≥ 5%). Investigation required.`
        };
    }
}

/**
 * Deprecated: Use getReconciliationStatusWithReason instead
 * Kept for backwards compatibility during transition
 */
export function getReconciliationStatus(differencePercent: number): ReconciliationStatus {
    if (differencePercent === 0) {
        return ReconciliationStatus.MATCHED;
    } else if (Math.abs(differencePercent) < 5) {
        return ReconciliationStatus.MINOR_VARIANCE;
    } else {
        return ReconciliationStatus.INVESTIGATE;
    }
}