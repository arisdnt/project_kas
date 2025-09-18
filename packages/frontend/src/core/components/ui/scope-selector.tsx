/**
 * Scope Selector Component
 * Dropdown for selecting tenant and store scope for create/update operations
 */

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import { Checkbox } from '@/core/components/ui/checkbox';
import { Label } from '@/core/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card';
import { useScopeStore } from '@/core/store/scopeStore';
import { Building2, Store, Globe, Users } from 'lucide-react';

interface ScopeSelectorProps {
  onScopeChange: (scope: {
    targetTenantId?: string;
    targetStoreId?: string;
    applyToAllTenants?: boolean;
    applyToAllStores?: boolean;
  }) => void;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
}

export function ScopeSelector({ onScopeChange, disabled = false, className, compact = false }: ScopeSelectorProps) {
  const {
    capabilities,
    tenants,
    stores,
    loading,
    fetchCapabilities,
    fetchTenants,
    fetchStores
  } = useScopeStore();

  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [applyToAllTenants, setApplyToAllTenants] = useState(false);
  const [applyToAllStores, setApplyToAllStores] = useState(false);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      await fetchCapabilities();
      if (capabilities?.canSelectTenant) {
        await fetchTenants();
      }
      if (capabilities?.canSelectStore) {
        await fetchStores();
      }
    };

    initializeData();
  }, [fetchCapabilities, fetchTenants, fetchStores, capabilities?.canSelectTenant, capabilities?.canSelectStore]);

  // Handle tenant selection change
  const handleTenantChange = async (tenantId: string) => {
    setSelectedTenantId(tenantId);
    setSelectedStoreId('');
    setApplyToAllStores(false);

    // Fetch stores for selected tenant
    if (capabilities?.canSelectStore) {
      await fetchStores(tenantId);
    }

    updateScope({
      targetTenantId: tenantId,
      targetStoreId: undefined,
      applyToAllTenants,
      applyToAllStores: false
    });
  };

  // Handle store selection change
  const handleStoreChange = (storeId: string) => {
    setSelectedStoreId(storeId);
    setApplyToAllStores(false);

    updateScope({
      targetTenantId: selectedTenantId,
      targetStoreId: storeId,
      applyToAllTenants,
      applyToAllStores: false
    });
  };

  // Handle apply to all tenants
  const handleApplyToAllTenants = (checked: boolean) => {
    setApplyToAllTenants(checked);
    if (checked) {
      setSelectedTenantId('');
      setSelectedStoreId('');
      setApplyToAllStores(false);
    }

    updateScope({
      targetTenantId: checked ? undefined : selectedTenantId,
      targetStoreId: checked ? undefined : selectedStoreId,
      applyToAllTenants: checked,
      applyToAllStores: false
    });
  };

  // Handle apply to all stores
  const handleApplyToAllStores = (checked: boolean) => {
    setApplyToAllStores(checked);
    if (checked) {
      setSelectedStoreId('');
    }

    updateScope({
      targetTenantId: selectedTenantId,
      targetStoreId: checked ? undefined : selectedStoreId,
      applyToAllTenants,
      applyToAllStores: checked
    });
  };

  // Update scope callback
  const updateScope = (scope: any) => {
    onScopeChange(scope);
  };

  // Show loading state
  if (loading) {
    if (compact) {
      return (
        <div className={className}>
          <p className="text-sm text-muted-foreground">Loading scope options...</p>
        </div>
      );
    }
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Scope Selection
          </CardTitle>
          <CardDescription>Loading scope options...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Don't show if user has no scope selection capabilities
  if (!capabilities?.canSelectTenant && !capabilities?.canSelectStore) {
    return null;
  }

  const content = (
    <div className="space-y-4">
      {/* Apply to All Tenants (God user only) */}
      {capabilities?.canApplyToAllTenants && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="applyToAllTenants"
            checked={applyToAllTenants}
            onCheckedChange={handleApplyToAllTenants}
            disabled={disabled}
          />
          <Label htmlFor="applyToAllTenants" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Apply to all tenants
          </Label>
        </div>
      )}

      {/* Tenant Selection */}
      {capabilities?.canSelectTenant && !applyToAllTenants && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Select Tenant
          </Label>
          <Select
            value={selectedTenantId}
            onValueChange={handleTenantChange}
            disabled={disabled || applyToAllTenants}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose tenant..." />
            </SelectTrigger>
            <SelectContent>
              {tenants.map((tenant) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Apply to All Stores (God user and Admin) */}
      {capabilities?.canApplyToAllStores && !applyToAllTenants && (selectedTenantId || capabilities?.currentTenantId) && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="applyToAllStores"
            checked={applyToAllStores}
            onCheckedChange={handleApplyToAllStores}
            disabled={disabled}
          />
          <Label htmlFor="applyToAllStores" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Apply to all stores in tenant
          </Label>
        </div>
      )}

      {/* Store Selection */}
      {capabilities?.canSelectStore && !applyToAllTenants && !applyToAllStores && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Select Store
          </Label>
          <Select
            value={selectedStoreId}
            onValueChange={handleStoreChange}
            disabled={disabled || applyToAllTenants || applyToAllStores || (!selectedTenantId && !capabilities?.currentTenantId)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose store..." />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Info text based on current selection */}
      <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
        {applyToAllTenants && (
          <p className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            This data will be created for all tenants in the system
          </p>
        )}
        {applyToAllStores && !applyToAllTenants && (
          <p className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            This data will be created for all stores in the selected tenant
          </p>
        )}
        {!applyToAllTenants && !applyToAllStores && selectedStoreId && (
          <p className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            This data will be created for the selected store only
          </p>
        )}
        {!applyToAllTenants && !applyToAllStores && !selectedStoreId && selectedTenantId && (
          <p className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            This data will be created for the selected tenant
          </p>
        )}
      </div>
    </div>
  );

  if (compact) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Scope Selection
        </CardTitle>
        <CardDescription>
          Choose where to apply this data based on your access level
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}