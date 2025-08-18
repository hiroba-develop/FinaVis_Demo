import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHistory } from '../contexts/HistoryContext';
import { useFiscalPeriod } from '../contexts/FiscalPeriodContext';

interface PeriodSelectorProps {
  basePath: '/balance-sheet' | '/income-statement' | '/cash-flow-statement';
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ basePath }) => {
  const navigate = useNavigate();
  const { periodIndex } = useParams<{ periodIndex?: string }>();
  const { history } = useHistory();
  const { periodString: currentPeriodString } = useFiscalPeriod();

  // Create a list of selectable periods, including the current one.
  // The history is stored oldest first, so we'll reverse it for display.
  const periods = [
    { label: `${currentPeriodString} (現在)`, value: 'current' },
    ...history.map((h, index) => ({
      label: h.periodString,
      value: String(index),
    })).reverse(),
  ];

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    if (selectedValue === 'current') {
      navigate(basePath);
    } else {
      navigate(`${basePath}/${selectedValue}`);
    }
  };

  // Determine the current value for the dropdown.
  // If periodIndex is undefined, it's the current period.
  const currentValue = periodIndex === undefined ? 'current' : periodIndex;

  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <label htmlFor="period-select" className="block text-sm font-medium text-gray-700 mb-2">
        表示する会計期間:
      </label>
      <select
        id="period-select"
        value={currentValue}
        onChange={handleChange}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md"
      >
        {periods.map(period => (
          <option key={period.value} value={period.value}>
            {period.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PeriodSelector;
