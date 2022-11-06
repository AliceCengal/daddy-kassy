import Navbar from "./header.js";
import Cussy from "./lib.js";

var h = preact.h;

const React = {
  ...preact,
  ...preactHooks
};

const TODAY = new Date();
const ENTER_KEY = 13;
const FILE_PREFIX = "account-"
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

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

  const [state, dispatch] = React.useReducer(Cussy.reducer, null, Cussy.init);
  console.log(state);
  //console.log(Cussy.getDailyWorth(state.transactions, state.year))

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

const loadStyle = {
  listItem: {
    style: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingLeft: "1rem",
      border: "1px solid grey",
      borderRadius: "4px",
    }
  },
  deleteBtn: {
    class: "btn btn-danger"
  },
  takeBtn: {
    class: "btn btn-success"
  }
}

function LoadPage() {
  const { state, dispatch } = React.useContext(AppCtx);
  const [tempAccount, setTempAccount] = React.useState(null);
  const [lcState, setLcState] = React.useState(localStorage.length)

  const storedAccount = React.useMemo(() => {
    return Object.keys(localStorage)
      .filter(k => k.startsWith(FILE_PREFIX))
      .map(k => [k, localStorage.getItem(k)])
  }, [localStorage.length])

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

  function deleteStored(e) {
    localStorage.removeItem(
      e.currentTarget.dataset.account
    )
    setLcState(l => l - 1)
  }

  function loadStored(e) {
    const accountStr = localStorage.getItem(
      e.currentTarget.dataset.account
    )
    let temp;
    try {
      temp = JSON.parse(accountStr)
    } catch (error) {
      alert("Could not parse stored data. Deleting...");
      localStorage.removeItem(
        e.currentTarget.dataset.account
      )
      setLcState(l => l - 1)
    }

    if (temp) {
      Cussy.actionsFromFile(temp).forEach(dispatch);
      window.location.hash = 'spreadsheet';
    }
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
          class: "btn btn-success",
          onClick: chooseAccount
        }, "LOAD ", tempAccount.name, ", ", tempAccount.year));

  const LoadFromStorage =
    h(Card, { class: "p-3" },
      h("h3", null, "Load from browser storage"),
      storedAccount.length > 0 ?
        storedAccount.map(
          ([k, v]) =>
            h("div", loadStyle.listItem,
              k.slice(FILE_PREFIX.length),
              h("div", null,
                h("button", {
                  ...loadStyle.takeBtn,
                  onClick: loadStored,
                  "data-account": k,
                }, "OK"),
                h("button", {
                  ...loadStyle.deleteBtn,
                  onClick: deleteStored,
                  "data-account": k,
                }, "KO")))) :

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
  const { state, dispatch } = React.useContext(AppCtx);
  const [danger, setDanger] = React.useState(
    localStorage.getItem('danger') || ''
  );

  function downloadAccount() {
    download(
      JSON.stringify(state),
      `${FILE_PREFIX}${state.name}-${state.year}`,
    );
  }

  function saveAccount() {
    localStorage.setItem('danger', 'danger');
    localStorage.setItem(
      `${FILE_PREFIX}${state.name}-${state.year}`,
      JSON.stringify(state));
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
        h("button", { class: "btn btn-success", onClick: downloadAccount },
          "DOWNLOAD")),
      danger ?
        h("div", null,
          h("h2", { class: "w3-text-theme" }, "Save in browser storage"),
          h("p", null, "Only do this if this page is open on your personal device."),
          h("p", null,
            "Do not click the button below if you are using a public computer"),
          h("button", { class: "btn btn-warning", onClick: saveAccount }, "SAVE"),
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
  sheetPanel: {
    class: "row row-cols-3 g-3",
    style: {
      maxWidth: "80rem", minWidth: "60rem",
      overflowX: "auto", margin: "auto"
    }
  },
  titleBox: { class: "d-flex justify-content-between align-items-center p-3" },
  title: { class: "w3-text-theme d-inline-block m-0 overflow-hidden" },
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
    class: "btn btn-danger delete-btn"
  }
}

function SpreadsheetPage() {
  const { state, dispatch } = React.useContext(AppCtx);
  const [openGadget, setOpenGadget] = React.useState('');

  function handleGadget(e) {
    const t = e.currentTarget.innerText
    setOpenGadget(g => g == t ? "" : t)
  }

  const TitleBox =
    h(Card, SheetStyle.titleBox,
      h("h4", SheetStyle.title, `${state.name}\xA0${state.year}`),
      h("div", null,
        h("div", null, "gadgets"),
        h("div", SheetStyle.gadgetMenu,
          h("button", {
            ...SheetStyle.gadgetButton,
            onClick: handleGadget
          }, "timeline"),
          h("button", {
            ...SheetStyle.gadgetButton,
            onClick: handleGadget
          }, "proportion"),
          h("button", {
            ...SheetStyle.gadgetButton,
            onClick: handleGadget
          }, "template"))));

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
        h("div", { class: "col-6 col-md-4" }, NetWorthBox)),

      h("div", SheetStyle.sheetPanel,

        openGadget == "timeline" ?
          h("div", { class: "col-12" },
            h(Timeline)) :
          openGadget == "proportion" ?
            h(Pizza) :
            openGadget == "template" ?
              h(Template) : null,

        h("div", { class: "col" },
          h(TableTop, { table: "income" })),
        h("div", { class: "col" },
          h(TableTop, { table: "expense" })),
        h("div", { class: "col" },
          h(TableTop, { table: "obligation" })),

        [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(month =>
          h(MonthTable, { "month": month })
        ))));
}

const timelineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          return context.dataset.label + ': ' + context.formattedValue
        }
      }
    }
  }
}

function threeDaySmoother(prev, curr, ix) {
  if (ix % 3 == 0) {
    prev.unshift(curr);
    return prev;
  } if (ix % 3 == 1) {
    prev[0][0] = (prev[0][0] + curr[0]) / 2;
    prev[0][1] = (prev[0][1] + curr[1]) / 2;
    return prev;
  } if (ix % 3 == 2) {
    prev[0][0] = (prev[0][0] * 2 + curr[0]) / 3;
    prev[0][1] = (prev[0][1] * 2 + curr[1]) / 3;
    return prev;
  }
}

const transduce = () => [
  (cumm, curr) => {
    cumm[0].push(curr[0])
    cumm[1].push(curr[1])
    cumm[2].push(curr[2])
    return cumm
  }, [[], [], []]
]

const Q1 = (date) => date.getMonth() > -1 && date.getMonth() < 3
const Q2 = (date) => date.getMonth() > 2 && date.getMonth() < 6
const Q3 = (date) => date.getMonth() > 5 && date.getMonth() < 9
const Q4 = (date) => date.getMonth() > 8 && date.getMonth() < 12

function Timeline() {
  const { state, dispatch } = React.useContext(AppCtx);
  const [mode, setMode] = React.useState("year")
  const canvasRef = React.useRef(null);

  const data = React.useMemo(() => {
    const [grossworths, networths, dates] = (
      mode == "q1" ?
        Cussy.getDailyWorth(state.transactions, state.year)
          .filter(a => Q1(a[2])) :
        mode == "q2" ?
          Cussy.getDailyWorth(state.transactions, state.year)
            .filter(a => Q2(a[2])) :
          mode == "q3" ?
            Cussy.getDailyWorth(state.transactions, state.year)
              .filter(a => Q3(a[2])) :
            mode == "q4" ?
              Cussy.getDailyWorth(state.transactions, state.year)
                .filter(a => Q4(a[2])) :
              Cussy.getDailyWorth(state.transactions, state.year)
                .reduce(threeDaySmoother, [])
                .reverse()
    ).reduce(...transduce())

    return (
      {
        labels: dates.map(d => d.toLocaleDateString()),
        datasets: [{
          label: "Gross",
          data: grossworths,
          fill: false,
          borderColor: "rgba(0,0,200,0.4)",
          backgroundColor: dates.map((z, ix) =>
            `hsl(${(360 + 180 - ix * 360 / dates.length) % 360}, 100%, 50%)`
          )
        }, {
          label: "Net",
          data: networths,
          fill: false,
          borderColor: "rgba(200,0,0,0.4)",
          backgroundColor: dates.map((z, ix) =>
            `hsl(${(360 + 180 - ix * 360 / dates.length) % 360}, 100%, 50%)`
          )
        }]
      }
    )
  }, [
    state.transactions.length,
    Cussy.netWorth(state),
    mode
  ])

  React.useEffect(() => {
    const chartRef = new Chart(
      canvasRef.current,
      {
        type: "line",
        data,
        options: timelineOptions
      }
    )

    return () => {
      chartRef.destroy()
    }
  }, [
    state.transactions.length,
    Cussy.netWorth(state),
    mode
  ])

  return (
    h("div", { class: "d-flex flex-column align-items-center" },
      h(TimelineSelector, { mode: mode, setMode: setMode }),
      h("div", null, h("canvas", { ref: canvasRef }))));
}

function TimelineSelector({ mode, setMode }) {

  function handleSet(e) {
    setMode(e.target.innerText)
  }

  return (
    h("div", { class: "btn-group" },
      h("button", {
        class: "btn btn-secondary",
        disabled: mode == "year",
        onClick: handleSet
      }, "year"),
      h("button", {
        class: "btn btn-secondary",
        disabled: mode == "q1",
        onClick: handleSet
      }, "q1"),
      h("button", {
        class: "btn btn-secondary",
        disabled: mode == "q2",
        onClick: handleSet
      }, "q2"),
      h("button", {
        class: "btn btn-secondary",
        disabled: mode == "q3",
        onClick: handleSet
      }, "q3"),
      h("button", {
        class: "btn btn-secondary",
        disabled: mode == "q4",
        onClick: handleSet
      }, "q4"))
  )
}

const proportionReducer = () => [
  (cumm, curr) => {
    const { table, name, amount } = curr;
    if (amount == 0) return curr;
    const groupName = name.split(/\s*-\s*/, 1)[0]

    const pizza = cumm[Cussy.tableIx(table)];

    pizza.set(groupName,
      (pizza.get(groupName) || 0) + Number(amount)
    )
    return cumm
  }, [new Map(), new Map(), new Map()]
]

