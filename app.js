import Navbar from "./header.js";
import { cussyInit, cussyReducer, Cussy } from "./lib.js";

var h = preact.h;

const React = {
  ...preact,
  ...preactHooks
};

const TODAY = new Date();
const ENTER_KEY = 13;

const dateFmt = TODAY.toLocaleDateString()
  .split(/[-./]/g)
  .filter(a => a < 32) // remove year, keep date and month
  .join(TODAY.toLocaleDateString().match(/[-./]/g)[0]);

export default function App() {
  const { hash } = window.location
  const [currentPage, setPage] = React.useState(hash.slice(1) || 'about');

  React.useEffect(() => {
    window.addEventListener("hashchange", handleHashChange);
  }, []);

  function handleHashChange(e) {
    setPage(window.location.hash.slice(1));
  }

  return [
    h(Navbar),
    h(Main, { page: currentPage })
  ]
}

const AppCtx = React.createContext(null);

function Main({ page }) {
  const aboutPage = React.useRef(document.getElementById("about-page"))
  const helpPage = React.useRef(document.getElementById("help-page"))

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

  return (
    h(AppCtx.Provider, { value: { state, dispatch } },
      page === 'about' ? h(Static, { page: aboutPage }) : null,
      page === 'help' ? h(Static, { page: helpPage }) : null,
      page === 'load' ? h(LoadPage) : null,
      page === 'save' ? h(DownloadPage) : null,
      page === 'new' ? h(NewPage) : null,
      page === 'spreadsheet' ? h(SpreadsheetPage) : null))
}

function Static({ page }) {
  React.useEffect(() => {
    page.current.style.display = "block";
    return () => {
      page.current.style.display = "none"
    }
  }, [])
  return null
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
    Cussy.actionsFromFile(tempAccount).forEach(dispatch);
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

    if (formData.currency) {
      dispatch({
        type: "currency",
        currency: formData.currency,
      })
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
            h("input", { hidden: true, name: "version", defaultValue: state.version }),
            h("input", { type: "submit", class: "btn btn-primary w-100" }))))));
}

function Card(props) {
  return h("div", { class: `bg-white shadow-sm ${props["class"] || ''}` },
    props.children);
}

const SheetStyle = {
  submain: {
    class: "row row-cols-3 g-3",
    style: { maxWidth: '80rem', margin: 'auto' }
  },
  titleBox: { class: "d-flex justify-content-between align-items-center p-0" },
  title: { class: "w3-text-theme d-inline-block m-3" },
  worthBox: {
    class: "d-flex flex-row justify-content-between align-items-center p-3"
  },
  gadgetMenu: {
    class: "float-menu d-flex flex-column align-items-stretch"
  },
  gadgetButton: { class: "btn btn-secondary" },
  fakeInput: {
    class: "form-control",
    contenteditable: true,
  },
  trxDeleteBtn: {
    class: "btn btn-warning delete-btn"
  }
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
    h("main", null,
      h("div", SheetStyle.submain,
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
      e.preventDefault();
      dispatch({
        type: 'addTrx',
        table,
        name: nameRef.current.innerText,
        dateInput: dateRef.current.innerText,
        amount: Number(amountRef.current.innerText || 0.0)
      });
    }
  }

  return (
    h(Card, { class: "sheet-table carrot p-2" },
      h("span", { class: "text-center capitalize" }, table),
      h("span", { class: "text-code table-total" },
        state.currency, " ", state.totalsTrx[Cussy.tableIx(table)].toFixed(2)),

      h("span", null, "Date"),
      h("span", { class: "text-center" }, "Detail"),
      h("span", null, "Amount"),

      h("div", { ref: dateRef, onKeyDown: addTrx, ...SheetStyle.fakeInput }),
      h("div", { ref: nameRef, onKeyDown: addTrx, ...SheetStyle.fakeInput }),
      h("div", { ref: amountRef, onKeyDown: addTrx, ...SheetStyle.fakeInput })));
}

const MonthTableStyle = { class: "sheet-table shadow-sm bg-white p-2" }

function MonthTable({ month }) {
  const { state, dispatch } = React.useContext(AppCtx);
  const trxs = Cussy.getForMonth(state.transactions, month);

  if (trxs[0].length == 0 && trxs[1].length == 0 && trxs[2].length == 0)
    return null;

  return trxs.map((mt, ix) =>
    h("div", { class: "col", key: ix },
      h("div", {
        ...MonthTableStyle,
        style: { visibility: mt.length == 0 ? "hidden" : "visible" }
      },
        mt.map(trx => h(TrxRow, { trx: trx, key: trx.id })))));
}

function TrxRow({ trx }) {
  const { state, dispatch } = React.useContext(AppCtx);
  const [editing, setEditing] = React.useState(false);
  const dateRef = React.useRef(null);
  const nameRef = React.useRef(null);
  const amountRef = React.useRef(null);

  function submitTrx(e) {
    if (e.which === ENTER_KEY) {
      e.preventDefault();
      dispatch({
        type: "removeTrx",
        id: trx.id
      })
      dispatch({
        type: 'addTrx',
        table: trx.table,
        name: nameRef.current.innerText,
        dateInput: dateRef.current.innerText,
        amount: Number(amountRef.current.innerText || 0.0)
      });
      setEditing(false)
    }
  }

  function deleteTrx(e) {
    dispatch({
      type: "removeTrx",
      id: trx.id
    })
  }

  function startEdit(e) {
    e.preventDefault()
    setEditing(true)
  }

  if (editing) return [
    h("div", {
      ...SheetStyle.fakeInput,
      ref: dateRef,
      onKeyDown: submitTrx
    }, Cussy.displayDate(trx)),
    h("div", {
      ...SheetStyle.fakeInput,
      ref: nameRef,
      onKeyDown: submitTrx
    }, trx.name,
      h("button", {
        ...SheetStyle.trxDeleteBtn,
        onClick: deleteTrx
      }, "DELETE")),
    h("div", {
      ...SheetStyle.fakeInput,
      ref: amountRef,
      onKeyDown: submitTrx
    }, trx.amount.toFixed(2))

  ]; else return [
    h("span", { ondblclick: startEdit }, Cussy.displayDate(trx)),
    h("span", { ondblclick: startEdit }, trx.name),
    h("span", {
      class: "text-code",
      ondblclick: startEdit
    }, trx.amount.toFixed(2))
  ]
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

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
