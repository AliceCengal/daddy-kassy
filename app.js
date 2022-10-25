import { AboutPage, HelpPage } from "./static.js";

var h = preact.h;

const React = {
  ...preact,
  ...preactHooks
};

const TODAY = new Date();
const VERSION = 4.0;
const ENTER_KEY = 13;
const SECTIONS = [
  'Spreadsheet', 'New', 'Load', 'Save', 'Help', 'About'
];

const dateFmt = TODAY.toLocaleDateString()
  .split(/[-./]/g)
  .filter(a => a < 32) // remove year, keep date and month
  .join(TODAY.toLocaleDateString().match(/[-./]/g)[0]);

const AppCtx = React.createContext(null);

export default function App() {
  const [currentPage, setPage] = React.useState(
    window.location.hash.slice(1) || 'about');

  const [state, dispatch] = React.useReducer(cussyReducer, null, cussyInit);
  console.log(state);
  React.useEffect(() => {
    if (state.alertMessage) {
      alert(state.alertMessage);
      dispatch({ type: 'clearAlert' });
    }
  }, [state.alertMessage]);

  React.useEffect(() => {
    swapColorTheme(state.colorTheme);
  }, [state.colorTheme]);

  React.useEffect(() => {
    window.addEventListener("hashchange", handleHashChange);
  }, []);

  function handleHashChange(e) {
    setPage(window.location.hash.slice(1));
  }

  return h(AppCtx.Provider, { value: { state, dispatch } },
    h(Navbar),
    currentPage === 'about' ? h(AboutPage) : null,
    currentPage === 'help' ? h(HelpPage) : null,
    currentPage === 'load' ? h(LoadPage) : null,
    currentPage === 'save' ? h(DownloadPage) : null,
    currentPage === 'new' ? h(NewPage) : null,
    currentPage === 'spreadsheet' ? h(SpreadsheetPage) : null);
}

function NavbarLink({ label }) {
  const hash = window.location.hash.slice(1) || 'about';

  return (
    h("button", {
      disabled: hash === label.toLowerCase(),
      class: "btn btn-light w3-text-theme",
      onClick: () => window.location.hash = label.toLowerCase()
    }, label)
  )
}

const copyright = [
  "site design and logo",
  h("br", null),
  "\xA9 Athran Zuhail 2022 all\xA0rights\xA0reserved"
]

function Navbar(props) {
  const [drawer, openDrawer] = React.useState(false);

  const LinkBar = h("nav", {
    class: "btn-group"
  }, SECTIONS.map(s => h(NavbarLink, {
    label: s
  })));

  return [
    h("header", { class: "w3-theme-l1 p-2 shadow d-none d-md-flex" },
      h("div", { class: "h1 m-0" }, "Daddy\xA0Cussy"),
      LinkBar,
      h("div", { class: "copyright" }, ...copyright)),
    h("header", { class: "w3-theme-l1 p-2 shadow d-flex d-md-none" },
      h("span", { class: "h2 m-0" }, "Daddy Cussy"),
      h("div", { class: "hamburger d-inline-block" },
        h("div", null), h("div", null), h("div", null)))
  ];
}

