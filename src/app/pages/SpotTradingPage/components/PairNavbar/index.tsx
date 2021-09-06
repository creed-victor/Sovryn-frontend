import React from 'react';
import { PairStats } from './PairStats';
import { PairSelect } from './PairSelect';

export const PairNavbar: React.FC = () => {
  return (
    <div className="tw-bg-gray-3 tw-w-full">
      <div className="tw-flex tw-items-center tw-container">
        <PairSelect />

        <PairStats />
      </div>
    </div>
  );
};
