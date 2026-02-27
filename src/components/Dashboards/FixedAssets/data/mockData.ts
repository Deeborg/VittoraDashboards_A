/**
 * MOCKDATA.TS
 * 
 * Realistic ERP-style financial data for the dashboard.
 * 
 * In production, this would come from API calls to SAP, Oracle, etc.
 * For development, we generate realistic mock data.
 * 
 * Data includes:
 * - 200+ fixed assets across categories
 * - 15 CWIP projects
 * - 25 reconciliation entries
 * - Some intentional "problem" records for exception detection
 */

import { Asset, AssetCategory } from '../models/Asset';
import { CWIP, CWIPAgeingBucket, CWIPStatus } from '../models/CWIP';
import { ReconciliationItem, ReconciliationStatus, getReconciliationStatusWithReason } from '../models/Reconciliation';
import { ROUAsset, LeaseType } from '../models/ROUAsset';

/* ========================================
   HELPER FUNCTIONS
   ======================================== */

/**
 * Generate a date in the past
 */
function generatePastDate(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
}

/**
 * Random number between min and max
 */
function randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Format currency (for display purposes)
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Calculate depreciation
 */
function calculateDepreciation(
    grossValue: number,
    rate: number,
    yearsOld: number
): number {
    const annualDepreciation = grossValue * (rate / 100);
    const accumulated = annualDepreciation * yearsOld;
    return Math.min(accumulated, grossValue); // Can't depreciate more than gross value
}

/* ========================================
   ASSET DATA GENERATION
   ======================================== */

/**
 * Vendor names (realistic corporate vendors)
 */
const vendors = [
    'Tata Steel Ltd',
    'L&T Construction',
    'Mahindra & Mahindra',
    'Godrej & Boyce',
    'Wipro Technologies',
    'Infosys Systems',
    'ThyssenKrupp India',
    'Siemens India',
    'ABB India Ltd',
    'Schneider Electric',
    'Dell Technologies',
    'HP Enterprise',
    'Cisco Systems',
    'Lenovo India',
    'Samsung Electronics',
    'LG Electronics',
    'Mitsubishi Electric',
    'Hitachi India',
    'Bosch India',
    'Hyundai Motors',
    'Maruti Suzuki',
    'Asian Paints',
    'Berger Paints',
    'Pidilite Industries',
    '', // Intentionally blank for data quality issues
    '' // Intentionally blank for data quality issues
];

/**
 * Location names (realistic corporate locations)
 */
const locations = [
    'Head Office - Mumbai',
    'Head Office - Floor 2',
    'Head Office - Floor 3',
    'Manufacturing Plant - Pune',
    'Manufacturing Plant - Chennai',
    'Warehouse - Bangalore',
    'Warehouse - Delhi',
    'Regional Office - Kolkata',
    'Regional Office - Hyderabad',
    'Data Center - Noida',
    'R&D Center - Bangalore',
    'Training Center - Gurgaon'
];

/**
 * Asset name templates by category
 */
const assetNames: Record<string, string[]> = {
    [AssetCategory.LAND]: [
        'Commercial Plot - Sector',
        'Industrial Land Parcel',
        'Warehouse Plot',
        'Office Complex Land'
    ],
    [AssetCategory.BUILDINGS]: [
        'Corporate Office Building',
        'Manufacturing Facility',
        'Warehouse Complex',
        'Administrative Block',
        'Employee Cafeteria Building'
    ],
    [AssetCategory.PLANT_MACHINERY]: [
        'CNC Machining Center',
        'Injection Molding Machine',
        'Industrial Lathe',
        'Hydraulic Press',
        'Conveyor System',
        'Assembly Line Robot',
        'Quality Testing Equipment',
        'Packaging Machine',
        'Material Handling System',
        'Production Line Equipment'
    ],
    [AssetCategory.FURNITURE_FIXTURES]: [
        'Executive Desk Set',
        'Conference Table',
        'Office Workstation',
        'Reception Counter',
        'Filing Cabinets',
        'Meeting Room Chairs',
        'Cafeteria Furniture Set'
    ],
    [AssetCategory.VEHICLES]: [
        'Executive Sedan',
        'Delivery Van',
        'Forklift',
        'Company Bus',
        'Utility Vehicle',
        'Material Handling Truck'
    ],
    [AssetCategory.OFFICE_EQUIPMENT]: [
        'Multifunction Printer',
        'Scanner System',
        'Shredder',
        'Photocopier',
        'Conference Phone System',
        'Projector'
    ],
    [AssetCategory.IT_EQUIPMENT]: [
        'Server Rack',
        'Network Switch',
        'Firewall Appliance',
        'Desktop Computer',
        'Laptop',
        'Monitor Display',
        'UPS System',
        'Storage Array',
        'Backup System'
    ],
    [AssetCategory.LEASEHOLD_IMPROVEMENTS]: [
        'Office Renovation',
        'HVAC Installation',
        'Electrical Upgrades',
        'Flooring Installation',
        'Partition Walls'
    ]
};

