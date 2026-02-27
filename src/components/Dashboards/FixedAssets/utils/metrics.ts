/**
 * METRICS.TS
 * 
 * Financial health calculations for the dashboard.
 * 
 * Think of this as the "accounting engine" — it takes raw data
 * and calculates meaningful financial control metrics.
 */

import { Asset } from '../models/Asset.js';
import { CWIP } from '../models/CWIP.js';
import { ReconciliationItem } from '../models/Reconciliation.js';
import { ROUAsset, ROUAssetMetrics } from '../models/ROUAsset.js';

/**
 * INTERFACE: Financial Health Metrics
 * 
 * This defines what information the control panel will display.
 */
export interface FinancialMetrics {
    dataReliability: number;        // 0-100 percentage
    complianceReadiness: number;    // 0-100 percentage
    itemsNeedingAttention: number;  // Count of flagged items
    details: {
        totalAssets: number;
        matchedAssets: number;
        totalCWIP: number;
        agedCWIP: number;
        reconciliationIssues: number;
        dataQualityIssues: number;
    };
}

/**
 * Exception items that need attention
 */
export interface ExceptionItem {
    type: 'reconciliation' | 'cwip' | 'data-quality';
    id: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
}

/**
 * CALCULATE ASSET DATA RELIABILITY
 * 
 * Logic: What percentage of assets have matching depreciation 
 * between the system and general ledger?
 * 
 * Formula: (Matched Assets / Total Assets) × 100
 * 
 * Why this matters: If only 50% match, the asset register is 
 * unreliable. Controllers can't trust the numbers.
 */
export function calculateDataReliability(
    reconciliationData: ReconciliationItem[]
): number {
    if (reconciliationData.length === 0) return 100;
    
    // Total number of assets being reconciled
    const total = reconciliationData.length;
    
    // Count "healthy" statuses: Matched + Informational (non-depreciable assets correctly configured)
    const healthy = reconciliationData.filter(
        (item: ReconciliationItem) => item.status === 'Matched' || item.status === 'Informational'
    ).length;
    
    // Calculate percentage
    return Math.round((healthy / total) * 100);
}

/**
 * CALCULATE COMPLIANCE READINESS
 * 
 * Logic: Weighted score combining:
 * • 60% → How well reconciliation is going
 * • 40% → How healthy CWIP ageing is
 * 
 * Why weighted?
 * Reconciliation is more critical than CWIP ageing for compliance.
 */
export function calculateComplianceReadiness(
    reconciliationData: ReconciliationItem[],
    cwipData: CWIP[]
): number {
    // Part 1: Reconciliation health (60% weight)
    const reconHealth = calculateDataReliability(reconciliationData);
    
    // Part 2: CWIP ageing health (40% weight)
    // Logic: What % of CWIP projects are under 365 days?
    const totalCWIP = cwipData.length;
    const healthyCWIP = cwipData.filter(
        (project: CWIP) => project.ageingDays <= 365
    ).length;
    
    const cwipHealth = totalCWIP > 0 ? (healthyCWIP / totalCWIP) * 100 : 100;
    
    // Weighted average
    const complianceScore = (reconHealth * 0.6) + (cwipHealth * 0.4);
    
    return Math.round(complianceScore);
}

/**
 * COUNT ITEMS NEEDING ATTENTION
 * 
 * Logic: Sum up all problematic items across three categories:
 * 1. Depreciation mismatches (status = "Investigate")
 * 2. Aged CWIP projects (> 365 days)
 * 3. Data quality issues (missing vendor information)
 */
