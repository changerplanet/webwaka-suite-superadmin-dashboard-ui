'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getPlatformBranding, createPlatformBranding, updatePlatformBranding } from '@/lib/api-client';
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

export function PlatformBrandingSection() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<BrandingConfig | null>(null);
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

  useEffect(() => {
    loadBranding();
  }, []);

  async function loadBranding() {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await getPlatformBranding(token);
      
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
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
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
        await updatePlatformBranding(token, data);
        setSuccessMessage('Platform branding updated successfully!');
      } else {
        await createPlatformBranding(token, data);
        setSuccessMessage('Platform branding created successfully!');
      }

      await loadBranding();
      
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
    }
    setSuccessMessage(null);
    setError(null);
  }

  if (loading) {
    return <LoadingSkeleton rows={8} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadBranding} />;
  }

  const isFormValid = formData.brandName.trim() !== '' && formData.primaryColor.trim() !== '';

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Platform Branding</strong> — Configure the default branding for the entire platform. 
          Tenant-specific branding will override these defaults.
        </p>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h3 className="text-lg font-semibold">Branding Configuration</h3>

            {/* Brand Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="WebWaka"
                disabled={saving}
              />
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL
              </label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/logo.png"
                disabled={saving}
              />
            </div>

            {/* Favicon URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Favicon URL
              </label>
              <input
                type="url"
                value={formData.faviconUrl}
                onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/favicon.ico"
                disabled={saving}
              />
            </div>

            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Color <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
                  disabled={saving}
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#3B82F6"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secondary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.secondaryColor || '#6B7280'}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
                  disabled={saving}
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#6B7280"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accent Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.accentColor || '#10B981'}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
                  disabled={saving}
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#10B981"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Font Family
              </label>
              <select
                value={formData.fontFamily}
                onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving || !isFormValid}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : config ? 'Update Branding' : 'Create Branding'}
              </button>
              <button
                onClick={handleReset}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
            
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 space-y-6"
              style={{ fontFamily: formData.fontFamily }}
            >
              {/* Logo Preview */}
              {formData.logoUrl && (
                <div className="flex justify-center">
                  <img 
                    src={formData.logoUrl} 
                    alt="Logo Preview" 
                    className="h-12 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Brand Name */}
              <div className="text-center">
                <h2 
                  className="text-2xl font-bold"
                  style={{ color: formData.primaryColor }}
                >
                  {formData.brandName || 'Brand Name'}
                </h2>
              </div>

              {/* Color Swatches */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div 
                    className="h-16 rounded-lg mb-2"
                    style={{ backgroundColor: formData.primaryColor }}
                  ></div>
                  <p className="text-xs text-gray-600">Primary</p>
                </div>
                {formData.secondaryColor && (
                  <div className="text-center">
                    <div 
                      className="h-16 rounded-lg mb-2"
                      style={{ backgroundColor: formData.secondaryColor }}
                    ></div>
                    <p className="text-xs text-gray-600">Secondary</p>
                  </div>
                )}
                {formData.accentColor && (
                  <div className="text-center">
                    <div 
                      className="h-16 rounded-lg mb-2"
                      style={{ backgroundColor: formData.accentColor }}
                    ></div>
                    <p className="text-xs text-gray-600">Accent</p>
                  </div>
                )}
              </div>

              {/* Sample Button */}
              <div className="flex justify-center">
                <button
                  className="px-6 py-2 rounded-md text-white font-medium"
                  style={{ backgroundColor: formData.primaryColor }}
                >
                  Sample Button
                </button>
              </div>

              {/* Font Preview */}
              <div className="text-center text-sm text-gray-600">
                <p>Font: {formData.fontFamily}</p>
                <p className="mt-2">The quick brown fox jumps over the lazy dog</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
