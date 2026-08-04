import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

type SettingsTab = 'company' | 'billing' | 'preferences' | 'integrations';

const tabs: { key: SettingsTab; label: string; icon: string }[] = [
  { key: 'company',      label: 'Company Profile',  icon: '🏢' },
  { key: 'billing',      label: 'Billing & Plan',   icon: '💳' },
  { key: 'preferences',  label: 'Preferences',      icon: '⚙️' },
  { key: 'integrations', label: 'Integrations',     icon: '🔌' },
];

const themes = [
  { id: 'default',    label: 'Forest Green', color: '#22C55E' },
  { id: 'theme-blue', label: 'Ocean Blue',   color: '#3B82F6' },
  { id: 'theme-red',  label: 'Crimson Red',  color: '#F43F5E' },
];

const integrations = [
  { id: '1', name: 'QuickBooks',       desc: 'Sync invoices and payments',          icon: '📊', connected: true },
  { id: '2', name: 'Xero',             desc: 'Accounting integration',              icon: '📈', connected: false },
  { id: '3', name: 'CargoWise',        desc: 'Freight operations platform',         icon: '🚢', connected: false },
  { id: '4', name: 'Customs Gateway',  desc: 'UAE customs e-declaration',           icon: '🛃', connected: true },
  { id: '5', name: 'DHL Express API',  desc: 'Real-time tracking & booking',        icon: '✈️', connected: false },
  { id: '6', name: 'Maersk API',       desc: 'Sea freight schedules & booking',     icon: '🚢', connected: false },
  { id: '7', name: 'WhatsApp Business',desc: 'Customer notifications via WhatsApp', icon: '💬', connected: true },
  { id: '8', name: 'Stripe',           desc: 'Online payment collection',           icon: '💳', connected: false },
];

