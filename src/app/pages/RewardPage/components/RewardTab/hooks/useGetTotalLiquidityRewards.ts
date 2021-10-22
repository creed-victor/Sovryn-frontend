import { useMemo } from 'react';
import { bignumber } from 'mathjs';

import { useGetContractPastEvents } from 'app/hooks/useGetContractPastEvents';
import { liquidityPools } from 'app/pages/RewardPage/helpers';

export const useGetTotalLiquidityRewards = (): string => {
  const { events: liquidityRewardsEvents } = useGetContractPastEvents(
    'liquidityMiningProxy',
    'RewardClaimed',
  );

  const totalLiquidityRewards = useMemo(
    () =>
      liquidityRewardsEvents
        .filter(item => liquidityPools.includes(item.returnValues.poolToken))
        .map(item => item.returnValues.amount)
        .reduce((prevValue, curValue) => prevValue.add(curValue), bignumber(0)),
    [liquidityRewardsEvents],
  );

  return totalLiquidityRewards;
};
