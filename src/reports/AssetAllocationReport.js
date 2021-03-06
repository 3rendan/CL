import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import moment from 'moment';

import {stringDateConvertLocalTimezone} from '../timezoneOffset';

import {getSingleEntrys, getNAVEvents} from '../serverAPI/singleEntry.js'
import {getDistributionsInvestment} from '../serverAPI/distributions.js'
import {getContributionsInvestment} from '../serverAPI/contributions.js'
import {getCommissionsInvestment} from '../serverAPI/commissions.js'
import {getTransfers} from '../serverAPI/transfers.js'
import {getInvestments} from '../serverAPI/investments'

import {getAssetClasses} from '../serverAPI/assetClass'

import {calcNAV, calcFloat} from '../SpecialColumn'

import MaintenanceTable from './reportTables'


const AssetAllocationReport = (props) => {
  const [asset, setAsset] = useState(null);
  const [subAsset, setSubAsset] = useState(null);
  const [date, setDate] = useState(moment(new Date()).format('yyyy-MM-DD'));
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setDate(e.target.value)
  }

  useEffect(() => {
    async function fetchData(investmentID) {
      let singleEntry = await getSingleEntrys(investmentID);
      singleEntry = singleEntry ? singleEntry : [];
      let commission = await getCommissionsInvestment(investmentID);
      commission = commission ? commission : [];
      commission = commission.map((comm) => {
        comm['type'] = 'COMMISH'
        return comm;
      })
      let distribution = await getDistributionsInvestment(investmentID);
      distribution = distribution ? distribution : [];
      distribution = distribution.map((dist) => {
        dist['type'] = 'DISTRIBUTION';
        dist['date_sent'] = dist['contra_date'];
        dist['to_investment'] = dist.contra_investment;
        dist['from_investment'] = dist.fund_investment;
        return dist;
      })

      let contribution = await getContributionsInvestment(investmentID);
      contribution = contribution ? contribution : [];
      contribution = contribution.map((contr) => {
        contr['type'] = 'CONTRIBUTION';
        contr['date_sent'] = contr['contra_date'];
        contr['to_investment'] = contr.contra_investment;
        contr['from_investment'] = contr.fund_investment;
        return contr;
      })

      let navs = await getNAVEvents(investmentID);
      navs = navs.map((nav) => {
        nav['type'] = 'NAV'
        return nav;
      })

      let transfers = await getTransfers(investmentID);
      transfers = transfers.map((transfer) => {
        transfer['type'] = 'TRANSFER'
        return transfer;
      })

      return [...singleEntry, ...commission,
        ...distribution, ...contribution, ...navs,
        ...transfers];
    }

    async function getAssetClassIdToName() {
      const assetClasses = await getAssetClasses();
      const assetClassIdToName = {};
      assetClasses.map(assetClass => {
        assetClassIdToName[assetClass.id] = assetClass.name;
      })
      return assetClassIdToName;
    }

    async function manipulateData() {
      const [investments, assetClassIdToName] = await Promise.all([getInvestments(), getAssetClassIdToName()]);
      const assets = {}
      const subAssets = {}
      let float = 0;

      const midnightEndOfDate = stringDateConvertLocalTimezone(date);

      await Promise.all(investments.map(async (investment) => {
        const data = await fetchData(investment.id);
        // uses nav, forgets float
        const dataBeforeDate = data.filter(i => {
          let iDate = null;
          if (investment.invest_type === 'cash') {
            iDate = i.date_sent ? i.date_sent : i.contra_date;
            iDate = iDate ? iDate : i.date;
          }
          else {
            iDate = i.date ? i.date : i.date_due;
          }
          // console.log(iDate);
          iDate = new Date(iDate);
          // console.log(iDate <= midnightEndOfDate)
          return iDate <= midnightEndOfDate;
        });
        const nav = calcNAV(dataBeforeDate, investment.id, 0, investment.invest_type);
        float += investment.invest_type === 'commit' ? calcFloat(data, midnightEndOfDate) : 0;

        const assetClass = assetClassIdToName[investment.asset_class];
        const subAssetClass = assetClassIdToName[investment.sub_asset_class];

        const combined = `${assetClass} - ${subAssetClass}`;
        if (assetClass in assets) {
          assets[assetClass] += nav;
        }
        else {
          assets[assetClass] = nav;
        }

        if (assetClass in subAssets) {
          const possibleSubAsset = subAssets[assetClass].filter(i => i.asset_class === subAssetClass);
          if (possibleSubAsset.length === 0) { // has asset but not this subAsset
            subAssets[assetClass].push({asset_class: subAssetClass, nav: nav});
          }
          else { // already has subAsset for this asset
            possibleSubAsset[0].nav += nav;
          }

        }
        else {
          subAssets[assetClass] = [{asset_class: subAssetClass, nav: nav}];
        }
      }));

      const allAssets = Object.keys(assets);
      let totalNAV = allAssets.reduce((a,b) => a+assets[b], float);
      const assetData = allAssets.map((asset) => {
        subAssets[asset].map(subAsset => {
          subAsset['nav_(%)'] = (subAsset.nav/totalNAV * 100).toFixed(2) + '%'
          return subAsset
        })
        return {asset_class: asset, nav: assets[asset], _children: subAssets[asset],
                'nav_(%)': (assets[asset]/totalNAV * 100).toFixed(2) + '%'
        }
      })
      assetData.push({asset_class: 'Float', nav: float, 'nav_(%)': (float/totalNAV * 100).toFixed(2) + '%'})
      assetData.push({asset_class: 'Total NAV', nav: totalNAV, 'nav_(%)': '100.00%'})
      setAsset(assetData);
    }

    manipulateData().catch(e => setError(e))

  }, [date]);

  const dateInfo = {
    onChange: handleChange.bind(this),
    defaultValue: date
  };

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (asset === null) {
    return <div> </div>;
  }
  return (
      <MaintenanceTable name={"Asset Class NAV"} data={asset}
            columns={['Asset Class', 'NAV', 'NAV (%)']}
            moneyColumns={['NAV', 'NAV (%)']}
            noButton={true}
            date={dateInfo}/>
  );
}

export default AssetAllocationReport;