function LoadPage() {
  const { state, dispatch } = React.useContext(AppCtx);
  const [tempAccount, setTempAccount] = React.useState(null);
  const storedAccount = [];
  /* 
  for (var i = 0; i < localStorage.length; i++) {
    if (localStorage.key(i).startsWith('account-'))
      storedAccount.push(localStorage.key(i));
  }
  */
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
    };
    fr.readAsText(e.target.files[0]);
  }

  function chooseAccount(e) {
    actionsFromFile(tempAccount).forEach(dispatch);
    window.location.hash = 'spreadsheet';
  }

  const LoadFromFile =
    h(Card, { class: "p-3" },
      h("h3", null, "Load from file"),
      h("p", null, "It should be a ",
        h("span", { class: "text-code" }, ".json"), " file:"),
      h("input", {
        type: "file",
        accept: ".json",
        class: "form-control mb-3",
        onChange: choosenFile
      }),
      tempAccount === null ? null :
        h("p", { class: "bg-light px-3" },
          tempAccount.name, ", ", tempAccount.year, " -",
          tempAccount.transactions.length, " transactions"),
      h("p", null, `Make sure you have saved/downloaded any active spreadsheet, 
        because loading a new one will overwrite the current one.`),
      tempAccount === null ?
        h("button", {
          class: "btn btn-secondary",
          disabled: true
        }, "LOAD") :
        h("button", {
          class: "btn btn-primary",
          onClick: chooseAccount
        }, "LOAD ", tempAccount.name, ", ", tempAccount.year));

  const LoadFromStorage =
    h(Card, { class: "p-3" },
      h("h3", null, "Load from browser storage"),
      localStorage.length > 1 ?
        storedAccount.map(aa => h("p", null, "aa")) :
        h("p", null, "No items in local storage"));

  return (
    h("main", { class: "reading-box" },
      h("h1", { class: "w3-text-theme text-center" },
        "Load a previously saved spreadsheet"),
      h("div", { class: "row g-3 my-3" },
        h("div", { class: "col-12 col-md-6" }, LoadFromFile),
        h("div", { class: "col-12 col-md-6" }, LoadFromStorage))));
}

function DownloadPage() {
  const [danger, setDanger] = React.useState(localStorage.getItem('danger') || '');

  function downloadAccount() {
    if (account !== null)
      download(
        JSON.stringify(account),
        account.name + '-' + account.year
      );
    else alert("Create an account first.");
  }

  function saveAccount() {
    if (account !== null) {
      localStorage.setItem('danger', 'danger');
      localStorage.setItem(
        `account-${account.name}-${account.year}`,
        JSON.stringify(account));
    } else alert("Create an account first.");
  }

  return (
    h("main", { class: "reading-box" },
      h("h1", { class: "w3-text-theme" }, "Download the spreadsheet"),
      h("p", null, `The app will download the data you had entered into a file.
        This file is not encrypted or obfuscated in any way, it's just
        structured into JSON. It is not copyright protected. It is your data,
        and you are free to inspect, copy, distribute, or modify it whichever
        way you want.`),
      h("p", null, `However, manual modification may cause that file to be in an
        invalid format, and thus unrecognizable and unusable by this app.`),
      h("p", null, `Keep this file in a dusty corner of your computer, or upload
        it to a secure file hosting service. The next time you want to use this app 
        again, find that file and `,
        h("a", { href: "#load" }, "Load"), " it back into the app."),
      h("div", { class: "mb-5" },
        h("button", { class: "btn btn-primary", onClick: downloadAccount },
          "DOWNLOAD")),
      danger ?
        h("div", null,
          h("h2", { class: "w3-text-theme" }, "Save in browser storage"),
          h("p", null, "Only do this if this page is open on your personal device."),
          h("p", null,
            "Do not click the button below if you are using a public computer"),
          h("button", { class: "btn btn-danger", onClick: saveAccount }, "SAVE"),
          h("button", { class: "btn btn-link", onClick: () => setDanger('') },
            "Hide")) :
        h("p", { class: "text-secondary", onClick: () => setDanger('danger') },
          "> Dangerous option")));
}

function PopoutTooltip({ children }) {
  return (
    h("div", { class: "col-1" },
      h("div", null, " \uD83D\uDEC8 "),
      h("p", { class: "w3-theme-l1 hovertip hovertip-alpha" }, children)));
}

const THEME_COLORS = [
  'Red', 'Pink', 'Purple', 'Deep Purple', 'Indigo', 'Blue', 'Light Blue', 'Cyan',
  'Teal', 'Green', 'Light Green', 'Lime', 'Khaki', 'Yellow', 'Amber', 'Orange',
  'Deep Orange', 'Blue Grey', 'Brown', 'Grey', 'Dark Grey', 'Black', 'None'
]

