import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import moment from 'moment';

import {getSingleEntrys, getNAVEvents} from '../serverAPI/singleEntry.js'
import {getDistributionsInvestment} from '../serverAPI/distributions.js'
import {getContributionsInvestment} from '../serverAPI/contributions.js'
import {getCommissionsInvestment} from '../serverAPI/commissions.js'
import {getTransfers} from '../serverAPI/transfers.js'
import {getInvestments} from '../serverAPI/investments'

import {getAssetClasses} from '../serverAPI/assetClass'

import {calcNAV} from '../SpecialColumn'

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
        dist['type'] = 'DISTRIBUTION'
        return dist;
      })

      let contribution = await getContributionsInvestment(investmentID);
      contribution = contribution ? contribution : [];
      contribution = contribution.map((contr) => {
        contr['type'] = 'CONTRIBUTION'
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

      await Promise.all(investments.map(async (investment) => {
        const data = await fetchData(investment.id);
        const dataBeforeDate = data.filter(i => new Date(i.date ? i.date : i.date_due) <= new Date(date));
        const nav = calcNAV(dataBeforeDate, investment.id, 0, investment.invest_type);

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
          const possibleSubAsset = subAssets[assetClass].filter(i => i.asset === subAssetClass);
          if (possibleSubAsset.length === 0) { // has asset but not this subAsset
            subAssets[assetClass].push({asset: subAssetClass, nav: nav});
          }
          else { // already has subAsset for this asset
            possibleSubAsset[0].nav += nav;
          }

        }
        else {
          subAssets[assetClass] = [{asset: subAssetClass, nav: nav}];
        }
      }));

      const allAssets = Object.keys(assets);
      let totalNAV = allAssets.reduce((a,b) => a+assets[b], 0);
      const assetData = allAssets.map((asset) => {
        subAssets[asset].map(subAsset => {
          subAsset['nav_(%)'] = (subAsset.nav/totalNAV * 100).toFixed(2) + '%'
          return subAsset
        })
        return {asset: asset, nav: assets[asset], _children: subAssets[asset],
                'nav_(%)': (assets[asset]/totalNAV * 100).toFixed(2) + '%'
        }
      })
      assetData.push({asset: 'Total NAV', nav: totalNAV, 'nav_(%)': '100.00%'})
      setAsset(assetData);
    }

    manipulateData().catch(e => setError(e))

  }, [date]);

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (asset === null) {
    return <div> </div>;
  }
  return (
    <Fragment>
      <br />
      <h1 className="text">
      Date:
      </h1>
      <input type="date" onChange={handleChange.bind(this)} defaultValue={date} />
      <br />
      <br />
      <MaintenanceTable name={"Asset NAV"} data={asset}
            columns={['Asset', 'NAV', 'NAV (%)']}
            moneyColumns={['NAV', 'NAV (%)']}
            noButton={true}/>
    </Fragment>
  );
}

export default AssetAllocationReport;
