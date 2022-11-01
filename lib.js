
const VERSION = 4.0;

const TABLES = ['income', 'expense', 'obligation'];

const TABLE_IX = {
  'income': 0,
  'expense': 1,
  'monthly': 1,
  'obligation': 2,
  'yearly': 2
};

function init(name, year) {
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
          table: type?.toLowerCase() || table,
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
          table: trxType?.toLowerCase() || table,
          name,
          amount: Number(amount)
        }
      ))
    }
  ].filter(Boolean);
}

function tableIx(tbl) {
  return TABLE_IX[tbl];
}

const trxReducer = () => [
  (prev, curr) => {
    prev[TABLE_IX[curr.table]] += curr.amount;
    return prev;
  },
  [0.0, 0.0, 0.0]
]

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

function displayDate(trx) {
  const dd = new Date(trx.date).toLocaleDateString()
  const div = dd.match(/[-./]/g)[0]
  return (
    dd.split(div)
      .filter((a) => a < 32)
      .join(div)
  )
}

function getDailyWorth(transactions, year) {
  if (transactions.length == 0) {
    return Array(365).fill(0)
      .map((a, ix) => [0, 0, new Date(year, 0, 1)])
  }

  const a = transactions.reduceRight(
    dailyWorthReducer[0],
    [[0, 0, new Date(year, 0, 1)]]
  )

  const pad = Array(365 - a.length).fill(0)
    .map((z, ix) => [
      a[0][0],
      a[0][1],
      new Date(year, 0, 365 - ix)
    ])

  return [...pad, ...a].reverse()
}

function sameDay(a, b) {
  return a.getMonth() == b.getMonth() &&
    a.getDate() == b.getDate()
}

const dailyWorthReducer = [
  (cumm, trx) => {
    const trxDate = new Date(trx.date);
    const last = cumm[0]

    if (sameDay(trxDate, last[2])) {
      if (trx.table === "income") {
        last[0] += trx.amount;
        last[1] += trx.amount;
      } else if (trx.table === "expense") {
        last[0] -= trx.amount;
        last[1] -= trx.amount;
      } else if (trx.table === "obligation") {
        last[1] += trx.amount;
      }
      return cumm
    }

    const dateDiff = Math.floor(
      (trxDate - last[2]) / (1000 * 3600 * 24)
    )

    const filler = Array(dateDiff).fill(0)
      .map((a, ix) => [
        last[0],
        last[1],
        new Date(
          last[2].getFullYear(),
          last[2].getMonth(),
          last[2].getDate() + dateDiff - ix)])

    if (trx.table === "income") {
      filler[0][0] += trx.amount;
      filler[0][1] += trx.amount;
    } else if (trx.table === "expense") {
      filler[0][0] -= trx.amount;
      filler[0][1] -= trx.amount;
    } else if (trx.table === "obligation") {
      filler[0][1] += trx.amount;
    }

    return [
      ...filler,
      ...cumm
    ]
  },
  [[0, 0, new Date(2022, 0, 1)]]
]

function reducer(state, { type, ...values }) {
  switch (type) {
    case 'new':
      return init(values.name, values.year);
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

      const insertIndex = state.transactions.findIndex(
        (tt) => tt.date < trxNew.date
      )
      const updated = (insertIndex == -1 ?
        [
          ...state.transactions,
          trxNew,
        ] : [
          ...state.transactions.slice(0, insertIndex),
          trxNew,
          ...state.transactions.slice(insertIndex)
        ]
      );

      const meta = updated.reduce(...trxReducer());
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
      const meta = updated.reduce(...trxReducer());
      return {
        ...state,
        transactions: updated.sort((a, b) => b.date - a.date),
        totalsTrx: meta
      };
    }
    case 'removeTrx': {
      const updated = state.transactions.filter(trx => trx.id !== values.id);
      const meta = updated.reduce(...trxReducer());
      return {
        ...state,
        transactions: updated,
        totalsTrx: meta
      };
    }

    case 'addTemplate': {
      const { table, name, amount } = values;
      const updated = [...state.template, { table, name, amount }];
      const meta = updated.reduce(...trxReducer());
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
      const meta = updated.reduce(...trxReducer());
      return {
        ...state,
        template: updated,
        totalsTemplate: meta
      };
    }
    case 'removeTemplate': {
      const updated = state.transactions.filter(trx => trx.name !== values.name);
      const meta = updated.reduce(...trxReducer());
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

const Cussy = {
  init,
  reducer,
  actionsFromFile,
  getForMonth,
  tableIx,
  displayDate,
  getDailyWorth,
}

export default Cussy;