export default function SettingsCompany() {
  const [activeTab, setActiveTab]   = useState<SettingsTab>('company');
  const [activeTheme, setActiveTheme] = useState('default');
  const [saved, setSaved]           = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-800)]">Settings</h1>
          <p className="text-sm text-[var(--color-neutral-400)]">Manage your company profile and preferences</p>
        </div>
        {saved && <Badge variant="success">✓ Changes saved</Badge>}
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-48 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                  activeTab === tab.key
                    ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)] font-medium'
                    : 'text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">

          {/* Company Profile Tab */}
          {activeTab === 'company' && (
            <>
              <Card>
                <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Company Name *',       placeholder: 'Kingfisher Wings Logistic LLC', full: true },
                    { label: 'Trading Name',          placeholder: 'Kingfisher Wings' },
                    { label: 'Company Code',          placeholder: 'KFW' },
                    { label: 'Tax Registration No.', placeholder: 'TRN-100123456789001' },
                    { label: 'License No.',           placeholder: 'DED-2021-XXXXXX' },
                    { label: 'IATA Agent Code',       placeholder: 'XX-X XXXXX' },
                    { label: 'Phone',                 placeholder: '+971 4 555 0000' },
                    { label: 'Email',                 placeholder: 'info@kingfisherwings.ae' },
                    { label: 'Website',               placeholder: 'www.kingfisherwings.ae' },
                    { label: 'Country',               placeholder: 'UAE' },
                    { label: 'City',                  placeholder: 'Dubai' },
                    { label: 'P.O. Box',              placeholder: '45678' },
                  ].map((field) => (
                    <label key={field.label} className={`flex flex-col gap-1 ${field.full ? 'col-span-2' : ''}`}>
                      <span className="text-xs font-medium text-[var(--color-neutral-600)]">{field.label}</span>
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        defaultValue={field.placeholder}
                        className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
                      />
                    </label>
                  ))}
                  <label className="col-span-2 flex flex-col gap-1">
                    <span className="text-xs font-medium text-[var(--color-neutral-600)]">Address</span>
                    <textarea
                      rows={2}
                      defaultValue="P.O. Box 45678, Deira, Dubai, UAE"
                      className="w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary-500)] resize-none"
                    />
                  </label>
                </div>
              </Card>

              <Card>
                <CardHeader><CardTitle>Company Logo</CardTitle></CardHeader>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-xl bg-[var(--color-primary-900)] flex items-center justify-center text-white font-bold text-2xl shrink-0">
                    FG
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-[var(--color-neutral-600)]">
                      Upload your company logo. Recommended size: 200×200px, PNG or SVG.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm">⬆ Upload Logo</Button>
                      <Button variant="ghost" size="sm">Remove</Button>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <CardHeader><CardTitle>Invoice & Document Settings</CardTitle></CardHeader>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-[var(--color-neutral-600)]">Invoice Prefix</span>
                    <input type="text" defaultValue="INV" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-[var(--color-neutral-600)]">Job Number Prefix</span>
                    <input type="text" defaultValue="KFW" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-[var(--color-neutral-600)]">Default Currency</span>
                    <select className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]">
                      <option>AED</option>
                      <option>USD</option>
                      <option>EUR</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-[var(--color-neutral-600)]">VAT Rate (%)</span>
                    <input type="number" defaultValue="5" className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]" />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-[var(--color-neutral-600)]">Default Payment Terms</span>
                    <select className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]">
                      <option>Net 30</option>
                      <option>Net 15</option>
                      <option>Net 60</option>
                      <option>Immediate</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-[var(--color-neutral-600)]">Fiscal Year Start</span>
                    <select className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]">
                      <option>January</option>
                      <option>April</option>
                      <option>July</option>
                    </select>
                  </label>
                </div>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="secondary">Reset</Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <Badge variant="success">Active</Badge>
                </CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl font-bold text-[var(--color-neutral-800)] mb-1">Professional Plan</p>
                    <p className="text-sm text-[var(--color-neutral-400)]">Up to 10 users · All modules · Priority support</p>
                    <p className="text-sm font-semibold text-[var(--color-primary-600)] mt-2">AED 2,499 / month</p>
                  </div>
                  <Button variant="secondary">Upgrade Plan</Button>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {[
                    { label: 'Users',       used: 8,  total: 10  },
                    { label: 'Storage',     used: 12, total: 50, unit: 'GB' },
                    { label: 'API Calls',   used: 45, total: 100, unit: 'K/mo' },
                  ].map((usage) => (
                    <div key={usage.label} className="p-3 rounded-lg bg-[var(--color-neutral-50)]">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[var(--color-neutral-600)]">{usage.label}</span>
                        <span className="font-mono font-medium">{usage.used}/{usage.total}{usage.unit || ''}</span>
                      </div>
                      <div className="h-1.5 bg-[var(--color-neutral-200)] rounded-full">
                        <div
                          className={`h-1.5 rounded-full ${
                            (usage.used / usage.total) > 0.8
                              ? 'bg-[var(--color-danger-500)]'
                              : 'bg-[var(--color-primary-500)]'
                          }`}
                          style={{ width: `${(usage.used / usage.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHeader><CardTitle>Billing History</CardTitle></CardHeader>
                <div className="space-y-3">
                  {[
                    { date: '2026-06-01', desc: 'Professional Plan — June 2026', amount: 2499, status: 'Paid' },
                    { date: '2026-05-01', desc: 'Professional Plan — May 2026',  amount: 2499, status: 'Paid' },
                    { date: '2026-04-01', desc: 'Professional Plan — April 2026', amount: 2499, status: 'Paid' },
                  ].map((bill) => (
                    <div key={bill.date} className="flex items-center justify-between py-2 border-b border-[var(--color-neutral-100)] last:border-0">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-neutral-800)]">{bill.desc}</p>
                        <p className="text-xs font-mono text-[var(--color-neutral-400)]">{bill.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold text-sm">AED {bill.amount.toLocaleString()}</span>
                        <Badge variant="success">{bill.status}</Badge>
                        <button className="text-xs text-[var(--color-primary-500)] hover:underline">Receipt</button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <>
              <Card>
                <CardHeader><CardTitle>Theme</CardTitle></CardHeader>
                <div className="grid grid-cols-3 gap-4">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setActiveTheme(theme.id);
                        document.documentElement.classList.remove('theme-blue', 'theme-red');
                        if (theme.id !== 'default') document.documentElement.classList.add(theme.id);
                      }}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        activeTheme === theme.id
                          ? 'border-[var(--color-primary-500)]'
                          : 'border-[var(--color-neutral-200)] hover:border-[var(--color-neutral-300)]'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: theme.color }} />
                        <p className="font-medium text-sm text-[var(--color-neutral-800)]">{theme.label}</p>
                      </div>
                      {activeTheme === theme.id && (
                        <Badge variant="primary">Active</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
                <div className="space-y-3">
                  {[
                    { label: 'Invoice overdue alerts',       desc: 'Get notified when invoices pass due date' },
                    { label: 'Shipment status updates',      desc: 'Receive updates on job status changes' },
                    { label: 'Quotation expiry reminders',   desc: 'Alert 48 hours before quote expires' },
                    { label: 'Visa & document expiry alerts', desc: 'HR document expiry notifications' },
                    { label: 'Low stock warnings',           desc: 'WMS alerts for below-threshold items' },
                    { label: 'Daily summary email',          desc: 'Morning digest of key metrics' },
                  ].map((pref, i) => (
                    <div key={pref.label} className="flex items-center justify-between py-2 border-b border-[var(--color-neutral-100)] last:border-0">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-neutral-800)]">{pref.label}</p>
                        <p className="text-xs text-[var(--color-neutral-400)]">{pref.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <span className="sr-only">{pref.label}</span>
                        <input type="checkbox" defaultChecked={i < 4} className="sr-only peer" aria-label={pref.label} />
                        <div className="w-9 h-5 bg-[var(--color-neutral-200)] peer-checked:bg-[var(--color-primary-500)] rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                      </label>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHeader><CardTitle>Regional Settings</CardTitle></CardHeader>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Timezone',     options: ['Asia/Dubai (UTC+4)', 'UTC', 'Europe/London'], default: 0 },
                    { label: 'Date Format',  options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],    default: 0 },
                    { label: 'Language',     options: ['English', 'Arabic', 'Urdu'],                  default: 0 },
                    { label: 'Number Format', options: ['1,234.56', '1.234,56'],                      default: 0 },
                  ].map((setting) => (
                    <label key={setting.label} className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-[var(--color-neutral-600)]">{setting.label}</span>
                      <select className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]">
                        {setting.options.map((opt) => <option key={opt}>{opt}</option>)}
                      </select>
                    </label>
                  ))}
                </div>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="secondary">Reset to Defaults</Button>
                <Button onClick={handleSave}>Save Preferences</Button>
              </div>
            </>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="grid grid-cols-2 gap-4">
              {integrations.map((integration) => (
                <Card key={integration.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-neutral-100)] flex items-center justify-center text-xl shrink-0">
                        {integration.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[var(--color-neutral-800)]">{integration.name}</p>
                        <p className="text-xs text-[var(--color-neutral-400)]">{integration.desc}</p>
                      </div>
                    </div>
                    <Badge variant={integration.connected ? 'success' : 'neutral'}>
                      {integration.connected ? 'Connected' : 'Not Connected'}
                    </Badge>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {integration.connected ? (
                      <>
                        <Button variant="secondary" size="sm" className="flex-1">Configure</Button>
                        <Button variant="ghost" size="sm" className="text-[var(--color-danger-500)]">Disconnect</Button>
                      </>
                    ) : (
                      <Button size="sm" className="flex-1">Connect</Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}