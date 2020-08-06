import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import moment from 'moment';

import {getSingleEntrys, getNAVEvents} from '../serverAPI/singleEntry.js'
import {getDistributionsInvestment} from '../serverAPI/distributions.js'
import {getContributionsInvestment} from '../serverAPI/contributions.js'
import {getCommissionsInvestment} from '../serverAPI/commissions.js'
import {getTransfers} from '../serverAPI/transfers.js'
import {getInvestments} from '../serverAPI/investments'

import {calcNAV} from '../SpecialColumn'

import MaintenanceTable from './reportTables'


const AssetAllocationReport = (props) => {
  const [asset, setAsset] = useState(null);
  const [subAsset, setSubAsset] = useState(null);
  const [error, setError] = useState(null);

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

    async function manipulateData() {
      const investments = await getInvestments();
      const assets = {}
      const subAssets = {}

      await Promise.all(investments.map(async (investment) => {
        const data = await fetchData(investment.id);
        const nav = calcNAV(data, investment.id, 0);

        const assetClass = investment.asset_class;
        const subAssetClass = investment.sub_asset_class;

        const combined = `${assetClass} - ${subAssetClass}`;
        if (assetClass in assets) {
          assets[assetClass] += nav;
        }
        else {
          assets[assetClass] = nav;
        }

        if (assetClass in subAssets) {
          subAssets[assetClass].push({asset: subAssetClass, nav: nav});
        }
        else {
          subAssets[assetClass] = [{asset: subAssetClass, nav: nav}];
        }
      }));

      const allAssets = Object.keys(assets);
      let totalNAV = allAssets.reduce((a,b) => a+assets[b], 0);
      const assetData = allAssets.map((asset) => {
        return {asset: asset, nav: assets[asset], _children: subAssets[asset],
                'nav_(%)': (assets[asset]/totalNAV * 100).toFixed(2) + '%'
        }
      })
      assetData.push({asset: 'Total NAV', nav: totalNAV})
      setAsset(assetData);
    }
    manipulateData().catch(e => setError(e))

  }, []);

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (asset === null) {
    return <div> hi </div>;
  }
  return (<MaintenanceTable name={"Asset NAV"} data={asset}
            columns={['Asset', 'NAV', 'NAV (%)']}
            moneyColumns={['NAV', 'NAV (%)']}
            noButton={true}/>);
}

export default AssetAllocationReport;
