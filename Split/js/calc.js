//#region People
const peopleList = document.getElementById("peopleList");
const addButton = document.getElementById("addPersonButton");

let personCount = 2;
const maxPeople = 5;
let transactionCount = 0;

document
    .querySelectorAll(".person-input")
    .forEach(wireUpPersonInput);

addButton.addEventListener("click", () => {

    if (personCount >= maxPeople)
        return;

    personCount++;

    const input = document.createElement("input");

    input.type = "text";
    input.placeholder = `Person ${personCount}`;
    input.className = "person-input";
    input.maxLength = 30;

    peopleList.appendChild(input);

    wireUpPersonInput(input);

    if (personCount === maxPeople)
        addButton.style.display = "none";

    refreshPaidByDropdowns();
});

function wireUpPersonInput(input) {

    input.addEventListener(
        "input",
        refreshPaidByDropdowns
    );

}

function refreshPaidByDropdowns() {

    const people = getPeople();

    const dropdowns =
        document.querySelectorAll("select");

    dropdowns.forEach(dropdown => {

        const selected = dropdown.value;

        dropdown.innerHTML = people
            .map((person, index) =>
                `<option value="${index}">${person}</option>`)
            .join("");

        dropdown.value = selected;

    });

}

function getPeople() {

    return [...document.querySelectorAll(".person-input")]
        .map(x => x.value.trim())
        .filter(x => x !== "");

}

//#endregion

//#region Transactions
const transactionList = document.getElementById("transactionList");
const transactions = [];

document
    .getElementById("addTransactionButton")
    .addEventListener("click", addTransaction);


function addTransaction() {

    document
        .querySelectorAll(".transaction-form")
        .forEach(form => {

            form.classList.add("is-hidden");

        });

    document
        .querySelectorAll(".transaction-summary")
        .forEach(summary => {

            summary.classList.remove("is-hidden");

        });

    transactionCount++;

    const card = createTransactionCard(transactionCount);

    transactionList.appendChild(card);

    wireUpTransactionCard(card);

}

function createTransactionCard(transactionNumber) {

    const card = document.createElement("div");

    card.className = "transaction-card";

    const people = getPeople();

    const options =
        people.length > 0
            ? people.map((person, index) =>
                `<option value="${index}">${person}</option>`).join("")
            : `<option value="0">Person 1</option>
            <option value="1">Person 2</option>`;

    card.innerHTML = `

    ${getTransactionFormHtml(transactionNumber, options)}

    ${getEmptyTransactionSummaryHtml()}

    `;

    return card;

}

function getTransactionFormHtml(
    transactionNumber,
    options
) {

    return `
            <div class="transaction-form">

                <h3>Transaction ${transactionNumber}</h3>

                <label>Title</label>

                <input
                    type="text"
                    class="transaction-input"
                    placeholder="Name">

                <label>Amount</label>

                <input
                    type="number"
                    class="transaction-input"
                    placeholder="0.00"
                    step="0.01">

                <label>Who Paid</label>

                <select class="transaction-input">

                    ${options}

                </select>

        <label>Split</label>

        <div class="split-options">

                <label>

                    <input
                        type="radio"
                        name="split${transactionCount}"
                        value="half"
                        checked>

                    Even Split

                </label>

                <label>

                    <input
                        type="radio"
                        name="split${transactionCount}"
                        value="exact">

                    Amount Owed

                </label>

                   <div class="split-person exact-person is-hidden">

                    <label>Who Owes?</label>

                    <select class="transaction-input split-person-select">

                        ${options}

                    </select>

                    </div>

                <input
                    class="transaction-input split-extra"
                    type="number"
                    step="0.01"
                    placeholder="Amount owed"
                    style="display:none;">

                <label>

                    <input
                        type="radio"
                        name="split${transactionCount}"
                        value="percentage">

                    Percentage Owed

                </label>

                <div class="split-person percentage-person is-hidden">

                <label>Who Owes?</label>

                <select class="transaction-input split-person-select">

                    ${options}

                </select>

            </div>

                <input
                    class="transaction-input split-extra"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Percentage"
                    style="display:none;">

            </div>

            <div class="transaction-actions">

            <button class="save-button">

                <i class="fa-solid fa-check"></i>

                Save

            </button>

            </div>

        </div>
            `;

}

