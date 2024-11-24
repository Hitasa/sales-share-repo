import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { LICENSE_FEATURES, LicenseType } from "@/types/license";
import { Check } from "lucide-react";
import { useLicense } from "@/hooks/useLicense";

const LICENSE_PRICES = {
  free: 0,
  basic: 9.99,
  professional: 29.99,
  enterprise: 99.99,
};

export function LicenseManager() {
  const { license } = useLicense();

  const handleUpgrade = async (newLicense: LicenseType) => {
    // TODO: Implement Stripe integration for payment
    console.log(`Upgrading to ${newLicense}`);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">License Management</h1>
      
      <div className="grid md:grid-cols-4 gap-6">
        {(Object.keys(LICENSE_FEATURES) as LicenseType[]).map((licenseType) => (
          <Card key={licenseType} className={`${license?.licenseType === licenseType ? 'border-primary' : ''}`}>
            <CardHeader>
              <CardTitle className="capitalize">{licenseType}</CardTitle>
              <CardDescription>
                ${LICENSE_PRICES[licenseType]}/month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {LICENSE_FEATURES[licenseType].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature.replace(/_/g, ' ').toLowerCase()}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {license?.licenseType === licenseType ? (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  variant={licenseType === 'free' ? 'outline' : 'default'}
                  onClick={() => handleUpgrade(licenseType)}
                >
                  {licenseType === 'free' ? 'Current Plan' : 'Upgrade'}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}