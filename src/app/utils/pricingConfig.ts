/**
 * Pricing Configuration Utility
 * - Manages printer rental pricing configuration
 * - Supports dynamic pricing updates from admin dashboard
 * - Stores configuration in localStorage
 * - Provides helper functions for price calculations
 */

/**
 * Model Pricing Interface
 * - Defines pricing structure for each rental period
 */
export interface ModelPricing {
  threeMonths: number;   // Monthly rental fee for 3-month contract
  sixMonths: number;     // Monthly rental fee for 6-month contract
  twelveMonths: number;  // Monthly rental fee for 12-month contract
}

/**
 * Pricing Configuration Interface
 * - Complete pricing structure for all models and services
 */
export interface PricingConfig {
  models: {
    epson3156A4: ModelPricing;    // Epson 3156 A4 (Small)
    epson1390A3: ModelPricing;    // Epson 1390 A3 (Medium)
    epson3880P800A2: ModelPricing; // Epson 3880/P800 A2 (Large)
  };
  softwarePrice: number;    // Monthly software rental fee
  installationFee: number;  // One-time installation fee
  surcharges: {
    oneMonth: number;       // 1-month rental surcharge (based on 3-month price)
  };
}

/**
 * Default Pricing Configuration
 * - Initial pricing values for all models
 * - Used when no custom configuration is saved
 */
const DEFAULT_PRICING: PricingConfig = {
  models: {
    epson3156A4: {
      threeMonths: 149000,    // 149,000 KRW/month for 3-month contract
      sixMonths: 139000,      // 139,000 KRW/month for 6-month contract
      twelveMonths: 129000,   // 129,000 KRW/month for 12-month contract
    },
    epson1390A3: {
      threeMonths: 219000,    // 219,000 KRW/month for 3-month contract
      sixMonths: 209000,      // 209,000 KRW/month for 6-month contract
      twelveMonths: 199000,   // 199,000 KRW/month for 12-month contract
    },
    epson3880P800A2: {
      threeMonths: 279000,    // 279,000 KRW/month for 3-month contract
      sixMonths: 269000,      // 269,000 KRW/month for 6-month contract
      twelveMonths: 259000,   // 259,000 KRW/month for 12-month contract
    },
  },
  softwarePrice: 15000,    // 15,000 KRW/month for printing software
  installationFee: 170000, // 170,000 KRW one-time installation fee
  surcharges: {
    oneMonth: 0.35,        // 35% surcharge for 1-month rental (based on 3-month price)
  },
};

const STORAGE_KEY = 'printer_rental_pricing_config';

/**
 * Get Pricing Configuration
 * - Loads pricing from localStorage
 * - Returns default pricing if not found
 * @returns {PricingConfig} Current pricing configuration
 */
export const getPricingConfig = (): PricingConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load pricing config:', error);
  }
  return DEFAULT_PRICING;
};

/**
 * Save Pricing Configuration
 * - Saves pricing to localStorage
 * - Throws error if save fails
 * @param {PricingConfig} config - Pricing configuration to save
 */
export const savePricingConfig = (config: PricingConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save pricing config:', error);
    throw error;
  }
};

/**
 * Reset Pricing Configuration
 * - Removes custom pricing from localStorage
 * - Reverts to default pricing
 */
export const resetPricingConfig = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Calculate Monthly Price Based on Rental Period
 * - Applies pricing tiers and surcharges
 * 
 * Pricing Logic:
 * - 1 month: 3-month price + 35% surcharge
 * - 2-5 months: 3-month price
 * - 6-11 months: 6-month discounted price
 * - 12+ months: 12-month lowest price
 * 
 * @param {ModelPricing} modelPricing - Pricing for specific model
 * @param {number} rentalPeriod - Rental period in months
 * @returns {number} Calculated monthly rental fee
 */
export const getMonthlyPrice = (modelPricing: ModelPricing, rentalPeriod: number): number => {
  if (rentalPeriod === 1) {
    // 1-month contract: 3-month price + 35% surcharge
    return Math.round(modelPricing.threeMonths * 1.35);
  } else if (rentalPeriod >= 12) {
    // 12+ months: 12-month lowest price
    return modelPricing.twelveMonths;
  } else if (rentalPeriod >= 6) {
    // 6-11 months: 6-month discounted price
    return modelPricing.sixMonths;
  } else {
    // 2-5 months: 3-month standard price
    return modelPricing.threeMonths;
  }
};