function NewPage() {
  const { state, dispatch } = React.useContext(AppCtx);

  function submit(e) {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));

    dispatch({
      type: 'new',
      name: formData.name,
      year: formData.year
    });

    if (formData.startingBalance) {
      const startingDate = new Date();
      startingDate.setFullYear(formData.year, formData.startingMonth - 1, 1);

      dispatch({
        type: 'addTrx',
        dateInput: startingDate.toLocaleDateString(),
        name: 'Starting balance',
        table: 'income',
        amount: Number(formData.startingBalance)
      });
    }
    window.location.hash = 'spreadsheet';
  }

  function sendColorTheme(ct) {
    dispatch({
      type: 'colorTheme',
      colorTheme: ct
    });
  }

  return (
    h("main", { class: "reading-box" },
      h("h1", { class: "w3-text-theme" }, "Create new spreadsheet"),
      h("p", null, `Make sure you have saved/downloaded any active spreadsheet, 
        because creating a new one will overwrite the current one.`),
      h("form", { onSubmit: submit },
        h("div", { class: "row row-cols-3 g-3 align-items-center" },
          h("div", { class: "col-4" }, "Name"),
          h("div", { class: "col-7" },
            h("input", {
              type: "text",
              class: "form-control",
              defaultValue: "You",
              name: "name"
            })),
          h(PopoutTooltip, null,
            "Who or what this account is about. It could be: ", h("br", null),
            "- a person,", h("br", null),
            "- a legal entity (a married couple, a trust),", h("br", null),
            "- an organization (school club, neighbourhood watch),", h("br", null),
            "- an activity (wedding, party),", h("br", null),
            "- a business."),

          h("div", { class: "col-4" }, "Year"),
          h("div", { class: "col-7" },
            h("input", {
              type: "number",
              class: "form-control",
              defaultValue: TODAY.getFullYear(),
              name: "year"
            })),
          h(PopoutTooltip, null, `This spreadsheet will only be valid for one year, 
            from 1 January to 31 December. Start a new spreadsheet at the start of a 
            new calendar year. Non-calendar fiscal year is not supported.`),

          h("div", { class: "col-4" }, "Your date format"),
          h("div", { class: "col-7" },
            h("input", {
              type: "text",
              class: "form-control",
              readonly: true,
              value: dateFmt
            })),
          h(PopoutTooltip, null, `There are many variations in how a date is written
            around the world. Displayed here is how your browser is configured to 
            display and interpret today's date. Note the month and day order, and 
            the separator used. Please use this exact same format when recording 
            your account transactions.`),

          h("div", { class: "col-11 border-top border-3" }),

          h("div", { class: "col-4" }, "Starting balance"),
          h("div", { class: "col-7" },
            h("input", {
              type: "number",
              class: "form-control",
              placeholder: "optional",
              name: "startingBalance"
            })),
          h(PopoutTooltip, null, `The total of your checking account balance(s), 
          also known as your gross worth.`),

          h("div", { class: "col-4" }, "Starting month"),
          h("div", { class: "col-7" },
            h("input", {
              type: "number",
              class: "form-control",
              defaultValue: 1,
              name: "startingMonth",
              min: "1",
              max: "12"
            })),
          h(PopoutTooltip, null, `If you enter any amount in the starting balance 
          field, by default it will be recorded on the date 1/1. Use this field to 
          specify a different starting month.`),

          h("div", { class: "col-4" }, "Currency label"),
          h("div", { class: "col-7" },
            h("input", {
              type: "text",
              class: "form-control",
              placeholder: "optional",
              name: "currency"
            })),
          h(PopoutTooltip, null, `Purely cosmetic. Multi-currency input and 
          conversion is not supported.`),

          h("div", { class: "col-4" }, "Color theme"),
          h("div", { class: "col-7" },
            h("select", {
              name: "colorTheme",
              class: "form-control",
              value: state.colorTheme,
              onChange: e => sendColorTheme(e.target.value)
            }, THEME_COLORS.map(cc =>
              h("option", { value: cc.toLowerCase().replace(' ', '-') }, cc))))),
        h("div", { class: "row justify-content-center my-3" },
          h("div", { class: "col-6" },
            h("input", { hidden: true, name: "version", defaultValue: VERSION }),
            h("input", { type: "submit", class: "btn btn-primary w-100" }))))));
}

function Card(props) {
  return h("div", { class: `bg-white shadow-sm ${props["class"] || ''}` },
    props.children);
}

