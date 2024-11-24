export type LicenseType = 'free' | 'basic' | 'professional' | 'enterprise';

export interface UserLicense {
  id: string;
  userId: string;
  licenseType: LicenseType;
  features: string[];
  startsAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export const FEATURE_NAMES = {
  VIEW_COMPANIES: 'view_companies',
  CREATE_COMPANY: 'create_company',
  BASIC_ANALYTICS: 'basic_analytics',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  TEAM_MANAGEMENT: 'team_management',
  API_ACCESS: 'api_access',
  CUSTOM_FIELDS: 'custom_fields',
  BULK_OPERATIONS: 'bulk_operations',
  EXPORT_DATA: 'export_data',
} as const;

export type FeatureName = keyof typeof FEATURE_NAMES;

export const LICENSE_FEATURES: Record<LicenseType, string[]> = {
  free: [
    FEATURE_NAMES.VIEW_COMPANIES,
    FEATURE_NAMES.CREATE_COMPANY,
    FEATURE_NAMES.BASIC_ANALYTICS,
  ],
  basic: [
    FEATURE_NAMES.VIEW_COMPANIES,
    FEATURE_NAMES.CREATE_COMPANY,
    FEATURE_NAMES.BASIC_ANALYTICS,
    FEATURE_NAMES.TEAM_MANAGEMENT,
    FEATURE_NAMES.EXPORT_DATA,
  ],
  professional: [
    FEATURE_NAMES.VIEW_COMPANIES,
    FEATURE_NAMES.CREATE_COMPANY,
    FEATURE_NAMES.BASIC_ANALYTICS,
    FEATURE_NAMES.ADVANCED_ANALYTICS,
    FEATURE_NAMES.TEAM_MANAGEMENT,
    FEATURE_NAMES.EXPORT_DATA,
    FEATURE_NAMES.CUSTOM_FIELDS,
  ],
  enterprise: [
    FEATURE_NAMES.VIEW_COMPANIES,
    FEATURE_NAMES.CREATE_COMPANY,
    FEATURE_NAMES.BASIC_ANALYTICS,
    FEATURE_NAMES.ADVANCED_ANALYTICS,
    FEATURE_NAMES.TEAM_MANAGEMENT,
    FEATURE_NAMES.API_ACCESS,
    FEATURE_NAMES.CUSTOM_FIELDS,
    FEATURE_NAMES.BULK_OPERATIONS,
    FEATURE_NAMES.EXPORT_DATA,
  ],
};