/**
 * Generate assets by category
 */
function generateAssets(): Asset[] {
    const assets: Asset[] = [];
    let assetCounter = 1;

    // Define how many assets per category
    const categoryDistribution: Record<string, number> = {
        [AssetCategory.LAND]: 5,
        [AssetCategory.BUILDINGS]: 8,
        [AssetCategory.PLANT_MACHINERY]: 60,
        [AssetCategory.FURNITURE_FIXTURES]: 40,
        [AssetCategory.VEHICLES]: 15,
        [AssetCategory.OFFICE_EQUIPMENT]: 35,
        [AssetCategory.IT_EQUIPMENT]: 50,
        [AssetCategory.LEASEHOLD_IMPROVEMENTS]: 10
    };

    // Generate assets for each category
    Object.entries(categoryDistribution).forEach(([category, count]) => {
        const names = assetNames[category];
        
        for (let i = 0; i < count; i++) {
            // Select random name template
            const baseName = names[randomBetween(0, names.length - 1)];
            const name = `${baseName} ${i > 0 ? i + 1 : ''}`.trim();
            
            // Age of asset (in years)
            const yearsOld = randomBetween(1, 10);
            const daysOld = yearsOld * 365 + randomBetween(0, 364);
            
            // Depreciation rate based on category
            let depreciationRate: number;
            let usefulLife: number;
            
            switch (category) {
                case AssetCategory.LAND:
                    depreciationRate = 0; // Land doesn't depreciate
                    usefulLife = 0;
                    break;
                case AssetCategory.BUILDINGS:
                    depreciationRate = 5;
                    usefulLife = 30;
                    break;
                case AssetCategory.PLANT_MACHINERY:
                    depreciationRate = 15;
                    usefulLife = 10;
                    break;
                case AssetCategory.IT_EQUIPMENT:
                    depreciationRate = 40;
                    usefulLife = 3;
                    break;
                case AssetCategory.VEHICLES:
                    depreciationRate = 20;
                    usefulLife = 8;
                    break;
                default:
                    depreciationRate = 10;
                    usefulLife = 10;
            }
            
            // Gross value based on category (realistic ranges)
            let grossValue: number;
            
            switch (category) {
                case AssetCategory.LAND:
                    grossValue = randomBetween(5000000, 50000000);
                    break;
                case AssetCategory.BUILDINGS:
                    grossValue = randomBetween(10000000, 100000000);
                    break;
                case AssetCategory.PLANT_MACHINERY:
                    grossValue = randomBetween(500000, 15000000);
                    break;
                case AssetCategory.VEHICLES:
                    grossValue = randomBetween(800000, 5000000);
                    break;
                case AssetCategory.IT_EQUIPMENT:
                    grossValue = randomBetween(30000, 500000);
                    break;
                default:
                    grossValue = randomBetween(50000, 2000000);
            }
            
            // Calculate depreciation
            const accumulatedDepreciation = calculateDepreciation(
                grossValue,
                depreciationRate,
                yearsOld
            );
            const netValue = grossValue - accumulatedDepreciation;
            
            // Select vendor (some will be blank intentionally)
            const vendor = vendors[randomBetween(0, vendors.length - 1)];
            
            // Create asset
            assets.push({
                id: `AS-${String(assetCounter).padStart(4, '0')}`,
                name,
                category,
                vendor,
                purchaseDate: generatePastDate(daysOld),
                grossValue,
                accumulatedDepreciation,
                netValue,
                depreciationRate,
                usefulLife,
                location: locations[randomBetween(0, locations.length - 1)]
            });
            
            assetCounter++;
        }
    });

    return assets;
}

/* ========================================
   CWIP DATA GENERATION
   ======================================== */

/**
 * CWIP project names
 */
const cwipProjectNames = [
    'ERP System Migration',
    'Warehouse Automation Phase 2',
    'Factory Expansion - Building C',
    'Solar Power Installation',
    'Office Renovation - Floor 5',
    'New Production Line Setup',
    'IT Infrastructure Upgrade',
    'HVAC System Replacement',
    'Security System Overhaul',
    'Employee Parking Structure',
    'Quality Lab Construction',
    'Data Center Upgrade',
    'Manufacturing Equipment Procurement',
    'Logistics Hub Development',
    'R&D Facility Expansion'
];

/**
 * Determine ageing bucket
 */
function getAgeingBucket(days: number): string {
    if (days <= 90) return CWIPAgeingBucket.BUCKET_0_90;
    if (days <= 180) return CWIPAgeingBucket.BUCKET_91_180;
    if (days <= 365) return CWIPAgeingBucket.BUCKET_181_365;
    return CWIPAgeingBucket.BUCKET_OVER_365;
}

/**
 * Generate CWIP projects
 */
function generateCWIP(): CWIP[] {
    const cwipProjects: CWIP[] = [];
    
    cwipProjectNames.forEach((projectName, index) => {
        // Age in days
        let ageingDays: number;
        
        // Make some projects aged (>365 days) for exception detection
        if (index < 2) {
            ageingDays = randomBetween(380, 500); // Aged projects
        } else if (index < 5) {
            ageingDays = randomBetween(200, 350);
        } else {
            ageingDays = randomBetween(30, 180); // Recent projects
        }
        
        const amountSpent = randomBetween(500000, 10000000);
        const status = ageingDays > 365 ? CWIPStatus.UNDER_REVIEW : 
                       ageingDays > 300 ? CWIPStatus.ON_HOLD : 
                       CWIPStatus.ACTIVE;
        
        cwipProjects.push({
            id: `CWIP-${String(index + 1).padStart(3, '0')}`,
            projectName,
            startDate: generatePastDate(ageingDays),
            amountSpent,
            ageingDays,
            ageingBucket: getAgeingBucket(ageingDays),
            status
        });
    });
    
    return cwipProjects;
}

/* ========================================
   RECONCILIATION DATA GENERATION
   ======================================== */

/**
 * Generate reconciliation items
 */
function generateReconciliation(assets: Asset[]): ReconciliationItem[] {
    const reconciliationItems: ReconciliationItem[] = [];
    
    // Sample 25 assets for reconciliation
    const sampleSize = Math.min(25, assets.length);
    const sampledAssets = assets.slice(0, sampleSize);
    
    sampledAssets.forEach((asset, index) => {
        const systemDepreciation = asset.accumulatedDepreciation;
        
        // Determine deprecation method and GL depreciation based on scenarios
        let glDepreciation: number;
        let depreciationMethod: string;
        let differencePercent: number;
        
        // Scenario 1: Non-depreciable asset (Land) - indices 0-1
        if (asset.category === AssetCategory.LAND && index < 2) {
            // Land assets should have NO depreciation method
            depreciationMethod = 'None';
            glDepreciation = 0; // Land is never depreciated
            
            // Calculate percentage (0 / 0 = special case)
            differencePercent = 0;
        }
        // Scenario 2: Non-depreciable asset with wrongly assigned method (indices 2-3)
        else if (asset.category === AssetCategory.LAND && index < 4) {
            // ERROR: Land has depreciation method assigned
            depreciationMethod = 'Straight Line'; // Policy violation!
            glDepreciation = systemDepreciation; // GL also has it
            differencePercent = 0; // Numeric match, but policy violation
        }
        // Scenario 3: Major mismatch (>5%) - indices 4-5
        else if (index < 6) {
            depreciationMethod = 'Straight Line';
            const variance = randomBetween(8, 15) / 100;
            glDepreciation = systemDepreciation * (1 - variance);
            differencePercent = (variance * 100);
        }
        // Scenario 4: Minor variance (<5%) - indices 6-10
        else if (index < 11) {
            depreciationMethod = 'Straight Line';
            const variance = randomBetween(1, 4) / 100;
            glDepreciation = systemDepreciation * (1 - variance);
            differencePercent = (variance * 100);
        }
        // Scenario 5: Perfect match - indices 11+
        else {
            depreciationMethod = 'Straight Line';
            glDepreciation = systemDepreciation;
            differencePercent = 0;
        }
        
        const difference = systemDepreciation - glDepreciation;
        
        // Get status and reason using policy-based logic
        const { status, reason } = getReconciliationStatusWithReason(
            differencePercent,
            asset.category,
            systemDepreciation,
            depreciationMethod
        );
        
        reconciliationItems.push({
            assetId: asset.id,
            assetName: asset.name,
            assetCategory: asset.category,
            systemDepreciation,
            glDepreciation,
            difference,
            differencePercent: Math.round(differencePercent * 10) / 10,
            status,
            statusReason: reason,
            depreciationMethod
        });
    });
    
    return reconciliationItems;
}