const SheetStyle = {
  main: { style: { maxWidth: '80rem', margin: 'auto' } },
  titleBox: { class: "d-flex justify-content-between align-items-center p-0" },
  title: { class: "w3-text-theme d-inline-block m-3" },
  worthBox: {
    class: "d-flex flex-row justify-content-between align-items-center p-3"
  },
  gadgetMenu: {
    class: "float-menu d-flex flex-column align-items-stretch"
  },
  gadgetButton: { class: "btn btn-secondary" }
}

function SpreadsheetPage() {
  const { state, dispatch } = React.useContext(AppCtx);
  const [openGadget, setOpenGadget] = React.useState('');

  const TitleBox =
    h(Card, SheetStyle.titleBox,
      h("h4", SheetStyle.title, `${state.name} ${state.year}`),
      h("div", null,
        h("div", null, "gadgets"),
        h("div", SheetStyle.gadgetMenu,
          h("button", SheetStyle.gadgetButton, "timeline"),
          h("button", SheetStyle.gadgetButton, "proportion"),
          h("button", SheetStyle.gadgetButton, "template"))));

  const GrossWorthBox =
    h("div", SheetStyle.worthBox,
      h("div"),
      h("span", null, "gross worth"),
      h("span", { class: "text-code" },
        state.currency, " ", (state.totalsTrx[0] - state.totalsTrx[1]).toFixed(2)));

  const NetWorthBox =
    h("div", SheetStyle.worthBox,
      h("div"),
      h("span", null, "net worth"),
      h("span", { class: "text-code" },
        state.currency, " ",
        (state.totalsTrx[0] - state.totalsTrx[1] + state.totalsTrx[2]).toFixed(2)));

  return (
    h("main", SheetStyle.main,
      h("div", { class: "row row-cols-3 g-3" },
        h("div", { class: "col-12 col-md-4" }, TitleBox),
        h("div", { class: "col-6 col-md-4" }, GrossWorthBox),
        h("div", { class: "col-6 col-md-4" }, NetWorthBox),

        h("div", { class: "btn-group d-md-none col-12" },
          h("button", { class: "btn btn-secondary" }, "INCOME"),
          h("button", { class: "btn btn-secondary" }, "EXPENSE"),
          h("button", { class: "btn btn-secondary" }, "OBLIGATION")),

        h("div", { class: "col-lg-4 col-xs-12" },
          h(TableTop, { table: "income" })),
        h("div", { class: "col-lg-4 col-xs-12" },
          h(TableTop, { table: "expense" })),
        h("div", { class: "col-lg-4 col-xs-12" },
          h(TableTop, { table: "obligation" })),

        [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(month =>
          h(MonthTable, { "month": month })
        ))));
}

function Timeline(props) {
  return (
    h("div", null,
      h("div", null,
        h("button", null, "year"),
        h("button", null, "q1"),
        h("button", null, "q2"),
        h("button", null, "q3"),
        h("button", null, "q4")),
      h("div", null, h("canvas"))));
}

function Pizza(props) {
  return (
    h("div", { class: "d-grid" },
      h("div", null,
        h("canvas")),
      h("div", null,
        h("canvas", null)),
      h("div", null,
        h("canvas"))));
}

function Template(props) {
  return (
    h("div", { class: "d-grid" },
      h("div", { id: "averaged-flow" },
        h("p", null,
          h("span", null, "Average income"),
          h("span", null, ":"),
          h("span", null)),
        h("p", null,
          h("span", null, "Average expense"),
          h("span", null, ":"),
          h("span", null))),
      h("table", { class: "sheet-table", id: "sheet-monthly-table" },
        h("thead", null,
          h("tr", { class: "topline" },
            h("td", { colspan: "2" }, "MONTHLY EXPENSE")),
          h("tr", { class: "bottomline" },
            h("td", null, "Detail"),
            h("td", null, "Amount")),
          h("tr", null,
            h("td", null, "TOTAL"),
            h("td", { class: "text-code", id: "sheet-monthly-total" }, "0.00")),
          h("tr", null,
            h("td", null,
              h("input", { type: "text", id: "sheet-monthly-new-detail" })),
            h("td", null,
              h("input", {
                type: "text",
                id: "sheet-monthly-new-amount",
                size: "2"
              })))),
        h("tbody", null)),
      h("table", { class: "sheet-table", id: "sheet-yearly-table" },
        h("thead", null, h("tr", { class: "topline" },
          h("td", { colspan: "2" }, "YEARLY EXPENSE")),
          h("tr", { class: "bottomline" },
            h("td", null, "Detail"),
            h("td", null, "Amount")),
          h("tr", null,
            h("td", null, "TOTAL"),
            h("td", { class: "text-code", id: "sheet-yearly-total" }, "0.00")),
          h("tr", null,
            h("td", null,
              h("input", {
                type: "text",
                id: "sheet-yearly-new-detail"
              })),
            h("td", null,
              h("input", {
                type: "text",
                id: "sheet-yearly-new-amount",
                size: "2"
              })))),
        h("tbody", null)),
      h("div", null),
      h("div", { id: "sheet-monthly-add" },
        h("button", null, "Copy to below"),
        h("input", {
          type: "text",
          placeholder: "month",
          size: "2"
        })),
      h("div", { id: "sheet-yearly-add" },
        h("button", null, "Copy to below"),
        h("input", {
          type: "text",
          placeholder: "month",
          size: "2"
        }))));
}

function TableTop({ table }) {
  const { state, dispatch } = React.useContext(AppCtx);
  const dateRef = React.useRef(null);
  const nameRef = React.useRef(null);
  const amountRef = React.useRef(null);

  function addTrx(e) {
    if (e.which === ENTER_KEY) {
      dispatch({
        type: 'addTrx',
        table,
        name: nameRef.current.value,
        dateInput: dateRef.current.value,
        amount: Number(amountRef.current.value || 0.0)
      });
    }
  }

  return (
    h(Card, { class: "sheet-table p-2" },
      h("span"),
      h("span", { class: "text-center" }, table.toUpperCase()),
      h("span", { class: "text-code" },
        state.currency, " ", state.totalsTrx[tableIx(table)].toFixed(2)),

      h("span", null, "Date"),
      h("span", { class: "text-center" }, "Detail"),
      h("span", null, "Amount"),

      h("input", { ref: dateRef, onKeyUp: addTrx, size: "1" }),
      h("input", { ref: nameRef, onKeyUp: addTrx }),
      h("input", { ref: amountRef, onKeyUp: addTrx, size: "1" })));
}

const MonthTableStyle = { class: "sheet-table shadow-sm bg-white p-2" }

function MonthTable({ month }) {
  const { state, dispatch } = React.useContext(AppCtx);
  const trxs = getForMonth(state.transactions, month);

  if (trxs[0].length == 0 && trxs[1].length == 0 && trxs[2].length == 0)
    return null;

  return trxs.map(mt =>
    h("div", { class: "col" },
      h("div", MonthTableStyle,
        mt.map(trx => h(React.Fragment, { key: trx.id },
          h("span", null, new Date(trx.date).getDate()),
          h("span", null, trx.name),
          h("span", { class: "text-code" }, trx.amount.toFixed(2)))))));
}

function cussyInit(name, year) {
  return {
    version: VERSION,
    name: name || 'You',
    year: year || 2022,
    currency: '',
    colorTheme: 'deep-purple',
    template: [],
    transactions: [],
    totalsTemplate: [0.0, 0.0, 0.0],
    totalsTrx: [0.0, 0.0, 0.0],
    alertMessage: ''
  };
}

function actionsFromFile(temp) {
  return [
    { type: 'new', name: temp.name, year: temp.year },

    temp.colorTheme ?
      { type: 'colorTheme', colorTheme: temp.colorTheme } : null,

    temp.currency ?
      { type: 'currency', currency: temp.currency } : null,

    {
      type: 'addManyTrx',
      many: temp.transactions.map(({ type, table, name, date, amount }) => (
        {
          table: type.toLowerCase() || table,
          name,
          dateInput: date,
          amount: Number(amount)
        }
      ))
    },

    {
      type: 'addManyTemplate',
      many: temp.template.map(({ trxType, table, name, amount }) => (
        {
          table: trxType.toLowerCase() || table,
          name,
          amount: Number(amount)
        }
      ))
    }
  ].filter(Boolean);
}

const TABLES = ['income', 'expense', 'obligation'];

const TABLE_IX = {
  'income': 0,
  'expense': 1,
  'monthly': 1,
  'obligation': 2,
  'yearly': 2
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

function tableIx(tbl) {
  return TABLE_IX[tbl];
}

function trxReducer(prev, curr) {
  prev[TABLE_IX[curr.table]] += curr.amount;
  return prev;
}

function trxMake(list, year, table, name, dateInput, amount) {
  const id = list.reduce((a, b) => Math.max(a, b.id), 0);

  let date = dateInput ? new Date(dateInput) : new Date();
  if (date.toString() === "Invalid Date") {
    console.log(dateInput);
    return { table: "Invalid Date" };
  }
  date = date.setFullYear(year);

  return {
    id, table, name, date, amount
  };
}

function getForMonth(transactions, month) {
  return transactions.reduce((cumm, curr) => {
    const d = new Date(curr.date).getMonth();
    if (d === month) {
      cumm[TABLE_IX[curr.table]].push(curr);
    }
    return cumm;
  }, [[], [], []]);
}

function cussyReducer(state, { type, ...values }) {
  switch (type) {
    case 'new':
      return cussyInit(values.name, values.year);
    case 'colorTheme':
      return {
        ...state,
        colorTheme: values.colorTheme
      };
    case 'currency':
      return {
        ...state,
        currency: values.currency
      };

    case 'addTrx': {
      const { table, name, dateInput, amount } = values;
      const trxNew = trxMake(
        state.transactions, state.year, table, name, dateInput, amount);

      if (trxNew.table === "Invalid Date") {
        return {
          ...state,
          alertMessage: "Invalid date"
        };
      }

      const updated = [...state.transactions, trxNew];
      const meta = updated.reduce(trxReducer, [0.0, 0.0, 0.0]);
      return {
        ...state,
        transactions: updated,
        totalsTrx: meta
      };
    }
    case 'addManyTrx': {
      const toAdd = values.many.map(
        ({ table, name, dateInput, amount }) =>
          trxMake(state.transactions, state.year, table, name, dateInput, amount));

      toAdd.forEach((trx, ix) => {
        trx.id = trx.id + ix;
      });

      const updated = [...state.transactions, ...toAdd];
      const meta = updated.reduce(trxReducer, [0.0, 0.0, 0.0]);
      return {
        ...state,
        transactions: updated,
        totalsTrx: meta
      };
    }
    case 'removeTrx': {
      const updated = state.transactions.filter(trx => trx.id !== values.id);
      const meta = updated.reduce(trxReducer, [0.0, 0.0, 0.0]);
      return {
        ...state,
        transactions: updated,
        totalsTrx: meta
      };
    }

    case 'addTemplate': {
      const { table, name, amount } = values;
      const updated = [...state.template, { table, name, amount }];
      const meta = updated.reduce(trxReducer, [0.0, 0.0, 0.0]);
      return {
        ...state,
        template: updated,
        totalsTemplate: meta
      };
    }
    case 'addManyTemplate': {
      const normed = values.many.map(
        ({ table, name, amount }) => ({
          table: TABLES[TABLE_IX[table]], name, amount
        })
      );
      const updated = [...state.template, ...normed];
      const meta = updated.reduce(trxReducer, [0.0, 0.0, 0.0]);
      return {
        ...state,
        template: updated,
        totalsTemplate: meta
      };
    }
    case 'removeTemplate': {
      const updated = state.transactions.filter(trx => trx.name !== values.name);
      const meta = updated.reduce(trxReducer, [0.0, 0.0, 0.0]);
      return {
        ...state,
        transactions: updated,
        totalsTrx: meta
      };
    }
    case 'clearAlert':
      return {
        ...state,
        alertMessage: ''
      };
  }
  throw Error('Unknown action: ' + type);
}

// helper function
function swapColorTheme(colorTheme) {
  const style = document.getElementById("w3-theme-color");
  style.href = (colorTheme === 'none' ? '' :
    `https://www.w3schools.com/lib/w3-theme-${colorTheme}.css`
  )
}

// Function to download data to a file
// https://stackoverflow.com/questions/13405129/javascript-create-and-save-file
// use type : 'application/json'
function download(data, filename, type = 'application/json') {
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