function wireUpTransactionCard(card) {

    const radios = card.querySelectorAll('input[type="radio"]');
    const extras = card.querySelectorAll(".split-extra");
    const saveButton = card.querySelector(".save-button");
    const exactPerson = card.querySelector(".exact-person");
    const percentagePerson = card.querySelector(".percentage-person");

    radios.forEach(radio => {

        radio.addEventListener("change", () => {

            extras[0].style.display =
                radio.value === "exact" && radio.checked
                    ? "block"
                    : "none";

            extras[1].style.display =
                radio.value === "percentage" && radio.checked
                    ? "block"
                    : "none";

            const showRecipient =
                getPeople().length > 2;

            const showExactPerson =
                radio.value === "exact"
                && radio.checked
                && showRecipient;

            const showPercentagePerson =
                radio.value === "percentage"
                && radio.checked
                && showRecipient;

            exactPerson.style.display =
                showExactPerson ? "block" : "none";

            percentagePerson.style.display =
                showPercentagePerson ? "block" : "none";

        });

    });

    saveButton.addEventListener("click", () => {

        saveTransaction(card);

    });

}

function saveTransaction(card) {

    const title = card.querySelector('input[type="text"]').value.trim();

    const amount =
        parseFloat(
            card.querySelector('input[type="number"]').value
        );

    const paidBy = card.querySelector("select").selectedIndex;

    const splitType =
        card.querySelector('input[type="radio"]:checked').value;

    const splitExtras =
        card.querySelectorAll(".split-extra");

    const personDropdowns =
        card.querySelectorAll(".split-person-select");

    const exactAmount =
        parseFloat(splitExtras[0].value);

    const percentage =
        parseFloat(splitExtras[1].value);

    const participantCount = getPeople().length

    const splitPerson =
    getPeople().length > 2
        ? personDropdowns[
            splitType === "exact" ? 0 : 1
        ].selectedIndex
        : getPeople().findIndex(
            (_, index) => index !== paidBy
        );

    //val
    if (title === "") {

        alert("Please enter a title.");

        return;

    }

    if (isNaN(amount)) {

        alert("Please enter an amount.");

        return;

    }

    if (splitType === "exact" && isNaN(exactAmount)) {

        alert("Please enter the amount owed.");

        return;

    }

    if (splitType === "percentage" && isNaN(percentage)) {

        alert("Please enter a percentage.");

        return;

    }

    if (splitType === "percentage"
        && (percentage < 0 || percentage > 100)) {

        alert("Percentage must be between 0 and 100.");

        return;

    }

    const existing =
        transactions.find(
            t => t.id === card.dataset.id
        );

    let transaction;

    if (existing) {

        existing.title = title;
        existing.amount = amount;
        existing.paidBy = paidBy;
        existing.splitType = splitType;

        existing.exactAmount =
            splitType === "exact"
                ? exactAmount
                : null;

        existing.percentage =
            splitType === "percentage"
                ? percentage
                : null;

        existing.splitPerson = splitPerson;

        existing.participantCount = participantCount;

        transaction = existing;

    }
    else {

        transaction = {

            id: crypto.randomUUID(),

            title,

            amount,

            paidBy,

            splitType,

            participantCount,

            exactAmount:
                splitType === "exact"
                    ? exactAmount
                    : null,

            percentage:
                splitType === "percentage"
                    ? percentage
                    : null,

            splitPerson

        };

        transactions.push(transaction);

        card.dataset.id = transaction.id;
    }

    const summary = card.querySelector(".transaction-summary");

    summary.innerHTML = getTransactionSummaryHtml(transaction);

    wireUpSummary(card);

    card.querySelector(".transaction-form").classList.add("is-hidden");

    summary.classList.remove("is-hidden");

    updateBalanceButton();
}

function wireUpSummary(card) {

    const editButton = card.querySelector(".edit-button");

    const deleteButton = card.querySelector(".delete-button");

    editButton.addEventListener("click", () => {

        card.querySelector(".transaction-form")
            .classList.remove("is-hidden");

        card.querySelector(".transaction-summary")
            .classList.add("is-hidden");

    });

    deleteButton.addEventListener("click", () => {

        const id = card.dataset.id;

        const index =
            transactions.findIndex(t => t.id === id);

        if (index !== -1) {

            transactions.splice(index, 1);

        }

        card.remove();

        updateBalanceButton();

    });

}

//#endregion

//#region Balance

const balanceButton = document.getElementById("balanceButton");

balanceButton.addEventListener(
    "click",
    calculateBalances
);

