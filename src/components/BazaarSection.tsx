import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BazaarToggle, BazaarSubTab } from './BazaarToggle';
import { BazaarList } from './BazaarList';
import { UniversalExpenseList } from './UniversalExpenseList';
import { DepositList } from './DepositList';

export const BazaarSection: React.FC = () => {
  const [subTab, setSubTab] = useState<BazaarSubTab>('general');
  const { bazaarExpenses, universalExpenses, deposits, activeMonth } = useApp();

  const counts = useMemo(() => {
    if (!activeMonth) return { general: 0, universal: 0, deposits: 0 };
    return {
      general: bazaarExpenses.filter((b) => b.monthId === activeMonth.id).length,
      universal: universalExpenses.filter((u) => u.monthId === activeMonth.id).length,
      deposits: deposits.filter((d) => d.monthId === activeMonth.id).length,
    };
  }, [bazaarExpenses, universalExpenses, deposits, activeMonth]);

  return (
    <div id="bazaar-management-section" className="space-y-4">
      <BazaarToggle activeTab={subTab} onChange={setSubTab} counts={counts} />

      {subTab === 'general' && <BazaarList />}
      {subTab === 'universal' && <UniversalExpenseList />}
      {subTab === 'deposits' && <DepositList />}
    </div>
  );
};
