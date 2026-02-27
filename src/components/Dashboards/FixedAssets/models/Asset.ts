/**
 * ASSET.TS
 * 
 * Defines the structure of a Fixed Asset.
 * 
 * Every asset in our system must conform to this interface.
 * If we try to create an asset without a required field,
 * TypeScript will show an error before the code even runs.
 */

export interface Asset {
    id: string;                      // Unique identifier (e.g., "AS-0001")
    name: string;                    // Asset name
    category: string;                // Asset category (e.g., "Machinery")
    vendor: string;                  // Vendor/supplier name
    purchaseDate: string;            // Date acquired (YYYY-MM-DD format)
    grossValue: number;              // Original purchase price
    accumulatedDepreciation: number; // Total depreciation to date
    netValue: number;                // Current book value (gross - accumulated)
    depreciationRate: number;        // Annual depreciation rate (%)
    usefulLife: number;              // Expected useful life (years)
    location: string;                // Physical location
}

/**
 * ASSET CATEGORIES
 * 
 * Standard categories used in corporate finance.
 * These align with typical fixed asset classifications.
 */
export enum AssetCategory {
    LAND = 'Land',
    BUILDINGS = 'Buildings',
    PLANT_MACHINERY = 'Plant & Machinery',
    FURNITURE_FIXTURES = 'Furniture & Fixtures',
    VEHICLES = 'Vehicles',
    OFFICE_EQUIPMENT = 'Office Equipment',
    IT_EQUIPMENT = 'IT Equipment',
    LEASEHOLD_IMPROVEMENTS = 'Leasehold Improvements'
}

/**
 * Why use an enum?
 * 
 * Instead of typing "Plant & Machinery" 50 times (risk of typos),
 * we use AssetCategory.PLANT_MACHINERY.
 * 
 * TypeScript autocomplete shows available options.
 * Prevents errors like "Plant and Machinery" vs "Plant & Machinery".
 */