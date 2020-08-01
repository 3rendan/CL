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


function groupByMonth(array) {
  const result = array.reduce(function (r, a) {
    let element = a.date;
    if (element === undefined) {
      element = a.date_due
    }
    element = moment(element);
    const endMonth = new Date(element.year(), (element.month() + 1), 0);
    r[endMonth] = r[endMonth] || [];
    r[endMonth].push(a);
    return r;
  }, Object.create(null));
  return result;
}

const SummaryReport = (props) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const frozenColumns = ['Investment'];
  const [columns, setColumns] = useState(null);
  const [moneyColumns, setMoneyColumns] = useState(null);

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
      const today = new Date();
      const currEndMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const investments = await getInvestments();

      const allDates = [];
      const investmentData = await Promise.all(
        investments.map(async (investment) => {
          const data = await fetchData(investment.id);
          const groups = groupByMonth(data);

          var minDate = new Date(Math.min(...Object.keys(groups).map(date => new Date(date))));

          let nav = 0;
          const investmentRow = {investment: investment.name}

          while (minDate <= currEndMonth) {
            nav = calcNAV(groups[minDate], investment.id, nav);
            const formatDate = moment(minDate).format('L')
            const fieldName = formatDate.toLowerCase().replace(new RegExp(' ', 'g'), '_');
            investmentRow[fieldName] = nav;
            if (!allDates.includes(formatDate)) {
              allDates.push(formatDate)
            }
            // get next end of month
            minDate = new Date(minDate.getFullYear(), minDate.getMonth() + 2, 0);
          }
          return investmentRow;
        })
      )

      investmentData.push({investment: ' '})



      setMoneyColumns(allDates);
      setColumns(['Investment', ...allDates]);
      setData(investmentData)
    }

    manipulateData().catch(e => setError(e))

  }, []);

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (data === null) {
    return <div> hi </div>;
  }
  return (<MaintenanceTable name={"Summary Report"} data={data}
            columns={columns} frozenColumns={frozenColumns}
            moneyColumns={moneyColumns}
            sumColumns={true}/>);
}

export default SummaryReport;
