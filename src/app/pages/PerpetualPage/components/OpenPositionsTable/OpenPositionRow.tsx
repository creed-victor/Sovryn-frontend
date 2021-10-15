import React, { useState } from 'react';
import { numberToPercent, toNumberFormat } from 'utils/display-text/format';
import { useMaintenance } from 'app/hooks/useMaintenance';
import { OpenPositionEntry } from '../../hooks/usePerpetual_OpenPositions';
import {
  PerpetualPairDictionary,
  PerpetualPairType,
} from '../../../../../utils/dictionaries/perpatual-pair-dictionary';
import classNames from 'classnames';
import { AssetValue } from '../../../../components/AssetValue';
import { ActionButton } from 'app/components/Form/ActionButton';
import { ClosePositionDialog } from '../ClosePositionDialog';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';

interface IOpenPositionRowProps {
  item: OpenPositionEntry;
}

export function OpenPositionRow({ item }: IOpenPositionRowProps) {
  const { checkMaintenances, States } = useMaintenance();
  const [showClosePosition, setShowClosePosition] = useState(false);
  const { t } = useTranslation();
  const {
    [States.CLOSE_MARGIN_TRADES]: closeTradesLocked,
    [States.ADD_TO_MARGIN_TRADES]: addToMarginLocked,
  } = checkMaintenances();
  // TODO: implement maintenance stops for actions!

  const pair = PerpetualPairDictionary.get(item.pair as PerpetualPairType);

  if (pair === undefined) return null;

  return (
    <tr>
      <td
        className={classNames(
          item.position > 0 ? 'tw-text-trade-long' : 'tw-text-trade-short',
        )}
      >
        {pair.name}
      </td>
      <td
        className={classNames(
          'tw-text-right',
          item.position > 0 ? 'tw-text-trade-long' : 'tw-text-trade-short',
        )}
      >
        <AssetValue value={item.position} asset={pair.longAsset} />
      </td>
      <td className="tw-text-right tw-hidden xl:tw-table-cell">
        <AssetValue value={item.value} asset={pair.shortAsset} />
      </td>
      <td className="tw-text-right tw-hidden md:tw-table-cell">
        <AssetValue value={item.entryPrice} asset={pair.longAsset} />
      </td>
      <td className="tw-text-right tw-hidden xl:tw-table-cell">
        <AssetValue value={item.markPrice} asset={pair.longAsset} />
      </td>
      <td className="tw-text-right tw-hidden xl:tw-table-cell tw-text-trade-short">
        <AssetValue value={item.liquidationPrice} asset={pair.longAsset} />
      </td>
      <td className="tw-text-right">
        <AssetValue value={item.margin} asset={pair.shortAsset} />
        {` (${toNumberFormat(item.leverage, 2)}x)`}
      </td>
      <td
        className={classNames(
          item.unrealized.shortValue >= 0
            ? 'tw-text-trade-long'
            : 'tw-text-trade-short',
        )}
      >
        <div className="tw-flex tw-flex-row tw-items-center">
          <div className="tw-mr-2">
            <AssetValue
              className="tw-block"
              value={item.unrealized.shortValue}
              asset={pair.shortAsset}
            />
            <AssetValue
              className="tw-block"
              value={item.unrealized.longValue}
              asset={pair.longAsset}
              isApproximation
            />
          </div>
          <div>
            ({item.unrealized.roe > 0 ? '+' : ''}
            {numberToPercent(item.unrealized.roe, 1)})
          </div>
        </div>
      </td>
      <td
        className={classNames(
          'tw-hidden 2xl:tw-table-cell',
          item.realized.shortValue >= 0
            ? 'tw-text-trade-long'
            : 'tw-text-trade-short',
        )}
      >
        <AssetValue
          className="tw-block"
          value={item.realized.shortValue}
          asset={pair.shortAsset}
        />
        <AssetValue
          className="tw-block"
          value={item.realized.longValue}
          asset={pair.longAsset}
          isApproximation
        />
      </td>
      <td>
        <div className="tw-flex tw-items-center tw-justify-end xl:tw-justify-around 2xl:tw-justify-start">
          <ActionButton
            text={t(translations.perpetualPage.openPositionsTable.close)}
            onClick={() => setShowClosePosition(true)}
            className={`tw-border-none tw-ml-0 tw-pl-0 ${
              closeTradesLocked && 'tw-cursor-not-allowed'
            }`}
            textClassName="tw-text-xs tw-overflow-visible tw-font-bold"
            disabled={closeTradesLocked}
            title={
              (closeTradesLocked &&
                t(translations.maintenance.closeMarginTrades).replace(
                  /<\/?\d+>/g,
                  '',
                )) ||
              undefined
            }
          />
        </div>
        <ClosePositionDialog
          item={item}
          onCloseModal={() => setShowClosePosition(false)}
          showModal={showClosePosition}
        />
      </td>
    </tr>
  );
}
