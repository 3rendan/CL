import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getSingleEntrys, getNAVEvents} from '../serverAPI/singleEntry.js'
import {getDistributionsInvestment} from '../serverAPI/distributions.js'
import {getContributionsInvestment} from '../serverAPI/contributions.js'
import {getCommissionsInvestment} from '../serverAPI/commissions.js'
import {getInvestment} from '../serverAPI/investments.js'
import {getTransfers} from '../serverAPI/transfers.js'

import {getBenchmark} from '../serverAPI/benchmarks'

import { addDays } from 'date-fns';
import {getIrr, getIrrBenchmark} from '../serverAPI/irr'

import {calcNAV, calcPrelimNAV, calcNetContribute, myDateSort, calcFloat} from '../SpecialColumn'

import MaintenanceTable from './allTables'

import moment from 'moment';

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
    r[endMonth] = r[endMonth] || [];
    r[endMonth].push(a);
    return r;
  }, Object.create(null));
  return result;
}

function calcRemainingCommitment(data, remaining_commitment) {
  if (data === undefined) {
    return remaining_commitment;
  }
  if (remaining_commitment === undefined) {
    return undefined;
  }

  data.map((datum) => {
    if (datum.type === 'CONTRIBUTION') {
      let main = datum.main;
      try {
        main = datum.main ? parseFloat(datum.main.substring(1)) : 0;
      }
      catch (e) {}
      remaining_commitment -= main;

      let fees = datum.fees;
      try {
        fees = datum.fees ? parseFloat(datum.fees.substring(1)) : 0;
      }
      catch (e) {}
      remaining_commitment -= fees;

      let tax = datum.tax;
      try {
        tax = datum.tax ? parseFloat(datum.tax.substring(1)) : 0;
      }
      catch (e) {}
      remaining_commitment -= tax;
    }
    else if (datum.type === 'DISTRIBUTION') {
      let recallable = datum.recallable;
      try {
        recallable = datum.recallable ? parseFloat(datum.recallable.substring(1)) : 0;
      }
      catch (e) {}
      remaining_commitment -= recallable;
    }
  });
  return remaining_commitment;
}

