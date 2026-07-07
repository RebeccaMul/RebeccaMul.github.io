const peopleList = document.getElementById("peopleList");
const addButton = document.getElementById("addPersonButton");
const transactionList = document.getElementById("transactionList");
const transactions = [];

let personCount = 2;
const maxPeople = 5;
let transactionCount = 0;

document
    .getElementById("addTransactionButton")
    .addEventListener("click", addTransaction);

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

    const people = getPeople();

    const options =
        people.length > 0
            ? people.map((person, index) =>
                `<option value="${index}">${person}</option>`).join("")
            : `<option value="0">Person 1</option>
               <option value="1">Person 2</option>`;

    const card = document.createElement("div");

    card.className = "transaction-card";

    card.innerHTML = `
            <div class="transaction-form">

                <h3>Transaction ${transactionNumber}</h3>

                <label>Title</label>

                <input
                    type="text"
                    class="transaction-input"
                    placeholder="Dinner">

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

                    50 / 50

                </label>

                <label>

                    <input
                        type="radio"
                        name="split${transactionCount}"
                        value="exact">

                    Amount Owed

                </label>

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

        <div class="transaction-summary is-hidden">

        </div>

            `;

    return card;

}

function wireUpTransactionCard(card) {

    const radios = card.querySelectorAll('input[type="radio"]');
    const extras = card.querySelectorAll(".split-extra");
    const saveButton = card.querySelector(".save-button");

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

    //val
    if (title === "") {

        alert("Please enter a title.");

        return;

    }

    if (isNaN(amount)) {

        alert("Please enter an amount.");

        return;

    }

    const transaction = {

        id: crypto.randomUUID(),

        title,

        amount,

        paidBy,

        splitType: "half"

    };

    transactions.push(transaction);

    const personName =
        getPeople()[paidBy];

    card.querySelector(".transaction-summary").innerHTML = `

    <h3>${title}</h3>

    <p><strong>£${amount.toFixed(2)}</strong></p>

    <p>Paid by ${personName}</p>

    <p>50 / 50</p>

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

    `;

    card.querySelector(".transaction-form").classList.add("is-hidden");
    card.querySelector(".transaction-summary").classList.remove("is-hidden");

}

addTransaction();