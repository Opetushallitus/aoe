/**
 * License Information model
 */
export interface LicenseInformation {
  licenseType: string;
  licenseUrl: string;
  prohibitions?: string[];
  requirements?: string[];
  permissions?: string[];
}
