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

import {calcNAV, calcPrelimNAV, calcFloat} from '../SpecialColumn'

import MaintenanceTable from './reportTables'

function groupByMonth(array, invest_type) {
  const result = array.reduce(function (r, a) {
    let element = a.date;
    if (invest_type === 'cash') {
      element = a.date_sent;
      if (element === undefined) {
        element = a.date
      }
      element = moment(element);
    }
    else {
      if (element === undefined) {
        element = a.date_due
      }
      element = moment(element);
    }
    const endMonth = new Date(element.year(), (element.month() + 1), 0);
    if (!isNaN(endMonth)) {
      r[endMonth] = r[endMonth] || [];
      r[endMonth].push(a);
    }
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
        dist['date_sent'] = dist['contra_date'];
        dist['to_investment'] = dist.contra_investment;
        dist['from_investment'] = dist.fund_investment;
        return dist;
      })

      let contribution = await getContributionsInvestment(investmentID);
      contribution = contribution ? contribution : [];
      contribution = contribution.map((contr) => {
        contr['type'] = 'CONTRIBUTION'
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


    async function manipulateData() {
      const today = new Date();
      const currEndMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const investments = await getInvestments();

      const allDates = [];
      const netExpensesByDate = {investment: 'Net Expenses'}
      const inflowsByDate = {investment: 'Total Inflows'}
      const outflowsByDate = {investment: 'Total Outflows'}
      const floatByDate = {investment: 'Float'};

      let investmentsToData = await Promise.all(
        investments.map(async (investment) => {
          const data     = await fetchData(investment.id);
          const navData  = await getNAVEvents(investment.id);
          const groups = groupByMonth(data, investment.invest_type);

          return {
            investment: investment,
            data: data,
            navData: navData,
            groups: groups,
          };
        })
      );

      investmentsToData.sort(function (a, b) {
        const investmentA = a.investment;
        const investmentB = b.investment;

        return investmentA.seq_no - investmentB.seq_no;
      });

      const investmentData = investmentsToData.map((allData) => {
        const investment = allData.investment;
        const investmentID = investment.id;
        const data = allData.data;
        const navData = allData.navData;
        const groups = allData.groups;

        let minDate = new Date(Math.min(...Object.keys(groups).map(date => new Date(date))));

        const today = new Date();
        let currEndMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        let finalMonth = new Date(Math.max(...Object.keys(groups).map(date => new Date(date))));
        finalMonth = new Date(Math.max(currEndMonth, finalMonth));

        let prev_nav = 0;
        let nav = 0;
        let prelim_nav = 0;
        const investmentRow = {investment: investment.name}
        while (minDate <= finalMonth) {
          nav = calcNAV(groups[minDate], investmentID, prev_nav, investment.invest_type);
          prelim_nav = calcPrelimNAV(groups[minDate], investmentID, prev_nav, investment.invest_type);
          const formatDate = moment(minDate).format('L');

          const fieldName = formatDate.toLowerCase().replace(new RegExp(' ', 'g'), '_');
          investmentRow[fieldName] = nav - prelim_nav;

          if (!allDates.includes(formatDate)) {
            allDates.push(formatDate)
          }
          // get next end of month
          minDate = new Date(minDate.getFullYear(), minDate.getMonth() + 2, 0);
          prev_nav = nav;
        }
        return investmentRow;
      });

      // sumNAVs
      const sumGains = {investment: 'Total NAV'}
      allDates.map(date => {
        investmentData.map(investment => {
          if (date in sumGains) {
            sumGains[date] += investment[date] === undefined ? 0 : investment[date]
          }
          else {
            sumGains[date] = investment[date] === undefined ? 0 : investment[date]
          }
        })
      })

      investmentData.push({investment: ' '})
      investmentData.push(sumGains)

      // sort dates
      allDates.sort(function(a,b) {
        const aDate = new Date(a)
        const bDate = new Date(b)
        if (aDate < bDate) {
          return -1;
        }
        else if (aDate > bDate) {
          return 1;
        }
        return 0;
      })

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
    return <div> </div>;
  }
  return (<MaintenanceTable name={"Summary Unexplained Gain Report"} data={data}
            columns={columns} frozenColumns={frozenColumns}
            moneyColumns={moneyColumns}
            scrollTo={columns[columns.length - 1]}/>);
}

export default SummaryReport;
