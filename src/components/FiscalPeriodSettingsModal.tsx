import React, { useState, useEffect } from 'react';
import { useFiscalPeriod } from '../contexts/FiscalPeriodContext';

interface FiscalPeriodSettingsModalProps {
  // No props are needed now
}

const FiscalPeriodSettingsModal: React.FC<FiscalPeriodSettingsModalProps> = () => {
  const { startDate, setStartDate, isSettingsModalOpen, closeSettingsModal, isInitialSetup } = useFiscalPeriod();
  
  const formatDate = (date: Date | null): string => {
    if (!date) {
      // Provide a sensible default if date is null, e.g., today's date
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(formatDate(startDate));
  
  useEffect(() => {
    // When the modal opens, sync the date picker with the context's start date
    setSelectedDate(formatDate(startDate));
  }, [isSettingsModalOpen, startDate]);

  const handleSave = () => {
    // selectedDate is "YYYY-MM-DD"
    const [year, month, day] = selectedDate.split('-').map(Number);
    // Month is 0-indexed for Date.UTC
    const date = new Date(Date.UTC(year, month - 1, day));
    setStartDate(date);
  };

  if (!isSettingsModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md z-50">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {isInitialSetup ? "ようこそ！" : "会計期間の開始日を設定"}
        </h2>
        <p className="text-gray-600 mb-4">
          {isInitialSetup 
            ? "会計を開始するには、まず会計期間の開始日（期首日）を設定してください。"
            : "会計期間は通常1年間です。開始日（期首日）を選択してください。"
          }
        </p>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition"
        />
        <div className="mt-8 flex justify-end space-x-4">
          {!isInitialSetup && (
            <button
              onClick={closeSettingsModal}
              className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition duration-300"
            >
              キャンセル
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-accent text-white font-bold hover:bg-opacity-90 transition duration-300 shadow-md"
          >
            {isInitialSetup ? "会計を開始する" : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiscalPeriodSettingsModal;
