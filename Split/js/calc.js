const peopleList = document.getElementById("peopleList");
const personInputs = document.querySelectorAll(".person-input");
const addButton = document.getElementById("addPersonButton");
const transactionList = document.getElementById("transactionList");

let personCount = 2;
const maxPeople = 5;
let transactionCount = 0;

document
.getElementById("addTransactionButton")
.addEventListener("click", addTransaction);

personInputs.forEach(input => {
    input.addEventListener("input", refreshPaidByDropdowns);
});

addButton.addEventListener("click", () => {

    if(personCount >= maxPeople)
        return;

    personCount++;

    const input = document.createElement("input");

    input.type = "text";
    input.placeholder = `Person ${personCount}`;
    input.className = "person-input";
    input.maxLength = 30;

    peopleList.appendChild(input);

    if(personCount === maxPeople)
        addButton.style.display = "none";

    refreshPaidByDropdowns();
});

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

function addTransaction() {

    transactionCount++;

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

        <h3>Transaction ${transactionCount}</h3>

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
        </div>

    `;

    transactionList.appendChild(card);

    const radios = card.querySelectorAll('input[type="radio"]');
    const extras = card.querySelectorAll(".split-extra");

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

}

function getPeople() {

    return [...document.querySelectorAll(".person-input")]
        .map(x => x.value.trim())
        .filter(x => x !== "");

}

addTransaction();