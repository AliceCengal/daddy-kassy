const TODAY = new Date();
const VERSION = 3.0;
const ENTER_KEY = 13;

function App(props) {
  const [currentPage, setPage] = React.useState(
    window.location.hash.slice(1) || 'about');
  const [colorTheme, setColorTheme] = React.useState('deep-purple');
  const [account, setAccount] = React.useState(null)

  React.useEffect(() => {
    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function handleHashChange(e) { setPage(window.location.hash.slice(1)) }

  return <React.Fragment>
    <Navbar />
    {(currentPage === 'about' ? <AboutPage /> : null)}
    {(currentPage === 'help' ? <HelpPage /> : null)}
    {(currentPage === 'load' ?
      <LoadPage setAccount={setAccount} /> : null)}
    {(currentPage === 'save' ?
      <DownloadPage account={account} /> : null)}
    {(currentPage === 'new' ?
      <NewPage setAccount={setAccount} color={colorTheme} setColor={setColorTheme} /> : null)}
    {(currentPage === 'spreadsheet' ?
      <SpreadsheetPage account={account} setAccount={setAccount} /> : null)}
  </React.Fragment>
}

function NavbarLink({ label }) {
  const hash = window.location.hash.slice(1);
  return <button
    disabled={hash === label.toLowerCase()}
    className='btn btn-secondary'
    onClick={() => window.location.hash = label.toLowerCase()}>
    {label}
  </button>
}

function Navbar(props) {
  return (
    <header className='d-flex flex-row w-100 w3-theme-l1 
        justify-content-between align-items-center p-3 shadow'>
      <h1>Daddy Cussy</h1>
      <nav className='btn-group border border-light border-3 rounded'>
        <NavbarLink label='Spreadsheet' />
        <NavbarLink label='New' />
        <NavbarLink label='Load' />
        <NavbarLink label='Save' />
        <NavbarLink label='Help' />
        <NavbarLink label='About' />
      </nav>
      <div style={{ "fontSize": 'small', "textAlign": 'right' }}>
        site design and logo<br />
        &copy; Athran Zuhail 2022 all rights reserved</div>
    </header>)
}

function AboutPage(props) {
  return (<main className='w-50 mx-auto pt-4'>
    <h1 className='w3-text-theme'>About this app</h1>
    <p>This is an app for tracking and analyzing simple personal income, expense,
      and investment. The target audience is an average working adult.</p>
    <p>To start using this application, </p>
    <ul>
      <li>create a <a href="#new">New</a> spreadsheet, or </li>
      <li><a href="#load">Load</a> a previously saved spreadsheet. </li>
    </ul>
    <p>Note that this app does not save any data to any server, so it is very
      important that you <a href="#save">Save</a> your work after
      you're done, otherwise all of your progress will be lost.</p>
    <p>If you need any further <a href="#help">Help</a>, feel free to ask any question.</p>
  </main>)
}

function HelpPage(props) {
  return (<main className='w-100 pt-4'><div className='w-50 mx-auto mb-5'>
    <h1 className='w3-text-theme'>Help for you</h1>
    <h4>Q: How do I edit or delete an entry?</h4>
    <p>A: DOUBLE-CLICK the row that you want to edit or delete. That row will be deleted
      and its details will be copied to the input row above it. You can edit that input row
      and press ENTER (or CLICK the + button) to resubmit the edit, or ignore it for
      a full delete.</p>
    <h4>Q: What is Income?</h4>
    <p>A: Any money that you receive. Salary, bonus, stipend, compensation, investment
      dividend, someone paying back a personal loan, bank account balance carryover at the
      start of the financial year, ...</p>
    <h4>Q: What is Expense?</h4>
    <p>A: Any money that you spend. Buying something, paying fees and penalties,
      paying taxes, paying loan installments, ...</p>
    <h4>Q: What is Gross Worth?</h4>
    <p>A: Gross Worth = Total Income - Total Expense</p>
    <h4>Q: What is Net Worth?</h4>
    <p>A: Net Worth = Gross Worth + Total Obligation</p>
    <h4>Q: What is Obligation?</h4>
    <p>A: Deferred expense and income. A positive obligation is when someone/something
      promises to pay you a specific amount at a later date (deferred income). A negative
      obligation is when you promise to pay someone/something a specific amount at a
      later date (deferred expense).</p>
    <p> Recording deferred expense/income helps you better understand your financial
      position at a particular moment. Your goal in this game is to try keep both
      your gross worth and net worth above zero. Between net worth and gross worth,
      the lower amount represents your discretionary fund that you can spend on
      entertainment or luxury. Stop any luxury spending before you dip into
      negative worth.</p>
    <p><strong>Example 1:</strong> You have a big yearly payment commitment (motor
      insurance, college tuition, property tax, club membership) of $6000.
      An easy way to spread out this commitment/obligation is to record the amount
      divided by 12 as a negative obligation on every month. This is an example of
      deferred expense. Even though you haven't made the payment yet, you pretend
      that you have made fractions of the payment by recording it as a negative
      obligation.</p><p>
      <span className='text-code'>OBLIGATION | 1-Feb | tuition | -$500</span><br />
      <span className='text-code'>OBLIGATION | 1-Mar | tuition | -$500</span><br />
      <span className='text-code'>OBLIGATION | 1-Apr | tuition | -$500</span></p>
    <p>This will automatically deduct that amount from your net worth, which signals
      that you don't have as much discretionary fund as your bank account statement might
      tell you. At the end of the year, when it's time to pay that commitment, record it
      as an expense, and also record the same amount as a positive obligation.</p><p>
      <span className='text-code'>EXPENSE    | 31-Dec | tuition | $6000</span><br />
      <span className='text-code'>OBLIGATION | 31-Dec | tuition | $6000</span></p>
    <p><strong>Example 2: </strong> You lend $300 to a friend, who promises to
      pay it back in three months. Record it as an expense, and also as a positive obligation
      by the same amount. This signals that while there is less money in your
      bank account, you have more worth available that is locked up. This is an
      example of deferred income. Even though you haven't received the money yet,
      you pretend as if you have received the money by recording it as a positive
      obligation.</p><p>
      <span className='text-code'>EXPENSE    | 24-Feb | loan to John | $300</span><br />
      <span className='text-code'>OBLIGATION | 24-Feb | loan to John | $300</span></p>
    <p>When the friend pays the loan back, record it as an income, and also a negative
      obligation by the same amount.</p><p>
      <span className='text-code'>INCOME     | 24-May | loan to John |  $300</span><br />
      <span className='text-code'>OBLIGATION | 24-May | loan to John | -$300</span></p>
    <p><strong>Example 3: </strong> You borrow $300 from a friend, promising to
      pay it back in three months. Record it as an income, and also as a negative obligation
      by the same amount. This signals that while there is more money in your
      bank account, this is not part of your discretionary fund. This is an
      example of deferred expense. Even though you haven't paid back the loan yet,
      you pretend as if you have paid the loan by recording it as a negative
      obligation.</p><p>
      <span className='text-code'>INCOME     | 24-Feb | loan from John |  $300</span><br />
      <span className='text-code'>OBLIGATION | 24-Feb | loan from John | -$300</span></p>
    <p>When the you pay the loan back, record it as an expense, and also a positive
      obligation by the same amount.</p><p>
      <span className='text-code'>EXPENSE    | 24-May | loan from John | $300</span><br />
      <span className='text-code'>OBLIGATION | 24-May | loan from John | $300</span></p>
    <h4>Q: How do I record investments and savings?</h4>
    <p>A: You could record your deposits into an investment account as an expense,
      paired with a positive obligation. This signals that while your checking account
      balance may be low, you have a significant amount of worth tied up elsewhere.
      The dividend is recorded as income if you withdraw it, or as a positive obligation
      if you immediately reinvest it.</p><p>
      <span className='text-code'>EXPENSE    | 26-Feb | invest   | $300</span><br />
      <span className='text-code'>OBLIGATION | 26-Feb | invest   | $300</span><br />
      <span className='text-code'>EXPENSE    | 26-Mar | invest   | $300</span><br />
      <span className='text-code'>OBLIGATION | 26-Mar | invest   | $300</span><br />
      <span className='text-code'>EXPENSE    | 26-Apr | invest   | $300</span><br />
      <span className='text-code'>OBLIGATION | 26-Apr | invest   | $300</span><br />
      <span className='text-code'>INCOME     | 01-May | dividend | $550</span></p>
    <p>When you withdraw from an investment account, record it as an income,
      paired with an equal amount of negative obligation.</p><p>
      <span className='text-code'>INCOME     | 17-Oct | investment   |  $70,000</span><br />
      <span className='text-code'>OBLIGATION | 17-Oct | investment   | -$70,000</span></p>
    <p>But some people have a phobia of excess fund. You could also record investment
      deposits simply as expense, treating the amount in your investment account as
      a mystery so that you can't be tempted to spend it. Withdrawing from the
      investment account then is just an income.</p><p>
      <span className='text-code'>EXPENSE    | 26-Feb | invest    | $300</span><br />
      <span className='text-code'>EXPENSE    | 26-Mar | invest    | $300</span><br />
      <span className='text-code'>EXPENSE    | 26-Apr | invest    | $300</span><br />
      <span className='text-code'>INCOME     | 26-May | invest W/ | $1000</span></p>
    <h4>Q: How do I record credit card transaction?</h4>
    <p>A: When you charge a purchase on a credit card, you haven't actually paid
      anything yet. Since this is a deferred expense, you can record it as a
      negative obligation. When you pay the credit card balance at the end of
      the month, then it is an expense, paired with a positive obligation of
      the same amount.</p><p>
      <span className='text-code'>OBLIGATION |  5 Jul | clothing | -$50</span><br />
      <span className='text-code'>OBLIGATION |  6 Jul | grocery  | -$80</span><br />
      <span className='text-code'>OBLIGATION |  7 Jul | coffee   | -$20</span><br />
      <span className='text-code'>EXPENSE    | 31 Jul | cc bal   | $150</span><br />
      <span className='text-code'>OBLIGATION | 31 Jul | cc bal   | $150</span></p>
    <p>However, if you are the kind of person that uses a credit card as
      if it is a debit card and fully pays off the balance every month,
      you could just record every credit card charge like a normal expense.
      In this case, the payment of credit card balance at the end of the month
      is not recorded.</p><p>
      <span className='text-code'>EXPENSE |  5 Jul | clothing | $50</span><br />
      <span className='text-code'>EXPENSE |  6 Jul | grocery  | $80</span><br />
      <span className='text-code'>EXPENSE |  7 Jul | coffee   | $20</span></p>
    <h4>Q: How do I record cash withdrawal?</h4>
    <p>** This is written assuming that you are a millenial adult living in a
      fairly developed country who doesn't really use cash for significant expenses all
      that much anymore.</p>
    <p>A: Technically, cash withdrawal is not any kind of transaction. Only when you
      buy something with that cash would it become an expense. However, since cash
      is often used for small purchases that are tedious to record, it's easier
      to just record the cash withdrawal as an expense to lump together all of your
      small cash expenses.</p><p>
      <span className='text-code'>EXPENSE | 13-Mar | cash withdraw | $300</span></p>
    <p>In the rare case where you had to make a big expense with cash, you may
      record it as such. Let's say you withdraw $500 to buy an item for $467 cash.</p><p>
      <span className='text-code'>EXPENSE | 26-Mar | antique clock | $467</span><br />
      <span className='text-code'>EXPENSE | 26-Mar | cash withdraw |  $33</span></p>
    <h4>Q: Why doesn't the app save data to the server?</h4>
    <p>A: That would be convenient for sure, but is a privacy risk. You should store
      your financial records locally, or on a secure file hosting service.</p>
    <h4>Q: How do I transition to the next financial year?</h4>
    <p>A: On the New page, type your current Gross Worth into the Starting Balance field,
      and your current total Obligation into the Starting Obligation field.</p>
  </div></main>)
}

function LoadPage({ setAccount }) {
  const [tempAccount, setTempAccount] = React.useState(null);

  const storedAccount = [];
  for (var i = 0; i < localStorage.length; i++) {
    if (localStorage.key(i).startsWith('account-'))
      storedAccount.push(localStorage.key(i));
  }

  function choosenFile(e) {
    let fr = new FileReader();
    fr.onload = function () {
      let data;
      try {
        data = JSON.parse(fr.result);
      } catch (err) {
        console.log(err);
        return alert("Invalid JSON in file.");
      }
      setTempAccount(data);
    }
    fr.readAsText(e.target.files[0]);
  }

  function chooseAccount(e) {
    // create the DB object
    setAccount(accountDatabaseFromFile(tempAccount));
    window.location.hash = 'spreadsheet'
  }

  return (<main className='w-75 mx-auto pt-4 container'>
    <div className='row mb-3'>
      <h1 className='w3-text-theme col text-center'>
        Load a previously saved spreadsheet
      </h1>
    </div>
    <div className='row '>
      <div className='col mx-3 p-3 bg-white shadow-sm'>
        <h3>Load from file</h3>
        <p>It should be a <span className='text-code'>.json</span> file:</p>
        <input type="file" accept=".json" className='form-control mb-3'
          onChange={choosenFile} />
        {tempAccount === null ? null :
          <p className='bg-light px-3'>
            {tempAccount.name}, {tempAccount.year} -
            {tempAccount.transactions.length} transactions</p>}
        <p>Make sure you have saved/downloaded any active spreadsheet,
          because loading a new one will overwrite the current one.</p>
        {tempAccount === null ?
          <button className='btn btn-primary' disabled>LOAD</button>
          : <button className='btn btn-primary' onClick={chooseAccount}>
            LOAD {tempAccount.name}, {tempAccount.year}
          </button>}
      </div>
      <div className='col p-3 bg-white shadow-sm'>
        <h3>Load from browser storage</h3>
        {localStorage.length ?
          storedAccount.map((aa) =>
            <p>aa</p>)
          : <p>No items in local storage</p>}
      </div>
    </div>
  </main>)
}

function DownloadPage({ account }) {
  const [danger, setDanger] = React.useState(
    localStorage.getItem('danger') || ''
  )

  // Function to download data to a file
  // https://stackoverflow.com/questions/13405129/javascript-create-and-save-file
  // use type : 'application/json'
  function download(data, filename, type) {
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
      let a = document.createElement("a");
      let url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
  }

  function downloadAccount() {
    if (account !== null)
      download(
        JSON.stringify(account),
        account.name + '-' + account.year,
        'application/json'
      )
    else alert("Create an account first.")
  }

  function saveAccount() {
    if (account !== null) {
      localStorage.setItem('danger', 'danger')
      localStorage.setItem(
        `account-${account.name}-${account.year}`,
        JSON.stringify(account))
    } else alert("Create an account first.")
  }

  return (<main className='w-50 mx-auto pt-4'>
    <h1 className='w3-text-theme'>Download the spreadsheet</h1>
    <p>The app will download the data you had entered into a file. This file is
      not encrypted or obfuscated in any way, it's just structured into JSON.
      It is not copyright protected. It is your data, and you are free to inspect,
      copy, distribute, or modify it whichever way you want.</p>
    <p>However, manual modification may cause that file to be in an invalid
      format, and thus unrecognizable and unusable by this app.</p>
    <p>Keep this file in a dusty corner of your computer, or upload it to a secure
      file hosting service. The next time you want to use this app again, find
      that file and <a href="#load">Load</a> it back into the app.</p>
    <div className='mb-5'>
      <button className='btn btn-primary' onClick={downloadAccount}>
        DOWNLOAD
      </button>
    </div>
    {(danger ?
      <div>
        <h2 className='w3-text-theme'>Save in browser storage</h2>
        <p>Only do this if this page is open on your personal device.</p>
        <p>Do not click the button below if you are using a public computer</p>
        <button className='btn btn-danger' onClick={saveAccount}>
          SAVE
        </button>
        <button className='btn btn-link' onClick={() => setDanger('')}>
          Hide
        </button>
      </div>
      : <p className='text-secondary' onClick={() => setDanger('danger')}>
        &gt; Dangerous option
      </p>
    )}
  </main >)
}

function PopoutTooltip({ children }) {
  return <div className='col-1 mytooltip'>
    &#x1F6C8;
    <span className='w3-theme-l1 mytooltiptext mttt-right'>
      {children}
    </span>
  </div>
}

function NewPage({ setAccount }) {
  const dateFmt = TODAY.toLocaleDateString()
    .split(/[-./]/g)
    .filter((a) => a < 32) // remove year, keep date and month
    .join(TODAY.toLocaleDateString().match(/[-./]/g)[0])

  function submit(e) {
    e.preventDefault()
    const formData =
      Object.fromEntries(
        new FormData(e.target));
    const account = accountDatabaseFromFile(formData);

    if (formData.startingBalance) {
      const startingDate = new Date()
      startingDate.setFullYear(
        account.year,
        (formData.startingMonth || '0') - 1,
        1
      );

      account.addTransaction(
        startingDate.toLocaleDateString(),
        'Starting balance',
        account.INCOME,
        formData.startingBalance)
    }
    console.log(formData)
    console.log(account);
    setAccount(account);
    window.location.hash = 'spreadsheet'
  }

  function swapColorTheme(colorTheme) {
    const style = document.getElementById("w3-theme-color");
    if (colorTheme === "none") {
      style.href = ''
    } else {
      style.href = `https://www.w3schools.com/lib/w3-theme-${colorTheme}.css`
    }
  }

  return (<main className='w-100 pt-4'>
    <div className='w-50 mx-auto'>
      <h1 className='w3-text-theme'>Create new spreadsheet</h1>
      <p>Make sure you have saved/downloaded any active spreadsheet,
        because creating a new one will overwrite the current one.</p>
    </div>
    <form className='container w-50' onSubmit={submit} >
      <div className='row mb-3 align-items-center'>
        <div className='col-4'>Name</div>
        <div className='col'>
          <input type='text' className='form-control'
            defaultValue='You' name='name' />
        </div>
        <PopoutTooltip>
          Who or what this account is about. It could be a person,
          a legal entity (a married couple, a trust),
          an organization (school club, neighbourhood watch),
          an activity (wedding, party),
          or a business.
        </PopoutTooltip>
      </div>
      <div className='row mb-3 align-items-center'>
        <div className='col-4'>Year</div>
        <div className='col'>
          <input type='number' className='form-control'
            defaultValue={TODAY.getFullYear()} name='year' />
        </div>
        <PopoutTooltip>
          This spreadsheet will only be valid for one year,
          from 1 January to 31 December. Start a new spreadsheet at
          the start of a new calendar year. Non-calendar fiscal year
          is not supported.
        </PopoutTooltip>
      </div>
      <div className='row mb-3 align-items-center'>
        <div className='col-4'>Your date format</div>
        <div className='col'>
          <input type='text' className='form-control'
            readonly value={dateFmt} />
        </div>
        <PopoutTooltip>
          There are many variations in how a date is written around
          the world. Displayed here is how your browser is configured
          to display and interpret today's date. Note the month and day
          order, and the separator used. Please use this exact
          same format when recording your account transactions.
        </PopoutTooltip>
      </div>
      <div className='row mb-3'>
        <div className='col-11 border-top border-3'></div>
      </div>
      <div className='row mb-3 align-items-center'>
        <div className='col-4'>Starting balance</div>
        <div className='col'>
          <input type='number' className='form-control'
            placeholder='optional' name='startingBalance' />
        </div>
        <PopoutTooltip>
          The total of your checking account balance(s),
          also known as your gross worth.
        </PopoutTooltip>
      </div>
      <div className='row mb-3 align-items-center'>
        <div className='col-4'>Starting month</div>
        <div className='col'>
          <input type='number' className='form-control'
            placeholder='optional' name='startingMonth'
            min='1' max='12' />
        </div>
        <PopoutTooltip>
          If you enter any amount in the starting balance field, by default
          it will be recorded on the date 1/1. Use this field to specify a
          different starting month.
        </PopoutTooltip>
      </div>
      <div className='row mb-3 align-items-center'>
        <div className='col-4'>Currency label</div>
        <div className='col'>
          <input type='text' className='form-control'
            placeholder='optional' name='currency' />
        </div>
        <PopoutTooltip>
          Purely cosmetic. Multi-currency input and conversion is not supported.
        </PopoutTooltip>
      </div>
      <div className='row mb-3 align-items-center'>
        <div className='col-4'>Color theme</div>
        <div className='col-7'>
          <select name='colorTheme' className='form-control' defaultValue='deep-purple'
            onChange={(e) => swapColorTheme(e.target.value)} >
            {['Red', 'Pink', 'Purple', 'Deep Purple', 'Indigo', 'Blue', 'Light Blue', 'Cyan',
              'Teal', 'Green', 'Light Green', 'Lime', 'Khaki', 'Yellow', 'Amber', 'Orange',
              'Deep Orange', 'Blue Grey', 'Brown', 'Grey', 'Dark Grey', 'Black', 'None'
            ].map((cc) => <option value={cc.toLowerCase().replace(' ', '-')}>{cc}</option>)}
          </select>
        </div>
      </div>
      <div className='row mb-3 justify-content-center'>
        <div className='col-6'>
          <input hidden name='version' defaultValue={VERSION} />
          <input type='submit' className='btn btn-primary w-100' />
        </div>
      </div>
    </form>
  </main>)
}

function SpreadsheetPage({ account, setAccount }) {
  //if (account === null) window.location.hash = 'new';
  return (<main className='pt-3 container w-100'>
    <div className='row mb-2'>
      <div
        className='col d-flex justify-content-between align-items-center bg-white shadow-sm py-3 mx-2'>
        <h4 className='w3-text-theme d-inline-block m-0'>
          {account ? `${account.name} ${account.year}` : "Placeholder 0000"}
        </h4>
        <div className='mytooltip'>
          <span className='py-3'>gadgets</span>
          <div className='mytooltiptext mttt-below d-flex flex-column align-items-end'>
            <button className='btn btn-secondary'>timeline</button>
            <button className='btn btn-secondary'>proportion</button>
            <button className='btn btn-secondary'>template</button>
          </div>
        </div>
      </div>
      <div className='col d-flex flex-row justify-content-between align-items-center mx-2'>
        <div></div><span>gross worth</span>
        <span className="text-code">0.00</span>
      </div>
      <div className='col d-flex flex-row justify-content-between align-items-center mx-2'>
        <div></div><span>net worth</span>
        <span className="text-code">0.00</span>
      </div>
    </div>
    <div className='row'>
      <TableTop account={account} table='income' />
      <TableTop account={account} table='expense' />
      <TableTop account={account} table='obligation' />
    </div>
  </main>)
}

function Timeline(props) {
  return <div>
    <div>
      <button>year</button>
      <button>q1</button>
      <button>q2</button>
      <button>q3</button>
      <button>q4</button>
    </div>
    <div><canvas></canvas></div>
  </div>
}

function Pizza(props) {
  return <div className='d-grid'>
    <div><canvas></canvas></div>
    <div><canvas></canvas></div>
    <div><canvas></canvas></div>
  </div>
}

function Template(props) {
  return <div className='d-grid'>
    <div id='averaged-flow'>
      <p><span>Average income</span><span>:</span><span></span></p>
      <p><span>Average expense</span><span>:</span><span></span></p>
    </div>
    <table class="sheet-table" id="sheet-monthly-table">
      <thead>
        <tr class="topline"><td colspan="2">MONTHLY EXPENSE</td></tr>
        <tr class="bottomline"><td>Detail</td><td>Amount</td></tr>
        <tr><td>TOTAL</td><td class="text-code" id="sheet-monthly-total">0.00</td></tr>
        <tr><td><input type="text" id="sheet-monthly-new-detail" /></td>
          <td><input type="text" id="sheet-monthly-new-amount" size="2" /></td></tr>
      </thead>
      <tbody></tbody>
    </table>
    <table class="sheet-table" id="sheet-yearly-table">
      <thead>
        <tr class="topline"><td colspan="2">YEARLY EXPENSE</td></tr>
        <tr class="bottomline"><td>Detail</td><td>Amount</td></tr>
        <tr><td>TOTAL</td><td class="text-code" id="sheet-yearly-total">0.00</td></tr>
        <tr><td><input type="text" id="sheet-yearly-new-detail" /></td>
          <td><input type="text" id="sheet-yearly-new-amount" size="2" /></td></tr>
      </thead>
      <tbody></tbody>
    </table>
    <div>{/* Spacer */}</div>
    <div id="sheet-monthly-add">
      <button>Copy to below</button>
      <input type="text" placeholder="month" size="2" />
    </div>
    <div id="sheet-yearly-add">
      <button>Copy to below</button>
      <input type="text" placeholder="month" size="2" />
    </div>
  </div>
}

function Sheet(props) {
  return <div className='d-grid'>
    <TableTop table='income' />
    <TableTop table='expense' />
    <TableTop table='obligation' />
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((month) =>
      <MonthTable />
    )}
  </div>
}

function TableTop({ account, table }) {
  const ll = <table>
    <tr className="topline"><td colspan="3">INCOME</td></tr>
    <tr className="bottomline"><td>Date</td><td>Detail</td><td>Amount</td></tr>
    <tr><td><button class="round-button-small" id="sheet-add-income">&nbsp;&plus;&nbsp;</button></td>
      <td>TOTAL</td><td class="text-code" id="sheet-income-total">0.00</td></tr>
    <tr><td><input type="text" id="sheet-new-income-date" size="1" /></td>
      <td><input type="text" id="sheet-new-income-detail" /></td>
      <td><input type="text" id="sheet-new-income-amount" size="1" /></td></tr>
  </table>

  return <div className='col p-2 mx-2 shadow-sm bg-white'>
    <div className='d-flex justify-content-between'>
      <span>{table.toUpperCase()}</span><span>0.00</span>
    </div>
    <div className='d-flex justify-content-between'>
      <span>Date</span><span>Detail</span><span>Amount</span>
    </div>
    <div></div>
  </div>
}

function MonthTable(props) {
  return <React.Fragment>
    <table></table>
  </React.Fragment>
}

function AccountDatabase(name, year) {
  this.name = name;
  this.year = year;
  this.version = VERSION;
  this.template = [];
  this.transactions = [];
  this.currency = "";
  this.colorTheme = "deep-purple";

  this.INCOME = "INCOME";
  this.MONTHLY = "MONTHLY";
  this.YEARLY = "YEARLY";

  this.TYPE_INCOME = "income";
  this.TYPE_EXPENSE = "expense";
  this.TYPE_OBLIGATION = "obligation";

  this.TYPES = [this.TYPE_INCOME, this.TYPE_EXPENSE, this.TYPE_OBLIGATION];

  this.addTemplate = function (trxType, name, amount) {
    this.template.push({ trxType: trxType, name: name, amount: amount });
  };

  this.deleteTemplate = function (name) {
    this.template = this.template.filter(
      function (a) { return a.name !== name; });
  };

  this.addTransaction = function (dateInput, name, type, amount) {
    // Get the highest id in the database, then the newly added trx 
    // would plus one that id.
    let frontid;
    if (this.transactions.length == 0) {
      frontid = 0;
    } else {
      frontid = this.transactions.map(a => a.id).reduce((a, b) => Math.max(a, b));
    }

    let date = new Date(dateInput);
    if (date.toString() === "Invalid Date") {
      alert("Invalid Date Format");
      return console.log(dateInput);
    }

    let trx = {
      id: (frontid + 1),
      date: date.setFullYear(this.year),
      name: name,
      type: type,
      amount: amount
    };

    // insertion sort by date
    let ix = this.transactions.findIndex((t) => trx.date > t.date);
    if (ix === -1) this.transactions.push(trx)
    else this.transactions.splice(ix, 0, trx);
  };

  this.getTypeForMonth = function (type, month) {
    return this.transactions.filter(function (a) {
      let d = new Date(a.date);
      return d.getMonth() === month && a.type === type;
    });
  };

  this.isThisMonthTrx = function (month) {
    return this.transactions.filter(function (a) {
      return new Date(a.date).getMonth() === month;
    }).length;
  };

  this.recordedMonths = function () {
    let months = this.transactions.map(t => (new Date(t.date).getMonth()));
    return months.filter((t, ix) => months.indexOf(t) == ix);
  }

  this.deleteTrx = function (id) {
    this.transactions = this.transactions.filter(function (a) { return a.id !== id; });
  };

  this.getDateString = function (trx) {
    let d = new Date(trx.date);
    return d.toLocaleDateString()
      .split(/[-./]/g)
      .filter((a) => a < 32)
      .join(d.toLocaleDateString().match(/[-./]/g)[0]);
  };

  this.calculateWorthByDay = function () {
    let wbd = Array(365).fill([0, 0, 0, 0]);
    let dateIter = new Date();
    dateIter.setFullYear(this.year, 0, 1);
    let trxIter = Array.from(this.transactions).reverse();
    //console.log(trxIter.length);
    wbd.forEach(function (curr, ix, arr) {
      //console.log(ix + " : " + dateIter.toLocaleDateString());

      let grossworth = 0;
      let networth = 0;
      while (trxIter.length > 0) {
        //console.log(trxIter[0]);
        let d = new Date(trxIter[0].date);
        if (d.toDateString() === dateIter.toDateString()) {
          let trx = trxIter.shift();
          if (trx.type === "expense") {
            grossworth -= Number(trx.amount);
            networth -= Number(trx.amount);
          } else if (trx.type === "income") {
            grossworth += Number(trx.amount);
            networth += Number(trx.amount);
          } else if (trx.type === "obligation") {
            networth += Number(trx.amount);
          }
        } else break;
      }

      arr[ix] = [
        grossworth,
        networth,
        dateIter.getMonth(),
        dateIter.toLocaleDateString()];

      if (ix !== 0) {
        arr[ix][0] += arr[ix - 1][0];
        arr[ix][1] += arr[ix - 1][1];
      }
      dateIter.setDate(dateIter.getDate() + 1);
    });

    return wbd;
  };
}

function accountDatabaseFromFile(o) {
  if (typeof o.version == 'undefined' || o.version < VERSION)
    return legacyImport(o);

  // version 3.0
  let accountDB = new AccountDatabase(o.name, o.year);
  if (typeof (o.currency) !== 'undefined') accountDB.currency = o.currency;
  if (typeof (o.colorTheme) !== 'undefined') accountDB.colorTheme = o.colorTheme;

  if (o.template) o.template.forEach(function (curr) {
    accountDB.addTemplate(curr.trxType, curr.name, curr.amount);
  });

  if (o.transactions) o.transactions.forEach(function (curr) {
    accountDB.addTransaction(
      curr.date,
      curr.name,
      curr.type,
      curr.amount);
  });
  return accountDB;
}

function legacyImport(o) {
  if (o.version === 2.0)
    return legacyImportTwo(o);

  return legacyImportOne(o);
}

function legacyImportTwo(o) {
  let accountDB = new AccountDatabase(o.name, o.year);
  if (typeof (o.currency) !== 'undefined') accountDB.currency = o.currency;
  if (typeof (o.colorTheme) !== 'undefined') accountDB.colorTheme = o.colorTheme;

  o.template_monthly.forEach(function (curr) {
    accountDB.addTemplate(accountDB.MONTHLY, curr.name, curr.amount);
  });

  o.template_yearly.forEach(function (curr) {
    accountDB.addTemplate(accountDB.YEARLY, curr.name, curr.amount);
  });

  o.transactions.forEach(function (curr) {
    accountDB.addTransaction(
      curr.date,
      curr.name,
      curr.type,
      curr.amount);
  });
  return accountDB;
}

function legacyImportOne(o) {
  // version 1.0
  let accountDB = new AccountDatabase(o.name, o.year);
  if (typeof (o.currency) !== 'undefined') accountDB.currency = o.currency;
  if (typeof (o.colorTheme) !== 'undefined') accountDB.colorTheme = o.colorTheme;

  o.template_monthly.forEach(function (curr) {
    accountDB.addTemplate(accountDB.MONTHLY, curr.name, curr.amount);
  });

  o.template_yearly.forEach(function (curr) {
    accountDB.addTemplate(accountDB.YEARLY, curr.name, curr.amount);
  });

  o.transactions.forEach(function (curr) {
    accountDB.addTransaction(
      curr.date * 1000,
      curr.name,
      curr.type,
      curr.amount);
  });
  return accountDB;
}