const NAVTable = (props) => {
  const [NAVEventData, setNAVEventData] = useState(null);
  const [error, setError] = useState(null);
  const [NAVColumns, setNAVColumns] = useState(['Date', 'NAV', 'Net Contribution', 'P/L (LTD)', 'P/L (MTD)', 'P/L(%) (MTD)', 'Unexplained Gain', 'IRR']);
  const [moneyColumns, setMoneyColumns] = useState(['NAV', 'Net Contribution', 'P/L (LTD)', 'P/L (MTD)', 'P/L(%) (MTD)', 'Unexplained Gain', 'IRR']);

  const investmentID = props.investmentID;

  // LOGIC FOR getIRREvents signage is done in calcNetContribute in SpecialColumn
  // done transfer
  // done NAV, GAIN, FEE, DIV
  // COMMISH HAS LOGIC WRITTEN BUT FOR P/L IT'S CONSIDERED 0?
  // done contribution, distribution

  useEffect(() => {
    async function fetchData() {
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

    // here is where i get the data
    async function getIrrEvents(data) {
      const dates = []
      let events = data.map((event) => {
        let date = event.date ? event.date : event.date_due
        if (investmentID === event.contra_investment) {
          date = event.contra_date ? event.contra_date : event.date_sent;
          date = date ? date : event.date;
        }
        date = moment(date).format('MM/DD/YYYY')
        dates.push(date)
        if (event.type === 'TRANSFER') {
          if (event.to_investment === investmentID) {
            return event.amount;
          }
          return -1 * event.amount; // in from_investment
        }
        // this may be what we want for commish and fee,
        // for now, we just ignore for both P/L and cash flow for IRRs
        if (false) {
          if (investmentID === event.investment) {
            return 0;
          }
          return -1 * event.amount; // in from_investment
        }
        if (event.type === 'NAV' || event.type === 'COMMISH'
            || event.type === 'GAIN' || event.type === 'FEE'
            || event.type === 'DIV') {
          dates.pop();
          return undefined;
        }
        let amount = event.amount !== undefined ? event.amount : event.net_amount;
        if (event.type === 'DISTRIBUTION' || event.type === 'CONTRIBUTION') {
          // amount is negative for type distribution
          if (event.from_investment === investmentID) {
            return amount;
          }
          return -1 * amount;
        }
        // inflow, outflow, credit, expense is handled here
        return amount;
      });
      events = events.filter(i => i !== undefined)
      return [events, dates];
    }

    async function calcIrrBenchmark(navDates, eventAmounts, eventDates, benchmark) {
      if (benchmark == undefined) {
        return [];
      }
      const dateOfNavDates = navDates.map(navDate => new Date(navDate.date))
      const navOfNavDates = navDates.map(navDate => navDate.nav)
      let minDate = new Date(Math.min(...dateOfNavDates))
      let minEventDate = new Date(Math.min(...eventDates.map(date => new Date(date))))
      let startDate = minEventDate != 'Invalid Date' ? new Date(Math.min(minDate, minEventDate)) : minDate;
      startDate.setDate(startDate.getDate() - 1)

      const startNAV = 0;

      let dates = [startDate, ...dateOfNavDates]
      dates = dates.map(date => {
        const tempDate = new Date(date)
        return moment(tempDate).format('MM/DD/YYYY')
      })
      const navs = [startNAV, ...navOfNavDates]

      const data = {dates: dates, navs: navs, eventAmounts: eventAmounts, eventDates: eventDates};
      console.log(data);

      return await getIrrBenchmark(benchmark, {dates: dates, navs: navs, eventAmounts: eventAmounts, eventDates: eventDates})

    }

    async function calcIrr(navDates, eventAmounts, eventDates) {
      const dateOfNavDates = navDates.map(navDate => new Date(navDate.date))
      const navOfNavDates = navDates.map(navDate => navDate.nav)
      let minDate = new Date(Math.min(...dateOfNavDates))
      let minEventDate = new Date(Math.min(...eventDates.map(date => new Date(date))))
      let startDate = minEventDate != 'Invalid Date' ? new Date(Math.min(minDate, minEventDate)) : minDate;
      startDate.setDate(startDate.getDate() - 1)

      const startNAV = 0;

      let dates = [startDate, ...dateOfNavDates]
      dates = dates.map(date => {
        const tempDate = new Date(date)
        return moment(tempDate).format('MM/DD/YYYY')
      })
      const navs = [startNAV, ...navOfNavDates]

      const data = {dates: dates, navs: navs, eventAmounts: eventAmounts, eventDates: eventDates};
      console.log(data);

      return await getIrr({dates: dates, navs: navs, eventAmounts: eventAmounts, eventDates: eventDates})

    }

    async function manipulateData() {
      const myData = await fetchData();

      const investment = await getInvestment(investmentID);
      if (investment.invest_type === 'commit') {
        setNAVColumns(['Date', 'NAV', 'Net Contribution', 'P/L (LTD)', 'P/L (MTD)', 'P/L(%) (MTD)', 'Unexplained Gain', 'IRR', 'Remaining Commitment', 'Float'])
        setMoneyColumns(['NAV', 'Net Contribution', 'P/L (LTD)', 'P/L (MTD)', 'P/L(%) (MTD)', 'Unexplained Gain', 'IRR', 'Remaining Commitment', 'Float'])
      }

      const groups = groupByMonth(myData, investment.invest_type);
      let minDate = new Date(Math.min(...Object.keys(groups).map(date => new Date(date))));

      const today = new Date();
      let currEndMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      let finalMonth = new Date(Math.max(...Object.keys(groups).map(date => new Date(date))));
      finalMonth = new Date(Math.max(currEndMonth, finalMonth));

      let prev_nav = 0;
      let nav = 0;
      let prelim_nav = 0;
      let netContribute = 0;
      const navDates = [];
      let remaining_commitment = investment.invest_type === 'commit' ? investment.commitment : undefined;
      let last_pl = null;
      while (minDate <= finalMonth) {
        let float = calcFloat(myData, minDate);

        nav = calcNAV(groups[minDate], investmentID, prev_nav, investment.invest_type);
        prelim_nav = calcPrelimNAV(groups[minDate], investmentID, prev_nav, investment.invest_type);
        netContribute = calcNetContribute(groups[minDate], investmentID, netContribute);
        remaining_commitment = calcRemainingCommitment(groups[minDate], remaining_commitment);
        const formatDate = moment(minDate).format('L')


        const hasEndOfMonthNAV = groups[minDate] ? groups[minDate].filter(event => {
          if (event.type === 'NAV') {
            const date = new Date(event.date);
            if (date.getDate() === minDate.getDate()
                && date.getMonth() === minDate.getMonth()
                && date.getFullYear() === minDate.getFullYear()) {
                  return true;
            }
          }
          return false;
        }).length > 0 : false;

        if (last_pl === null) {
          const mtd = nav - netContribute
          navDates.push({date: formatDate, nav: nav, net_contribution: netContribute,
                          nav_prelim: prelim_nav, unexplained_gain: nav - prelim_nav,
                          'p/l_(ltd)': nav - netContribute,
                          'p/l_(mtd)': mtd, remaining_commitment: remaining_commitment,
                          bold: hasEndOfMonthNAV, float: float})
        }
        else {
          const mtd = (nav - netContribute - last_pl)
          const mtd_perc = (mtd/prev_nav * 100).toFixed(2) + '%'
          navDates.push({date: formatDate, nav: nav, net_contribution: netContribute,
                          nav_prelim: prelim_nav, unexplained_gain: nav - prelim_nav,
                          'p/l_(ltd)': nav - netContribute,
                          'p/l_(mtd)': mtd,
                          'p/l(%)_(mtd)': mtd_perc,
                          remaining_commitment: remaining_commitment,
                          bold: hasEndOfMonthNAV, float: float})
        }
        last_pl = (nav - netContribute).valueOf()




        // get next end of month
        minDate = new Date(minDate.getFullYear(), minDate.getMonth() + 2, 0);
        prev_nav = nav;
      }

      const [eventAmounts, eventDates] = await getIrrEvents(myData);
      const irrs = await calcIrr(navDates, eventAmounts, eventDates);

      const primary_benchmark = investment.primary_benchmark == null ? undefined :  await getBenchmark(investment.primary_benchmark);
      const primary_benchmark_name = investment.primary_benchmark == null ? undefined : primary_benchmark.name;
      console.log(investment.primary_benchmark);
      let irrs_primary = []
      if (investment.primary_benchmark != undefined) {
          irrs_primary = await calcIrrBenchmark(navDates, eventAmounts, eventDates, investment.primary_benchmark);
      }

      let irrColumnIndex = NAVColumns.findIndex(i => i === 'IRR');
      irrColumnIndex+=1;
      let hasPrimaryBenchmark = investment.primary_benchmark != undefined;


      setNAVColumns((NAVColumns) => {
        console.log(NAVColumns)

        if (NAVColumns != undefined && primary_benchmark != undefined) {
          NAVColumns.splice(irrColumnIndex, 0, 'IRR ('+primary_benchmark_name+')')
          console.log(NAVColumns)
        }
        return NAVColumns;
      })
      setMoneyColumns((moneyColumns) => {
        console.log(moneyColumns)
        if (moneyColumns != undefined && primary_benchmark != undefined) {
          moneyColumns.splice(irrColumnIndex, 0, 'IRR ('+primary_benchmark_name+')')
        }
        return moneyColumns;
      })

      if (hasPrimaryBenchmark) {
        irrColumnIndex += 1;
      }

      const secondary_benchmark = investment.secondary_benchmark == null ? undefined : await getBenchmark(investment.secondary_benchmark);
      const secondary_benchmark_name = investment.secondary_benchmark == null ? undefined : secondary_benchmark.name;
      let irrs_secondary = []
      if (investment.secondary_benchmark != undefined) {
          irrs_secondary = await calcIrrBenchmark(navDates, eventAmounts, eventDates, investment.secondary_benchmark);
      }
      setNAVColumns((NAVColumns) => {
        console.log(NAVColumns)
        if (NAVColumns != undefined && secondary_benchmark != undefined) {
          NAVColumns.splice(irrColumnIndex, 0, 'IRR ('+secondary_benchmark_name+')')
        }
        return NAVColumns;
      })
      setMoneyColumns((moneyColumns) => {
        console.log(moneyColumns)
        if (moneyColumns != undefined && secondary_benchmark != undefined) {
          moneyColumns.splice(irrColumnIndex, 0, 'IRR ('+secondary_benchmark_name+')')
        }
        return moneyColumns;
      })
      console.log(irrs);
      irrs.map(irr => {
        const [date, irrRate] = irr.split(' ');
        const [month, day, year] = date.split('/');

        const formattedDate = `${month}/${day}/${year}`;
        try {
          const navDate = navDates.filter(navDate => navDate.date === formattedDate)
          navDate[0].irr = parseFloat(irrRate).toFixed(2) + '%'
        }
        catch (e) {
        }
      })
      irrs_primary.map(irr => {
        const [date, irrRate] = irr.split(' ');
        const [month, day, year] = date.split('/');

        const formattedDate = `${month}/${day}/${year}`;
        try {
          const navDate = navDates.filter(navDate => navDate.date === formattedDate)
          const navDate0 = navDate[0];
          console.log(navDate0);
          navDate0['irr_(' + primary_benchmark_name.toLowerCase().replace(new RegExp(' ', 'g'), '_') + ')'] = parseFloat(irrRate).toFixed(2) + '%'
        }
        catch (e) {
        }
      })
      irrs_secondary.map(irr => {
        const [date, irrRate] = irr.split(' ');
        const [month, day, year] = date.split('/');

        const formattedDate = `${month}/${day}/${year}`;
        try {
          const navDate = navDates.filter(navDate => navDate.date === formattedDate)
          navDate[0]['irr_(' + secondary_benchmark_name.toLowerCase().replace(new RegExp(' ', 'g'), '_') + ')'] = parseFloat(irrRate).toFixed(2) + '%'
        }
        catch (e) {
        }
      })

      console.log(navDates)
      setNAVEventData(navDates)
    }

    manipulateData().catch(e =>
      setError(e)
    )


  }, []);

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (NAVEventData === null) {
    return null;
  }
  return (<MaintenanceTable name={"NAV"} data={NAVEventData}
            columns={NAVColumns} investmentID={investmentID}
            moneyColumns={moneyColumns}/>);
};

export default NAVTable;
