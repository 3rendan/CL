import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import moment from 'moment';

import {getSingleEntrys, getNAVEvents} from '../serverAPI/singleEntry.js'
import {getDistributionsInvestment} from '../serverAPI/distributions.js'
import {getContributionsInvestment} from '../serverAPI/contributions.js'
import {getCommissionsInvestment} from '../serverAPI/commissions.js'
import {getTransfers} from '../serverAPI/transfers.js'
import {getInvestments} from '../serverAPI/investments'

import {stringDateConvertLocalTimezone} from '../timezoneOffset';

import {getAccount} from '../serverAPI/accounts'
import {getAssetClass} from '../serverAPI/assetClass'
import {getOwner} from '../serverAPI/owners'

import {calcNAV, calcNetContribute, calcFloat} from '../SpecialColumn'

import MaintenanceTable from './reportTables'

function calcRemainingCommitment(data, investment) {
  if (investment.invest_type !== 'commit') {
    return undefined;
  }
  let remaining_commitment = investment.commitment;
  if (data === undefined) {
    return remaining_commitment;
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

const InvestmentNAVReport = (props) => {
  const [data, setData] = useState(null);
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
      const investments = await getInvestments();

      let total_remaining_commitment = 0;
      let float = 0;
      let investmentNAVS = await Promise.all(investments.map(async (investment) => {
        const data = await fetchData(investment.id);

        const account = investment.account ? (await getAccount(investment.account)).name : '';
        const asset_class = investment.asset_class ? (await getAssetClass(investment.asset_class)).name : '';
        const owner = investment.owner ? (await getOwner(investment.owner)).name : '';

        const midnightEndOfDate = stringDateConvertLocalTimezone(date);
        console.log(midnightEndOfDate)
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
        const remaining_commitment = calcRemainingCommitment(dataBeforeDate, investment);
        total_remaining_commitment += remaining_commitment ? remaining_commitment : 0;
        return {investment: investment.name, nav: nav, remaining_commitment: remaining_commitment, seq_no: investment.seq_no,
                asset_class: asset_class, account: account, owner: owner}
      }));

      investmentNAVS.sort(function (a, b) {
        return a.seq_no - b.seq_no;
      });

      const totalNAV = investmentNAVS.reduce((a,b) => a + b.nav, float);
      const investmentData = investmentNAVS.map((investment) => {
        return {investment: investment.investment, account: investment.account,
              owner: investment.owner, asset_class: investment.asset_class,
              nav: investment.nav, remaining_commitment: investment.remaining_commitment,
                'nav_(%)': (investment.nav/totalNAV * 100).toFixed(2) + '%'}
      })
      investmentData.push({investment: 'Float', nav: float, 'nav_(%)': (float/totalNAV * 100).toFixed(2) + '%'})

      investmentData.push({investment: 'Total NAV', nav: totalNAV, 'nav_(%)': '100.00%',
                            remaining_commitment: total_remaining_commitment})
      setData(investmentData);
    }
    manipulateData().catch(e => setError(e))

  }, [date]);

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (data === null) {
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
      <MaintenanceTable name={"Investment NAV"} data={data}
            columns={['Investment', 'Asset Class', 'Account', 'Owner',
                      'NAV', 'NAV (%)', 'Remaining Commitment']}
            moneyColumns={['NAV', 'NAV (%)', 'Remaining Commitment']}
            noButton={true}/>
    </Fragment>
    );
}

export default InvestmentNAVReport;