/**
 * GENERATE ROU ASSETS
 * 
 * Creates realistic Right-of-Use asset leases under IFRS 16 / Ind AS 116
 * 
 * ROU Assets represent:
 * - Equipment leases: Machinery, production equipment
 * - Vehicle leases: Company vehicles, trucks
 * - Property leases: Office space, warehouses
 * 
 * Each lease has:
 * - Initial ROU asset recognized at lease commencement
 * - Lease liability representing future payment obligations
 * - Depreciation (matching lease term)
 * - Interest accrual on liability
 * - Remaining lease term for analysis
 */
function generateROUAssets(): ROUAsset[] {
    const routAssets: ROUAsset[] = [];
    
    // ROU Asset 1: Vehicle Fleet - Finance Lease
    routAssets.push({
        id: 'ROU-0001',
        assetName: 'Finance Lease: Company Vehicle Fleet (10 vehicles)',
        leaseType: LeaseType.VEHICLE,
        vendor: 'Maruti Suzuki Finance',
        leaseStartDate: generatePastDate(730),  // 2 years ago
        leaseEndDate: generatePastDate(-638),   // 638 days future
        rouAssetValue: 8500000,                 // ₹85 Lakh initial recognition
        leaseLiability: 2100000,                // ₹21 Lakh remaining liability
        rouDepreciation: 5667000,               // ₹56.67 Lakh accumulated (4 year lease, 2 years gone)
        leaseInterest: 345000,                  // ₹3.45 Lakh interest accrued
        remainingLeaseTermYears: 1.75,
        leaseTermYears: 4,
        location: 'Head Office - Mumbai',
        department: 'Operations'
    });
    
    // ROU Asset 2: Manufacturing Equipment - Operating Lease
    routAssets.push({
        id: 'ROU-0002',
        assetName: 'Operating Lease: CNC Machining Center',
        leaseType: LeaseType.EQUIPMENT,
        vendor: 'DMG Mori India',
        leaseStartDate: generatePastDate(365),  // 1 year ago
        leaseEndDate: generatePastDate(-1095),  // 3 years future
        rouAssetValue: 12000000,                // ₹1.2 Cr
        leaseLiability: 9500000,                // ₹95 Lakh remaining
        rouDepreciation: 3000000,               // ₹30 Lakh (4 year term, 1 year elapsed)
        leaseInterest: 285000,                  // ₹2.85 Lakh
        remainingLeaseTermYears: 3.0,
        leaseTermYears: 4,
        location: 'Manufacturing Plant - Pune',
        department: 'Manufacturing'
    });
    
    // ROU Asset 3: Office Premises - Long-term Property Lease
    routAssets.push({
        id: 'ROU-0003',
        assetName: 'Operating Lease: Corporate Office Floor - 10 Years',
        leaseType: LeaseType.PROPERTY,
        vendor: 'K Raheja Corp (Property Development)',
        leaseStartDate: generatePastDate(2555), // ~7 years ago
        leaseEndDate: generatePastDate(-1095),  // ~3 years future
        rouAssetValue: 45000000,                // ₹4.5 Cr
        leaseLiability: 18900000,               // ₹1.89 Cr remaining
        rouDepreciation: 22050000,              // ₹2.21 Cr accumulated (10 year, 7 years elapsed)
        leaseInterest: 1125000,                 // ₹11.25 Lakh interests
        remainingLeaseTermYears: 2.9,
        leaseTermYears: 10,
        location: 'Head Office - Mumbai / Floor 2-3',
        department: 'Administration'
    });
    
    // ROU Asset 4: Warehouse Equipment Lease
    routAssets.push({
        id: 'ROU-0004',
        assetName: 'Operating Lease: Automated Warehouse System',
        leaseType: LeaseType.EQUIPMENT,
        vendor: 'Vanderlande Industries',
        leaseStartDate: generatePastDate(180),  // 6 months ago
        leaseEndDate: generatePastDate(-2160),  // 6 years future
        rouAssetValue: 18500000,                // ₹1.85 Cr
        leaseLiability: 17850000,               // ₹1.785 Cr remaining
        rouDepreciation: 308300,                // ₹3.08 Lakh (6 months on 7 year lease)
        leaseInterest: 58900,                   // ~59K interest
        remainingLeaseTermYears: 5.5,
        leaseTermYears: 7,
        location: 'Warehouse - Bangalore',
        department: 'Logistics'
    });
    
    // ROU Asset 5: Printing Equipment - Short-term Lease
    routAssets.push({
        id: 'ROU-0005',
        assetName: 'Finance Lease: Production Printing Equipment',
        leaseType: LeaseType.EQUIPMENT,
        vendor: 'Xerox India (Finance)',
        leaseStartDate: generatePastDate(270),  // 9 months ago
        leaseEndDate: generatePastDate(-900),   // 2.5 years future
        rouAssetValue: 2800000,                 // ₹28 Lakh
        leaseLiability: 1850000,                // ₹18.5 Lakh remaining
        rouDepreciation: 630000,                // ₹6.3 Lakh (9 months on 3 year lease)
        leaseInterest: 55200,                   // ₹55.2K
        remainingLeaseTermYears: 2.47,
        leaseTermYears: 3,
        location: 'Head Office - Floor 2',
        department: 'Administration'
    });
    
    // ROU Asset 6: Data Center Equipment
    routAssets.push({
        id: 'ROU-0006',
        assetName: 'Operating Lease: Data Center Infrastructure',
        leaseType: LeaseType.EQUIPMENT,
        vendor: 'Equinix India',
        leaseStartDate: generatePastDate(1095),  // 3 years ago
        leaseEndDate: generatePastDate(-729),    // 2 years future
        rouAssetValue: 15000000,                 // ₹1.5 Cr
        leaseLiability: 8250000,                 // ₹82.5 Lakh remaining
        rouDepreciation: 6000000,                // ₹60 Lakh (3 of 5 year lease)
        leaseInterest: 412500,                   // ₹4.125 Lakh
        remainingLeaseTermYears: 2.0,
        leaseTermYears: 5,
        location: 'Data Center - Noida',
        department: 'IT Infrastructure'
    });
    
    return routAssets;
}

