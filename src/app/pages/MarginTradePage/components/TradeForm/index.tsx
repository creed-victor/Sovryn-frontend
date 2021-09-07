import { Text } from '@blueprintjs/core';
import { useWalletContext } from '@sovryn/react-wallet';
import { bignumber } from 'mathjs';
import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { AmountInput } from 'app/components/Form/AmountInput';
import { ErrorBadge } from 'app/components/Form/ErrorBadge';
import { FormGroup } from 'app/components/Form/FormGroup';
import { Select } from 'app/components/Form/Select';
import { renderItemNH } from 'app/components/Form/Select/renderers';
import { useMaintenance } from 'app/hooks/useMaintenance';
import { discordInvite } from 'utils/classifiers';
import settingImg from 'assets/images/settings-blue.svg';
import { translations } from '../../../../../locales/i18n';
import { TradingPosition } from '../../../../../types/trading-position';
import {
  TradingPairDictionary,
  TradingPairType,
} from '../../../../../utils/dictionaries/trading-pair-dictionary';
import { AvailableBalance } from '../../../../components/AvailableBalance';
import { useAssetBalanceOf } from '../../../../hooks/useAssetBalanceOf';
import { useWeiAmount } from '../../../../hooks/useWeiAmount';
import { selectMarginTradePage } from '../../selectors';
import { actions } from '../../slice';
import { Button } from '../Button';
import { CollateralAssets } from '../CollateralAssets';
import { LeverageSelector } from '../LeverageSelector';
import { TradeDialog } from '../TradeDialog';
import { AdvancedSettingDialog } from '../AdvancedSettingDialog';
const pairs = TradingPairDictionary.entries()
  .filter(value => !value[1].deprecated)
  .map(([type, item]) => ({
    key: type,
    label: item.name as string,
  }));

interface ITradeFormProps {
  pairType: TradingPairType;
}

export const TradeForm: React.FC<ITradeFormProps> = ({ pairType }) => {
  const { t } = useTranslation();
  const { connected } = useWalletContext();
  const { checkMaintenance, States } = useMaintenance();
  const openTradesLocked = checkMaintenance(States.OPEN_MARGIN_TRADES);

  const { collateral, leverage } = useSelector(selectMarginTradePage);
  const dispatch = useDispatch();

  const [amount, setAmount] = useState<string>('');
  const [positionType, setPosition] = useState<TradingPosition>(
    TradingPosition.LONG,
  );
  const weiAmount = useWeiAmount(amount);

  useEffect(() => {
    dispatch(actions.setAmount(weiAmount));
  }, [weiAmount, dispatch]);

  const pair = useMemo(() => {
    return TradingPairDictionary.get(pairType);
  }, [pairType]);

  useEffect(() => {
    if (!pair.collaterals.includes(collateral)) {
      dispatch(actions.setCollateral(pair.collaterals[0]));
    }
  }, [pair.collaterals, collateral, dispatch]);

  const submit = e => dispatch(actions.submit(e));
  const selectPosition = e => {
    setPosition(e);
  };

  const { value: tokenBalance } = useAssetBalanceOf(collateral);

  const validate = useMemo(() => {
    return (
      bignumber(weiAmount).greaterThan(0) &&
      bignumber(weiAmount).lessThanOrEqualTo(tokenBalance)
    );
  }, [weiAmount, tokenBalance]);

  return (
    <>
      <div className="tw-trading-form-card tw-bg-black tw-rounded-3xl tw-p-8 tw-mx-auto xl:tw-mx-0">
        {!openTradesLocked && (
          <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-space-x-4 tw-mw-340 tw-mx-auto">
            <Button
              text={t(translations.marginTradePage.tradeForm.buttons.long)}
              position={TradingPosition.LONG}
              onClick={submit}
              // disabled={!validate || !connected || openTradesLocked}
            />
            <Button
              text={t(translations.marginTradePage.tradeForm.buttons.short)}
              position={TradingPosition.SHORT}
              onClick={selectPosition}
            />
          </div>
        )}
        <div className="tw-mw-340 tw-mx-auto tw-mt-6">
          {/* <FormGroup
            label={t(translations.marginTradePage.tradeForm.labels.pair)}
            className="tw-mb-6"
          >
            <Select
              value={pairType}
              options={pairs}
              filterable={false}
              onChange={value => dispatch(actions.setPairType(value))}
              itemRenderer={renderItemNH}
              valueRenderer={item => (
                <Text ellipsize className="tw-text-center">
                  {item.label}
                </Text>
              )}
            />
          </FormGroup> */}
          <CollateralAssets
            value={collateral}
            onChange={value => dispatch(actions.setCollateral(value))}
            options={pair.collaterals}
          />
          <AvailableBalance asset={collateral} />
          <FormGroup
            label={t(translations.marginTradePage.tradeForm.labels.leverage)}
            className="tw-mb-6"
          >
            <LeverageSelector
              value={leverage}
              onChange={value => dispatch(actions.setLeverage(value))}
            />
          </FormGroup>

          <FormGroup
            label={t(translations.marginTradePage.tradeForm.labels.amount)}
          >
            <AmountInput
              value={amount}
              onChange={value => setAmount(value)}
              asset={collateral}
            />
          </FormGroup>
          <div className="tw-mt-6 tw-text-secondary tw-text-xs tw-flex">
            <Trans
              i18nKey={translations.marginTradeForm.fields.advancedSettings}
            />
            <img
              alt="setting"
              src={settingImg}
              onClick={() => {
                console.log('1123');
              }}
            />
          </div>
        </div>
        <div className="tw-mt-12">
          {openTradesLocked && (
            <ErrorBadge
              content={
                <Trans
                  i18nKey={translations.maintenance.openMarginTrades}
                  components={[
                    <a
                      href={discordInvite}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="tw-text-warning tw-text-xs tw-underline hover:tw-no-underline"
                    >
                      x
                    </a>,
                  ]}
                />
              }
            />
          )}
        </div>
      </div>
      <AdvancedSettingDialog />
    </>
  );
};