function calculateBalances(){

    const balances = {};
    
    const people = getPeople();

    people.forEach(person => {

        balances[person] = 0;

    });

    transactions.forEach(transaction => {
        const payer = people[transaction.paidBy];

        balances[payer] += transaction.amount;

        const shares =
        getTransactionShare(transaction);

        Object.entries(shares)
            .forEach(([person, share]) => {

                balances[person] -= share;

            });
    });

    const results =
        Object.entries(balances)
            .map(([person, balance]) => ({

                person,

                balance

            }))
            .sort((a, b) => b.balance - a.balance);

    const settlements =
    buildSettlements(results);

    renderSettlements(settlements);

    return settlements;

}

function getTransactionShare(transaction) {

    const people = getPeople();

    const shares = {};

    people.forEach(person => {

        shares[person] = 0;

    });

    switch (transaction.splitType) {

        case "half": {

            const each =
                transaction.amount /
                transaction.participantCount;

            people.forEach(person => {

                shares[person] = each;

            });

            break;
        }

        case "exact": {

            const recipient =
                people[transaction.splitPerson];

            shares[recipient] =
                transaction.exactAmount;

            shares[people[transaction.paidBy]] =
                transaction.amount - transaction.exactAmount;

            break;
        }

        case "percentage": {

            const recipient =
                people[transaction.splitPerson];

            const share =
                transaction.amount *
                (transaction.percentage / 100);

            shares[recipient] = share;

            shares[people[transaction.paidBy]] =
                transaction.amount - share;

            break;
        }

    }

    return shares;

}

function buildSettlements(results){
        const creditors =
            results.filter(x => x.balance > 0);

        const debtors =
            results.filter(x => x.balance < 0);

        const settlements = [];

        let creditorIndex = 0;
        let debtorIndex = 0;

        while(
            creditorIndex < creditors.length &&
            debtorIndex < debtors.length
        ){
            const creditor =
                creditors[creditorIndex];

            const debtor =
                debtors[debtorIndex];

            const amount =
                Math.min(
                    creditor.balance,
                    Math.abs(debtor.balance)
                );

            settlements.push({

                from: debtor.person,

                to: creditor.person,

                amount

            });

            creditor.balance -= amount;

            debtor.balance += amount;

            if(creditor.balance < 0.01)
                creditorIndex++;

            if(Math.abs(debtor.balance) < 0.01)
                debtorIndex++;
        }

        return settlements;
}

function renderSettlements(settlements) {

    const panel =
        document.getElementById("settlementPanel");

    panel.innerHTML =
        getSettlementHtml(settlements);

    panel.classList.remove("is-hidden");

}

function getSettlementHtml(settlements) {

    if (settlements.length === 0) {

        return `
            <h2>Settlement</h2>

            <p>
                🎉 Everyone is square.
            </p>
        `;

    }

    const rows =
        settlements.map(settlement => `

            <div class="settlement-row">

                <strong>

                    ${settlement.from}

                </strong>

                owes

                <strong>

                    ${settlement.to}

                </strong>

                <span>

                    £${settlement.amount.toFixed(2)}

                </span>

            </div>

        `).join("");

    return `

        <h2>

            <i class="fa-solid fa-scale-balanced"></i>

            Settlement

        </h2>

        ${rows}

    `;

}

//#endregion

//#region Rendering
function getEmptyTransactionSummaryHtml() {

    return `

    <div class="transaction-summary is-hidden">

    </div>

    `;

}

function getTransactionSummaryHtml(transaction) {

    const personName = getPeople()[transaction.paidBy];
    const people = getPeople();
    const recipient = people[transaction.splitPerson];

    let splitDescription;

    switch (transaction.splitType) {

        case "half":
            splitDescription = "Even Split";
            break;

        case "exact":
            splitDescription =
        `${recipient} owes £${transaction.exactAmount.toFixed(2)}`;
            break;

        case "percentage":
            splitDescription =
        `${recipient} owes ${transaction.percentage}%`;
            break;

    }

    return `
        <div class="transaction-summary-content">

            <div class="transaction-details">

                <h3>${transaction.title}</h3>

                <p>
                    <strong>£${transaction.amount.toFixed(2)}</strong>
                </p>

                <p>Paid by ${personName}</p>

                <p>${splitDescription}</p>

            </div>

            <div class="transaction-summary-actions">

                <button class="edit-button">
                    <i class="fa-solid fa-pen"></i>
                    Edit
                </button>

                <button class="delete-button">
                    <i class="fa-solid fa-trash"></i>
                    Delete
                </button>

            </div>

        </div>

    `;

}

function updateBalanceButton(){

    balanceButton.disabled =
        transactions.length === 0;

}

//#endregion

addTransaction();