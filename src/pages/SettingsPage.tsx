import { useState, useEffect, useCallback } from 'react';
import { DEFAULTS } from '@/lib/constants';
import { SettingsForm } from '@/components/settings/SettingsForm';

export default function SettingsPage() {
  const [rate, setRate] = useState<number>(DEFAULTS.electricityRateKwh);

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/settings/electricityRateKwh');
    const data = await res.json();
    if (data.value) setRate(parseFloat(data.value));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="p-4 md:p-6 max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-sm text-zinc-500">Configure default values for calculations</p>
      </div>
      <SettingsForm initialRate={rate} onSaved={fetchData} />
    </div>
  );
}
