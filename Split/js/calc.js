const peopleList = document.getElementById("peopleList");
const addButton = document.getElementById("addPersonButton");
const transactionList = document.getElementById("transactionList");
const transaction = {
    id: crypto.randomUUID(),
    title: "",
    amount: 0,
    paidBy: 0,
    splitType: "half"
}

let personCount = 2;
const maxPeople = 5;
let transactionCount = 0;

document
.getElementById("addTransactionButton")
.addEventListener("click", addTransaction);

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

});

function addTransaction(){

    transactionCount++;

    const card = document.createElement("div");

    card.className = "transaction-card";

    card.innerHTML = `
        ...
    `;

    transactionList.appendChild(card);

}