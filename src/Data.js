const AccountData = {
    'Name': ['Account1', 'Account2', 'Account3', 'Account4',
             'Account5', 'Account6', 'Account7', 'Account8'],
    'Long Name': ['Long Name Account1', 'Long Name Account2', 'Long Name Account3', 'Long Name Account4',
    'Long Name Account5', 'Long Name Account6', 'Long Name Account7', 'Long Name Account8'],
    'Institution': ['Chase', 'Chase', 'Chase', 'Chase',
                    'Chase', 'Chase', 'Chase', 'Chase'],
    'Account Number': ['ME-3423fds3', 'ME-3423fds3', 'ME-3423fds3', 'ME-3423fds3',
                       'ME-3423fds3', 'ME-3423fds3', 'ME-3423fds3', 'ME-3423fds3']
};

const InvestmentData = {
    'Name': ['Oil Bob', 'Mary May', 'Christine Lobowski', 'Brendon Philips',
             'Margret Marmajuke'],
    'Long Name': ['Long Name Account1', 'Long Name Account2', 'Long Name Account3', 'Long Name Account4'],
    'Asset Class': ['Long Name Account6', 'Long Name Account7', 'Long Name Account8'],
    'Sub Asset Class': ['Chase', 'Chase', 'Chase', 'Chase',
                    'Chase', 'Chase', 'Chase', 'Chase'],
    'Account': ['ME-3423fds3', 'ME-3423fds3', 'ME-3423fds3', 'ME-3423fds3',
                       'ME-3423fds3', 'ME-3423fds3', 'ME-3423fds3', 'ME-3423fds3'],
    'Account Owner': ['ME-3423fds3', 'ME-3423fds3', 'ME-3423fds3', 'ME-3423fds3',
                  'ME-3423fds3', 'ME-3423fds3', 'ME-3423fds3', 'ME-3423fds3'],
    'Commitment? (Y/N)': [false, false, 'false', 'false',
                  'false', 'false', 'false', 'false'],
    'Primary Benchmark': ['ME-3423fds3', 'ME-3423fds3', 'ME-3423fds3', 'ME-3423fds3',
                  'ME-3423fds3', 'ME-3423fds3', 'ME-3423fds3', 'ME-3423fds3'],
    'Secondary Benchmark': ['ME-3423fds3', 'ME-3423fds3', 'ME-3423fds3', 'ME-3423fds3',
                'ME-3423fds3', 'ME-3423fds3', 'ME-3423fds3', 'ME-3423fds3'],
    'Commitment': ['0', '10', '100', '1000',
                '1000.25', '500.10', '90.2', '10.1'],
    'Size (M)': ['0', '10', '100', '1000',
                '1000.25', '500.10', '90.2', '10.1'],
    'End of Term': ['2021', '2021', '2021', '2021',
                '2021', '2022', '2022', '2022'],
    'Management Fee': ['2021', '2021', '2021', '2021',
                '2021', '2022', '2022', '2022'],
    'Preferred Return': ['2021', '2021', '2021', '2021',
                '2021', '2022', '2022', '2022'],
    'Carried Interest': ['2021', '2021', '2021', '2021',
                '2021', '2022', '2022', '2022'],
    'Close Date': ['2021', '2021', '2021', '2021',
                '2021', '2022', '2022', '2022'],
    'Sponsor Investment': ['2021', '2021', '2021', '2021',
                '2021', '2022', '2022', '2022'],
    'Notes': ['Notes', 'Not \r \n \r \n \r \n e \r \n \r \n \r \n s', 'Notes', 'Notes',
                'Notes', 'bla bla', 'bla bla', 'bla bla'],
};

const OwnerData = {
    'Name': ['James', 'Jaimie', 'Sugar Leaf', 'May Leaf', 'Mint Leaf', 'Autumn Leaf'],
    'Long Name': ['James', 'Jaimie', 'Sugar Leaf', 'May Leaf', 'Mint Leaf', 'Autumn Leaf']
};

const AssetClassData = {
    'Name': ['US Equity', 'Developed', 'Emerging', 'Private Equity',
     'Hedge Funds', 'Real Assets', 'Fixed Income', 'Cash'],
    'Long Name': ['US Equity', 'Developed', 'Emerging', 'Private Equity',
     'Hedge Funds', 'Real Assets', 'Fixed Income', 'Cash'],
     'Super Asset Class': ['Equity', 'Equity', 'Equity', 'Equity', 'Equity', 'Equity', 'Bond', 'Bond'],
     'Primary Benchmark': ['W5000', 'MSEAFE-NET', 'MSEM-NET', 'CambrUSPE'],
     'Secondary Benchmark': ['W5000', 'MSEAFE-NET', 'MSEM-NET', 'CambrUSPE'],
};

const BenchmarkData = {
    'Name': ['W5000', 'MSEAFE-NET', 'MSEM-NET', 'CambrUSPE']
};

const Events = {
  'Type': ['INFLOW'],
  'Date': ['11/23/2012'],
  'Investment': ['invest'],
  'Amount': [200],
  'Notes': ['hello'],
};


export {AccountData, InvestmentData, OwnerData,
        AssetClassData, BenchmarkData, Events};