export function countAttentionItems(
    reconciliationData: ReconciliationItem[],
    cwipData: CWIP[],
    assets: Asset[]
): number {
    // Category 1: Reconciliation issues
    const reconIssues = reconciliationData.filter(
        (item: ReconciliationItem) => item.status === 'Investigate'
    ).length;
    
    // Category 2: Aged CWIP projects
    const agedCWIP = cwipData.filter(
        (project: CWIP) => project.ageingDays > 365
    ).length;
    
    // Category 3: Data quality issues
    const dataQualityIssues = assets.filter(
        (asset: Asset) => !asset.vendor || asset.vendor === ''
    ).length;
    
    // Total count
    return reconIssues + agedCWIP + dataQualityIssues;
}

/**
 * GET EXCEPTION ITEMS (for the widget)
 * 
 * Returns detailed list of items needing attention
 */
export function getExceptionItems(
    reconciliationData: ReconciliationItem[],
    cwipData: CWIP[],
    assets: Asset[]
): ExceptionItem[] {
    const exceptions: ExceptionItem[] = [];
    
    // Add reconciliation mismatches (only Investigate status)
    reconciliationData
        .filter((item: ReconciliationItem) => item.status === 'Investigate')
        .forEach((item: ReconciliationItem) => {
            exceptions.push({
                type: 'reconciliation',
                id: item.assetId,
                description: `${item.assetName} - ${item.statusReason}`,
                severity: Math.abs(item.differencePercent) > 10 ? 'high' : 'medium'
            });
        });
    
    // Add aged CWIP projects
    cwipData
        .filter((project: CWIP) => project.ageingDays > 365)
        .forEach((project: CWIP) => {
            exceptions.push({
                type: 'cwip',
                id: project.id,
                description: `${project.projectName} (${project.ageingDays} days)`,
                severity: project.ageingDays > 450 ? 'high' : 'medium'
            });
        });
    
    // Add data quality issues
    assets
        .filter((asset: Asset) => !asset.vendor || asset.vendor === '')
        .slice(0, 5) // Limit to first 5
        .forEach((asset: Asset) => {
            exceptions.push({
                type: 'data-quality',
                id: asset.id,
                description: `${asset.name} - Missing vendor information`,
                severity: 'low'
            });
        });
    
    return exceptions;
}

/**
 * CALCULATE ROU ASSET METRICS
 * 
 * Aggregates IFRS 16 / Ind AS 116 Right-of-Use asset data
 * 
 * Key metrics for ROU Assets:
 * - Total ROU Asset Value: Sum of all recognized ROU assets at lease commencement
 * - Total Lease Liability: Remaining payment obligations
 * - Net ROU Assets: Asset value minus accumulated depreciation
 * - Avg Remaining Lease Term: Portfolio maturity analysis
 * - Accumulated Depreciation: Total depreciation recognized to date
 * - Accrued Interest: Total interest expense recognized
 * 
 * These metrics support:
 * - Balance sheet reporting (Asset & Liability positions)
 * - Lease portfolio analysis
 * - Future obligation forecasting
 * - Compliance with IFRS 16 disclosure requirements
 */
export function calculateROUAssetMetrics(
    rouAssets: ROUAsset[]
): ROUAssetMetrics {
    if (rouAssets.length === 0) {
        return {
            totalROUAssets: 0,
            totalROUAssetValue: 0,
            totalLeaseLiability: 0,
            totalAccumulatedDepreciation: 0,
            totalLeaseInterest: 0,
            avgRemainingTermYears: 0,
            netROUAssets: 0
        };
    }
    
    const totalROUAssetValue = rouAssets.reduce(
        (sum: number, asset: ROUAsset) => sum + asset.rouAssetValue,
        0
    );
    
    const totalLeaseLiability = rouAssets.reduce(
        (sum: number, asset: ROUAsset) => sum + asset.leaseLiability,
        0
    );
    
    const totalAccumulatedDepreciation = rouAssets.reduce(
        (sum: number, asset: ROUAsset) => sum + asset.rouDepreciation,
        0
    );
    
    const totalLeaseInterest = rouAssets.reduce(
        (sum: number, asset: ROUAsset) => sum + asset.leaseInterest,
        0
    );
    
    const avgRemainingTermYears = rouAssets.reduce(
        (sum: number, asset: ROUAsset) => sum + asset.remainingLeaseTermYears,
        0
    ) / rouAssets.length;
    
    const netROUAssets = totalROUAssetValue - totalAccumulatedDepreciation;
    
    return {
        totalROUAssets: rouAssets.length,
        totalROUAssetValue,
        totalLeaseLiability,
        totalAccumulatedDepreciation,
        totalLeaseInterest,
        avgRemainingTermYears: Math.round(avgRemainingTermYears * 100) / 100,
        netROUAssets
    };
}

