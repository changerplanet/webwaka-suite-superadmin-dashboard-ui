'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getTenantBranding, createTenantBranding, updateTenantBranding, getUserTenants, getPlatformBranding } from '@/lib/api-client';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

interface BrandingConfig {
  id: string;
  brandName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
}

interface Tenant {
  id: string;
  name: string;
}

const FONT_OPTIONS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Source Sans Pro',
  'Raleway',
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];

export function TenantBrandingSection() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [config, setConfig] = useState<BrandingConfig | null>(null);
  const [platformConfig, setPlatformConfig] = useState<BrandingConfig | null>(null);
  const [formData, setFormData] = useState({
    brandName: '',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#3B82F6',
    secondaryColor: '',
    accentColor: '',
    fontFamily: 'Inter',
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const draftKey = `tenant-branding-draft-${selectedTenantId}`;
    const draft = localStorage.getItem(draftKey);
    if (draft && selectedTenantId) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(parsed);
        setHasUnsavedChanges(true);
      } catch (e) {
        // Ignore invalid draft
      }
    }
  }, [selectedTenantId]);

  // Save draft to localStorage on form change
  useEffect(() => {
    if (selectedTenantId && hasUnsavedChanges) {
      const draftKey = `tenant-branding-draft-${selectedTenantId}`;
      localStorage.setItem(draftKey, JSON.stringify(formData));
    }
  }, [formData, selectedTenantId, hasUnsavedChanges]);

  useEffect(() => {
    loadTenants();
    loadPlatformBranding();
  }, []);

  useEffect(() => {
    if (selectedTenantId) {
      loadTenantBranding();
    }
  }, [selectedTenantId]);

  async function loadTenants() {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await getUserTenants(token);
      setTenants(response.data || []);
      
      if (response.data && response.data.length > 0) {
        setSelectedTenantId(response.data[0].id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadPlatformBranding() {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await getPlatformBranding(token);
      setPlatformConfig(response.data);
    } catch (err) {
      // Platform branding is optional
      console.error('Failed to load platform branding:', err);
    }
  }

  async function loadTenantBranding() {
    if (!selectedTenantId) return;

    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await getTenantBranding(token, selectedTenantId);
      
      if (response.data) {
        setConfig(response.data);
        setFormData({
          brandName: response.data.brandName || '',
          logoUrl: response.data.logoUrl || '',
          faviconUrl: response.data.faviconUrl || '',
          primaryColor: response.data.primaryColor || '#3B82F6',
          secondaryColor: response.data.secondaryColor || '',
          accentColor: response.data.accentColor || '',
          fontFamily: response.data.fontFamily || 'Inter',
        });
        setLogoPreview(response.data.logoUrl || null);
        setFaviconPreview(response.data.faviconUrl || null);
        setHasUnsavedChanges(false);
        
        // Clear draft
        const draftKey = `tenant-branding-draft-${selectedTenantId}`;
        localStorage.removeItem(draftKey);
      } else {
        // No tenant config, use platform defaults
        setConfig(null);
        if (platformConfig) {
          setFormData({
            brandName: platformConfig.brandName || '',
            logoUrl: platformConfig.logoUrl || '',
            faviconUrl: platformConfig.faviconUrl || '',
            primaryColor: platformConfig.primaryColor || '#3B82F6',
            secondaryColor: platformConfig.secondaryColor || '',
            accentColor: platformConfig.accentColor || '',
            fontFamily: platformConfig.fontFamily || 'Inter',
          });
          setLogoPreview(platformConfig.logoUrl || null);
          setFaviconPreview(platformConfig.faviconUrl || null);
        } else {
          setFormData({
            brandName: '',
            logoUrl: '',
            faviconUrl: '',
            primaryColor: '#3B82F6',
            secondaryColor: '',
            accentColor: '',
            fontFamily: 'Inter',
          });
          setLogoPreview(null);
          setFaviconPreview(null);
        }
        setHasUnsavedChanges(false);
      }
    } catch (err: any) {
      if (err.status === 404 || err.message.includes('not found')) {
        // No tenant config exists, use platform defaults
        setConfig(null);
        if (platformConfig) {
          setFormData({
            brandName: platformConfig.brandName || '',
            logoUrl: platformConfig.logoUrl || '',
            faviconUrl: platformConfig.faviconUrl || '',
            primaryColor: platformConfig.primaryColor || '#3B82F6',
            secondaryColor: platformConfig.secondaryColor || '',
            accentColor: platformConfig.accentColor || '',
            fontFamily: platformConfig.fontFamily || 'Inter',
          });
          setLogoPreview(platformConfig.logoUrl || null);
          setFaviconPreview(platformConfig.faviconUrl || null);
        }
        setHasUnsavedChanges(false);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  function validateFile(file: File): string | null {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload PNG, JPEG, or SVG.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 2MB limit.';
    }
    return null;
  }

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setUploadingLogo(true);
      setError(null);

      // Convert to base64 for preview (in real app, upload to S3/CDN)
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setFormData(prev => ({ ...prev, logoUrl: result }));
        setHasUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleFaviconUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setUploadingFavicon(true);
      setError(null);

      // Convert to base64 for preview (in real app, upload to S3/CDN)
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFaviconPreview(result);
        setFormData(prev => ({ ...prev, faviconUrl: result }));
        setHasUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingFavicon(false);
    }
  }

  async function handleSave() {
    if (!selectedTenantId) {
      setError('Please select a tenant');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const data = {
        brandName: formData.brandName,
        logoUrl: formData.logoUrl || undefined,
        faviconUrl: formData.faviconUrl || undefined,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor || undefined,
        accentColor: formData.accentColor || undefined,
        fontFamily: formData.fontFamily || undefined,
      };

      if (config) {
        await updateTenantBranding(token, selectedTenantId, data);
        setSuccessMessage('Tenant branding updated successfully!');
      } else {
        await createTenantBranding(token, selectedTenantId, data);
        setSuccessMessage('Tenant branding created successfully!');
      }

      await loadTenantBranding();
      setHasUnsavedChanges(false);
      
      // Clear draft
      const draftKey = `tenant-branding-draft-${selectedTenantId}`;
      localStorage.removeItem(draftKey);
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (config) {
      setFormData({
        brandName: config.brandName || '',
        logoUrl: config.logoUrl || '',
        faviconUrl: config.faviconUrl || '',
        primaryColor: config.primaryColor || '#3B82F6',
        secondaryColor: config.secondaryColor || '',
        accentColor: config.accentColor || '',
        fontFamily: config.fontFamily || 'Inter',
      });
      setLogoPreview(config.logoUrl || null);
      setFaviconPreview(config.faviconUrl || null);
    } else if (platformConfig) {
      setFormData({
        brandName: platformConfig.brandName || '',
        logoUrl: platformConfig.logoUrl || '',
        faviconUrl: platformConfig.faviconUrl || '',
        primaryColor: platformConfig.primaryColor || '#3B82F6',
        secondaryColor: platformConfig.secondaryColor || '',
        accentColor: platformConfig.accentColor || '',
        fontFamily: platformConfig.fontFamily || 'Inter',
      });
      setLogoPreview(platformConfig.logoUrl || null);
      setFaviconPreview(platformConfig.faviconUrl || null);
    }
    setSuccessMessage(null);
    setError(null);
    setHasUnsavedChanges(false);
    
    // Clear draft
    const draftKey = `tenant-branding-draft-${selectedTenantId}`;
    localStorage.removeItem(draftKey);
  }

  if (loading && tenants.length === 0) {
    return <LoadingSkeleton rows={8} />;
  }

  if (error && tenants.length === 0) {
    return <ErrorState message={error} onRetry={loadTenants} />;
  }

  if (tenants.length === 0) {
    return (
      <EmptyState
        title="No Tenants Available"
        description="There are no tenants to configure branding for. Create a tenant first."
      />
    );
  }

  const isFormValid = formData.brandName.trim() !== '' && formData.primaryColor.trim() !== '';
  const usingPlatformDefaults = !config && platformConfig;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-blue-800">
          <strong>Tenant Branding</strong> — Configure branding for a specific tenant. 
          These settings will override platform defaults for the selected tenant.
        </p>
      </div>

      {usingPlatformDefaults && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-yellow-800">
            ℹ️ <strong>Using Platform Defaults</strong> — This tenant does not have custom branding configured. 
            The form is pre-filled with platform defaults.
          </p>
        </div>
      )}

      {hasUnsavedChanges && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-orange-800">
            💾 <strong>Unsaved Changes</strong> — Your changes are saved locally. Click "Save Changes" to apply them.
          </p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Tenant Selector */}
      <div className="bg-white rounded-lg border p-3 sm:p-4">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Select Tenant
        </label>
        <select
          value={selectedTenantId}
          onChange={(e) => setSelectedTenantId(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={saving}
        >
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Form Section */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg border p-4 sm:p-6 space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">Branding Configuration</h3>

              {/* Brand Name */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, brandName: e.target.value }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter brand name"
                  disabled={saving}
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Logo
                </label>
                <div className="space-y-2">
                  {logoPreview && (
                    <div className="flex items-center justify-center w-full h-24 sm:h-32 bg-gray-50 border border-gray-200 rounded-md overflow-hidden">
                      <img src={logoPreview} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="block w-full text-xs sm:text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={saving || uploadingLogo}
                  />
                  <p className="text-xs text-gray-500">PNG, JPEG, or SVG. Max 2MB.</p>
                </div>
              </div>

              {/* Favicon Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Favicon
                </label>
                <div className="space-y-2">
                  {faviconPreview && (
                    <div className="flex items-center justify-center w-16 h-16 bg-gray-50 border border-gray-200 rounded-md overflow-hidden">
                      <img src={faviconPreview} alt="Favicon preview" className="max-h-full max-w-full object-contain" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleFaviconUpload}
                    className="block w-full text-xs sm:text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={saving || uploadingFavicon}
                  />
                  <p className="text-xs text-gray-500">PNG, JPEG, or SVG. Max 2MB.</p>
                </div>
              </div>

              {/* Primary Color */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Primary Color <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, primaryColor: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                    disabled={saving}
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, primaryColor: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#3B82F6"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Secondary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.secondaryColor || '#6B7280'}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, secondaryColor: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                    disabled={saving}
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, secondaryColor: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#6B7280"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.accentColor || '#10B981'}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, accentColor: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                    disabled={saving}
                  />
                  <input
                    type="text"
                    value={formData.accentColor}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, accentColor: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#10B981"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Font Family
                </label>
                <select
                  value={formData.fontFamily}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, fontFamily: e.target.value }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <button
                  onClick={handleSave}
                  disabled={!isFormValid || saving}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleReset}
                  disabled={saving}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Domain Placeholder */}
            <div className="bg-white rounded-lg border p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold">Custom Domains</h3>
                <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                  Coming in Phase 6.3
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">
                Custom domain management will be available in a future release. 
                This feature will allow you to configure custom domains for tenant-specific branding.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <p className="text-xs text-gray-500 italic">
                  🔒 Controlled by Core — Domain configuration requires DNS verification and SSL certificate management.
                </p>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg border p-4 sm:p-6 space-y-4 sticky top-4">
              <h3 className="text-base sm:text-lg font-semibold">Live Preview</h3>
              
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 space-y-4"
                style={{
                  backgroundColor: `${formData.primaryColor}10`,
                  fontFamily: formData.fontFamily,
                }}
              >
                {/* Logo Preview */}
                {logoPreview && (
                  <div className="flex justify-center mb-4">
                    <img 
                      src={logoPreview} 
                      alt="Logo" 
                      className="max-h-16 sm:max-h-20 object-contain"
                    />
                  </div>
                )}

                {/* Brand Name */}
                <h2 
                  className="text-xl sm:text-2xl font-bold text-center"
                  style={{ color: formData.primaryColor }}
                >
                  {formData.brandName || 'Brand Name'}
                </h2>

                {/* Sample UI Elements */}
                <div className="space-y-3">
                  <button
                    className="w-full px-4 py-2 text-sm font-medium text-white rounded-md"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    Primary Button
                  </button>
                  
                  {formData.secondaryColor && (
                    <button
                      className="w-full px-4 py-2 text-sm font-medium text-white rounded-md"
                      style={{ backgroundColor: formData.secondaryColor }}
                    >
                      Secondary Button
                    </button>
                  )}

                  {formData.accentColor && (
                    <div 
                      className="p-3 rounded-md text-xs sm:text-sm"
                      style={{ 
                        backgroundColor: `${formData.accentColor}20`,
                        borderLeft: `4px solid ${formData.accentColor}`,
                      }}
                    >
                      <strong style={{ color: formData.accentColor }}>Success!</strong> This is an accent color example.
                    </div>
                  )}
                </div>

                {/* Color Palette */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-2">Color Palette</p>
                  <div className="flex gap-2">
                    <div className="flex-1 text-center">
                      <div 
                        className="w-full h-12 rounded-md border border-gray-300 mb-1"
                        style={{ backgroundColor: formData.primaryColor }}
                      />
                      <p className="text-xs text-gray-600">Primary</p>
                    </div>
                    {formData.secondaryColor && (
                      <div className="flex-1 text-center">
                        <div 
                          className="w-full h-12 rounded-md border border-gray-300 mb-1"
                          style={{ backgroundColor: formData.secondaryColor }}
                        />
                        <p className="text-xs text-gray-600">Secondary</p>
                      </div>
                    )}
                    {formData.accentColor && (
                      <div className="flex-1 text-center">
                        <div 
                          className="w-full h-12 rounded-md border border-gray-300 mb-1"
                          style={{ backgroundColor: formData.accentColor }}
                        />
                        <p className="text-xs text-gray-600">Accent</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center">
                This preview shows how your branding will appear across the platform.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
