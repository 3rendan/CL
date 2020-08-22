import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import moment from 'moment';

import {getSingleEntrys, getNAVEvents} from '../serverAPI/singleEntry.js'
import {getDistributionsInvestment} from '../serverAPI/distributions.js'
import {getContributionsInvestment} from '../serverAPI/contributions.js'
import {getCommissionsInvestment} from '../serverAPI/commissions.js'
import {getTransfers} from '../serverAPI/transfers.js'
import {getInvestments} from '../serverAPI/investments'

import {getAccounts} from '../serverAPI/accounts'

import {calcNAV} from '../SpecialColumn'

import MaintenanceTable from './reportTables'


const InvestmentNAVReport = (props) => {
  const [data, setData] = useState(null);
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

      const investmentNAVS = await Promise.all(investments.map(async (investment) => {
        const data = await fetchData(investment.id);
        const nav = calcNAV(data, investment.id, 0);
        return {investment: investment.name, nav: nav}
      }));

      const totalNAV = investmentNAVS.reduce((a,b) => a + b.nav, 0);

      const investmentData = investmentNAVS.map((investment) => {
        return {investment: investment.investment, nav: investment.nav,
                'nav_(%)': (investment.nav/totalNAV * 100).toFixed(2) + '%'}
      })
      investmentData.push({investment: 'Total NAV', nav: totalNAV, 'nav_(%)': '100.00%'})
      setData(investmentData);
    }
    manipulateData().catch(e => setError(e))

  }, []);

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (data === null) {
    return <div> </div>;
  }
  return (<MaintenanceTable name={"Investment NAV"} data={data}
            columns={['Investment', 'NAV', 'NAV (%)']}
            moneyColumns={['NAV', 'NAV (%)']}
            noButton={true}/>);
}

export default InvestmentNAVReport;