/* ========================================
   EXPORT DATA
   ======================================== */

/* ========================================
   GENERATE AND EXPORT DATA
   ======================================== */

// Generate the data
const generatedAssets: Asset[] = generateAssets();
const generatedCWIP: CWIP[] = generateCWIP();
const generatedReconciliation: ReconciliationItem[] = generateReconciliation(generatedAssets);
const generatedROUAssets: ROUAsset[] = generateROUAssets();

// Export for use in other modules
export const assets = generatedAssets;
export const cwipProjects = generatedCWIP;
export const reconciliationData = generatedReconciliation;
export const rouAssets = generatedROUAssets;

// Summary stats (useful for debugging)
console.log('📊 Mock Data Generated:');
console.log(`   Assets: ${assets.length}`);
console.log(`   CWIP Projects: ${cwipProjects.length}`);
console.log(`   Reconciliation Items: ${reconciliationData.length}`);
console.log(`   ROU Assets (IFRS 16): ${rouAssets.length}`);
console.log(`   Assets with missing vendor: ${assets.filter(a => !a.vendor).length}`);
console.log(`   CWIP > 365 days: ${cwipProjects.filter(c => c.ageingDays > 365).length}`);
console.log(`   Reconciliation issues: ${reconciliationData.filter(r => r.status === ReconciliationStatus.INVESTIGATE).length}`);