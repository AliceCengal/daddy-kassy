var h = preact.h;
const TextCode = { className: "text-code" }

export const AboutPage = () =>
  h("main", { className: "reading-box" },
    h("h1", { className: "w3-text-theme" }, "About this app"),
    h("p", null, `This is an app for tracking and analyzing simple personal income,
      expense, and investment. The target audience is an average working adult.`),
    h("p", null, "To start using this application, "),
    h("ul", null,
      h("li", null, "create a ", h("a", { href: "#new" }, "New"),
        " spreadsheet, or "),
      h("li", null, h("a", { href: "#load" }, "Load"),
        " a previously saved spreadsheet. ")),

    h("p", null, `Note that this app does not save any data to any server, so it 
      is very important that you `, h("a", { href: "#save" }, "Save"),
      " your work after you're done, otherwise all of your progress will be lost."),
    h("p", null, "If you need any further ", h("a", { href: "#help" }, "Help"),
      ", feel free to ask any question."))

export const HelpPage = () =>
  h("main", { className: "reading-box justify-this" },
    h("h1", { className: "w3-text-theme" }, "Help for you"),
    h("h4", null, "Q: How do I edit or delete an entry?"),
    h("p", null, `A: DOUBLE-CLICK the row that you want to edit or delete. That row
      will be deleted and its details will be copied to the input row above it. You
      can edit that input row and press ENTER (or CLICK the + button) to resubmit the
      edit, or ignore it for a full delete.`),
    h("h4", null, "Q: What is Income?"),
    h("p", null, `A: Any money that you receive. Salary, bonus, stipend,
      compensation, investment dividend, someone paying back a personal loan, bank 
      account balance carryover at the start of the financial year, ...`),
    h("h4", null, "Q: What is Expense?"),
    h("p", null, `A: Any money that you spend. Buying something, paying fees and 
      penalties, paying taxes, paying loan installments, ...`),
    h("h4", null, "Q: What is Gross Worth?"),
    h("p", null, "A: Gross Worth = Total Income \u2212 Total Expense"),
    h("h4", null, "Q: What is Net Worth?"),
    h("p", null, "A: Net Worth = Gross Worth + Total Obligation"),
    h("h4", null, "Q: What is Obligation?"),
    h("p", null, `A: Deferred expense and income. A positive obligation is when 
      someone/something promises to pay you a specific amount at a later date 
      (deferred income). A negative obligation is when you promise to pay someone/
      something a specific amount at a later date (deferred expense).`),
    h("p", null, `Recording deferred expense/income helps you better understand your 
      financial position at a particular moment. Your goal in this game is to try 
      keep both your gross worth and net worth above zero. Between net worth and 
      gross worth, the lower amount represents your discretionary fund that you can 
      spend on entertainment or luxury. Stop any luxury spending before you dip into 
      negative worth.`),
    h("p", null, h("strong", null, "Example 1:"), ` You have a big yearly payment 
      commitment (motor insurance, college tuition, property tax, club membership)
      of $6000. An easy way to spread out this commitment/obligation is to record
      the amount divided by 12 as a negative obligation on every month. This is an
      example of deferred expense. Even though you haven't made the payment yet, 
      you pretend that you have made fractions of the payment by recording it as 
      a negative obligation.`),
    h("p", null,
      h("span", TextCode, "OBLIGATION | 1-Feb | tuition | -$500"), h("br"),
      h("span", TextCode, "OBLIGATION | 1-Mar | tuition | -$500"), h("br"),
      h("span", TextCode, "OBLIGATION | 1-Apr | tuition | -$500")),
    h("p", null, `This will automatically deduct that amount from your net worth, 
      which signals that you don't have as much discretionary fund as your bank 
      account statement might tell you. At the end of the year, when it's time 
      to pay that commitment, record it as an expense, and also record the same 
      amount as a positive obligation.`),
    h("p", null,
      h("span", TextCode, "EXPENSE    | 31-Dec | tuition | $6000"), h("br"),
      h("span", TextCode, "OBLIGATION | 31-Dec | tuition | $6000")),
    h("p", null, h("strong", null, "Example 2:"), ` You lend $300 to a friend, who
      promises to pay it back in three months. Record it as an expense, and also as 
      a positive obligation by the same amount. This signals that while there is 
      less money in your bank account, you have more worth available that is locked 
      up. This is an example of deferred income. Even though you haven't received 
      the money yet, you pretend as if you have received the money by recording it 
      as a positive obligation.`),
    h("p", null,
      h("span", TextCode, "EXPENSE    | 24-Feb | loan to John | $300"), h("br"),
      h("span", TextCode, "OBLIGATION | 24-Feb | loan to John | $300")),
    h("p", null, `When the friend pays the loan back, record it as an income, and 
      also a negative obligation by the same amount.`),
    h("p", null,
      h("span", TextCode, "INCOME     | 24-May | loan to John |  $300"), h("br"),
      h("span", TextCode, "OBLIGATION | 24-May | loan to John | -$300")),
    h("p", null, h("strong", null, "Example 3:"), ` You borrow $300 from a friend, 
      promising to pay it back in three months. Record it as an income, and also as
      a negative obligation by the same amount. This signals that while there is 
      more money in your bank account, this is not part of your discretionary fund. 
      This is an example of deferred expense. Even though you haven't paid back the 
      loan yet, you pretend as if you have paid the loan by recording it as a 
      negative obligation.`),
    h("p", null,
      h("span", TextCode, "INCOME     | 24-Feb | loan from John |  $300"), h("br"),
      h("span", TextCode, "OBLIGATION | 24-Feb | loan from John | -$300")),
    h("p", null, `When the you pay the loan back, record it as an expense, and also
      a positive obligation by the same amount.`),
    h("p", null,
      h("span", TextCode, "EXPENSE    | 24-May | loan from John | $300"), h("br"),
      h("span", TextCode, "OBLIGATION | 24-May | loan from John | $300")),
    h("h4", null, "Q: How do I record investments and savings?"),
    h("p", null, `A: You could record your deposits into an investment account as an
      expense, paired with a positive obligation. This signals that while your 
      checking account balance may be low, you have a significant amount of worth 
      tied up elsewhere. The dividend is recorded as income if you withdraw it, or 
      as a positive obligation if you immediately reinvest it.`),
    h("p", null,
      h("span", TextCode, "EXPENSE    | 26-Feb | invest   | $300"), h("br"),
      h("span", TextCode, "OBLIGATION | 26-Feb | invest   | $300"), h("br"),
      h("span", TextCode, "EXPENSE    | 26-Mar | invest   | $300"), h("br"),
      h("span", TextCode, "OBLIGATION | 26-Mar | invest   | $300"), h("br"),
      h("span", TextCode, "EXPENSE    | 26-Apr | invest   | $300"), h("br"),
      h("span", TextCode, "OBLIGATION | 26-Apr | invest   | $300"), h("br"),
      h("span", TextCode, "INCOME     | 01-May | dividend | $550")),
    h("p", null, `When you withdraw from an investment account, record it as an 
      income, paired with an equal amount of negative obligation.`),
    h("p", null,
      h("span", TextCode, "INCOME     | 17-Oct | investment   |  $70,000"), h("br"),
      h("span", TextCode, "OBLIGATION | 17-Oct | investment   | -$70,000")),
    h("p", null, `But some people have a phobia of excess fund. You could also 
      record investment deposits simply as expense, treating the amount in your 
      investment account as a mystery so that you can't be tempted to spend it. 
      Withdrawing from the investment account then is just an income.`),
    h("p", null,
      h("span", TextCode, "EXPENSE    | 26-Feb | invest    | $300"), h("br"),
      h("span", TextCode, "EXPENSE    | 26-Mar | invest    | $300"), h("br"),
      h("span", TextCode, "EXPENSE    | 26-Apr | invest    | $300"), h("br"),
      h("span", TextCode, "INCOME     | 26-May | invest W/ | $1000")),
    h("h4", null, "Q: How do I record credit card transaction?"),
    h("p", null, `A: When you charge a purchase on a credit card, you haven't 
      actually paid anything yet. Since this is a deferred expense, you can record 
      it as a negative obligation. When you pay the credit card balance at the end 
      of the month, then it is an expense, paired with a positive obligation of the 
      same amount.`),
    h("p", null,
      h("span", TextCode, "OBLIGATION |  5 Jul | clothing | -$50"), h("br"),
      h("span", TextCode, "OBLIGATION |  6 Jul | grocery  | -$80"), h("br"),
      h("span", TextCode, "OBLIGATION |  7 Jul | coffee   | -$20"), h("br"),
      h("span", TextCode, "EXPENSE    | 31 Jul | cc bal   | $150"), h("br"),
      h("span", TextCode, "OBLIGATION | 31 Jul | cc bal   | $150")),
    h("p", null, `However, if you are the kind of person that uses a credit card as 
      if it is a debit card and fully pays off the balance every month, you could 
      just record every credit card charge like a normal expense. In this case, the 
      payment of credit card balance at the end of the month is not recorded.`),
    h("p", null,
      h("span", TextCode, "EXPENSE |  5 Jul | clothing | $50"), h("br"),
      h("span", TextCode, "EXPENSE |  6 Jul | grocery  | $80"), h("br"),
      h("span", TextCode, "EXPENSE |  7 Jul | coffee   | $20")),
    h("h4", null, "Q: How do I record cash withdrawal?"),
    h("p", null, `** This is written assuming that you are a millenial adult living 
      in a fairly developed country who doesn't really use cash for significant 
      expenses all that much anymore.`),
    h("p", null, `A: Technically, cash withdrawal is not any kind of transaction. 
      Only when you buy something with that cash would it become an expense. 
      However, since cash is often used for small purchases that are tedious to 
      record, it's easier to just record the cash withdrawal as an expense to lump 
      together all of your small cash expenses.`),
    h("p", null,
      h("span", TextCode, "EXPENSE | 13-Mar | cash withdraw | $300")),
    h("p", null, `In the rare case where you had to make a big expense with cash, 
      you may record it as such. Let's say you withdraw $500 to buy an item for $467 
      cash.`),
    h("p", null,
      h("span", TextCode, "EXPENSE | 26-Mar | antique clock | $467"), h("br"),
      h("span", TextCode, "EXPENSE | 26-Mar | cash withdraw |  $33")),
    h("h4", null, "Q: Why doesn't the app save data to the server?"),
    h("p", null, `A: That would be convenient for sure, but is a privacy risk. You 
      should store your financial records locally, or on a secure file hosting 
      service.`),
    h("h4", null, "Q: How do I transition to the next financial year?"),
    h("p", null, `A: On the New page, type your current Gross Worth into the 
      Starting Balance field, and your current total Obligation into the Starting 
      Obligation field.`))