const proportionOption = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  scales: {
    x: {
      ticks: {
        display: false
      },
      stacked: true
    },
    y: {
      stacked: true
    }
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          return context.formattedValue
        }
      }
    }
  }
}

function Pizza() {
  const { state, dispatch } = React.useContext(AppCtx);
  const canvasRefs = [
    React.useRef(null), React.useRef(null), React.useRef(null)
  ]

  const data = React.useMemo(() => {
    const pizzas = state.transactions.reduce(
      ...proportionReducer()
    )

    return pizzas.map((p, pix) => {
      const p2 = Array.from(p)
        .sort((a, b) => b[1] - a[1])
        .filter(a => a[1] > 1 || a[1] < -1);
      const magn = p2[0][1] - p2[p2.length - 1][1];

      return {
        labels: p2.map(a => a[0]),
        datasets: [
          {
            data: p2.map(a => a[1]),
            backgroundColor: p2.map((z, ix) =>
              `hsl(${(pix * 240 + 120) % 360}, ${100 * Math.abs(
                (z[1] - p2[p2.length - 1][1]) / magn
              )}%, 50%)`
            )
          }
        ]
      }
    })

  }, [
    state.transactions.length,
    Cussy.netWorth(state),
  ])

  React.useEffect(() => {
    const chartRefs = data.map((d, ix) =>
      new Chart(
        canvasRefs[ix].current,
        {
          type: "bar",
          data: d,
          options: proportionOption
        }
      ))

    return () => {
      chartRefs.forEach(ref => ref.destroy())
    }
  }, [
    state.transactions.length,
    Cussy.netWorth(state),
  ])

  return [
    h("div", { class: "col" },
      h("div", null,
        h("canvas", { ref: canvasRefs[0] }))),
    h("div", { class: "col" },
      h("div", null,
        h("canvas", { ref: canvasRefs[1] }))),
    h("div", { class: "col" },
      h("div", null,
        h("canvas", { ref: canvasRefs[2] }))),
  ]
}

function Template() {
  return [
    h("div", { class: "col" },
      h(TemplateTable, { table: "income" })),
    h("div", { class: "col" },
      h(TemplateTable, { table: "expense" })),
    h("div", { class: "col" },
      h(TemplateTable, { table: "obligation" }))
  ]
}

const headings = ["monthly income", "monthly expense", "yearly expense"]

function TemplateTable({ table }) {
  const { state, dispatch } = React.useContext(AppCtx);
  const nameRef = React.useRef(null);
  const amountRef = React.useRef(null);
  const index = Cussy.tableIx(table);

  const entries = React.useMemo(() => (
    state.template.filter(t => t.table === table)
  ), [state.totalsTemplate[index], state.template.length])

  function handleEdit({ table, name, amount }) {
    dispatch({
      type: "removeTemplate",
      name: name
    })
    nameRef.current.innerText = name;
    amountRef.current.innerText = amount;
  }

  function addEntry(e) {
    if (e.which === ENTER_KEY) {
      e.preventDefault()
      dispatch({
        type: "addTemplate",
        table: table,
        name: nameRef.current.innerText,
        amount: Number(amountRef.current.innerText)
      })
      nameRef.current.innerHtml = "";
      amountRef.current.innerText = "";
    }
  }

  function moveEntries(e) {
    const m = MONTHS.findIndex(a => a == e.target.innerText)
    dispatch({
      type: "addManyTrx",
      many: entries.map(e => ({
        ...e,
        dateInput: new Date(state.year, m, 1),
        amount: (index == 2 ? e.amount / 12 : e.amount)
      }))
    })
  }

  return (
    h(Card, { class: "sheet-table-2 p-2" },
      h("span", null, headings[index]),
      h("div", null,
        h("div", {
          class: "btn btn-outline-success text-nowrap"
        }, "Add to >"),
        h("div", SheetStyle.gadgetMenu,
          Array(12).fill(1).map((i, ix) => (
            h("button", {
              onClick: moveEntries,
              ...SheetStyle.gadgetButton
            }, MONTHS[ix])
          )))),

      h("span", null, "Detail"),
      h("span", null, "Amount"),

      h("div", { ref: nameRef, onKeyDown: addEntry, ...SheetStyle.fakeInput }),
      h("div", { ref: amountRef, onKeyDown: addEntry, ...SheetStyle.fakeInput }),

      h("span", { class: "totals-row" }, "TOTAL"),
      h("span", { class: "text-code" }, state.totalsTemplate[index].toFixed(2)),

      entries.flatMap(trx => h(TemplateRow, { template: trx, toEdit: handleEdit })))
  )
}

function TemplateRow({ template, toEdit }) {

  function handleEdit() {
    toEdit(template)
  }

  return [
    h("span", { ondblclick: handleEdit }, template.name),
    h("span", { class: "text-code", ondblclick: handleEdit }, template.amount.toFixed(2))
  ]
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
        name: nameRef.current.innerText.slice(0, -6).trim(),
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