/**
 * NET ROU ASSET CALCULATION (Per Individual Lease)
 * 
 * Formula: ROU Asset Value - Accumulated Depreciation
 * 
 * This represents the remaining carrying value on the balance sheet
 * for each ROU asset after recognizing depreciation expense.
 */
export function calculateNetROUAsset(asset: ROUAsset): number {
    return asset.rouAssetValue - asset.rouDepreciation;
}

/**
 * LEASE COST IMPACT CALCULATION
 * 
 * Total lease expense recognized in P&L consists of:
 * - Depreciation: ROU asset / lease term (straight-line)
 * - Interest: Expense on the lease liability (reduces over time)
 * 
 * Total Annual Cost ≈ (Depreciation + Interest) for the period
 * 
 * This metric helps controllers understand the P&L impact
 * of lease obligations in the reporting period.
 */
export function calculateLeaseCostImpact(asset: ROUAsset): {
    annualDepreciation: number;
    projectedAnnualInterest: number;
    totalAnnualLeaseExpense: number;
} {
    // Annual depreciation (straight-line over lease term)
    const annualDepreciation = asset.rouAssetValue / asset.leaseTermYears;
    
    // Project annual interest based on remaining liability and average rate
    // Approximate as: remaining liability is paid over remaining term
    const projectedAnnualInterest = Math.max(
        asset.leaseLiability * 0.05,  // Conservative 5% implicit rate estimate
        0
    );
    
    const totalAnnualLeaseExpense = annualDepreciation + projectedAnnualInterest;
    
    return {
        annualDepreciation: Math.round(annualDepreciation),
        projectedAnnualInterest: Math.round(projectedAnnualInterest),
        totalAnnualLeaseExpense: Math.round(totalAnnualLeaseExpense)
    };
}

/**
 * GET COMPLETE FINANCIAL METRICS
 * 
 * Main function that calculates everything at once.
 * This is what the Control Panel component will call.
 */
export function getFinancialMetrics(
    assets: Asset[],
    cwipData: CWIP[],
    reconciliationData: ReconciliationItem[]
): FinancialMetrics {
    // Calculate each metric
    const dataReliability = calculateDataReliability(reconciliationData);
    const complianceReadiness = calculateComplianceReadiness(
        reconciliationData, 
        cwipData
    );
    const itemsNeedingAttention = countAttentionItems(
        reconciliationData,
        cwipData,
        assets
    );
    
    // Gather supporting details
    const totalAssets = assets.length;
    const matchedAssets = reconciliationData.filter(
        (item: ReconciliationItem) => item.status === 'Matched'
    ).length;
    const totalCWIP = cwipData.length;
    const agedCWIP = cwipData.filter((p: CWIP) => p.ageingDays > 365).length;
    const reconciliationIssues = reconciliationData.filter(
        (item: ReconciliationItem) => item.status === 'Investigate' || item.status === 'Minor Variance'
    ).length;
    const dataQualityIssues = assets.filter(
        (asset: Asset) => !asset.vendor || asset.vendor === ''
    ).length;
    
    // Return complete metrics object
    return {
        dataReliability,
        complianceReadiness,
        itemsNeedingAttention,
        details: {
            totalAssets,
            matchedAssets,
            totalCWIP,
            agedCWIP,
            reconciliationIssues,
            dataQualityIssues
        }
    };
}