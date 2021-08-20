

const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;
let db;
//Opens a new database request & creates a place for it 
const indexedDBrequest = indexedDB.open("budget", 1);
//Function will run once db is created
indexedDBrequest.onsuccess = ({ target }) => {
  db = target.result;
  console.log(db.result)
  // Checks to see if network is online
  if (navigator.onLine) {
    checkDatabase();
  }
};
indexedDBrequest.onupgradeneeded = ({ target }) => {
  let db = target.result;
  //Represents pending transaction, instance of object store
  db.createObjectStore("pending", { autoIncrement: true });
};
// Handles errors
indexedDBrequest.onerror = function(event) {
  console.log("Woops! " + event.target.errorCode);
};
function saveRecord(log) {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
//Adds object to object store
  store.add(log);
}
function checkDatabase() { 
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();
  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {//Retrieves any pending transactions and puts them in database
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => {
        return response.json();
      })
      .then(() => {
        // Clears stored transactions if successful
        const transaction = db.transaction(["pending"], "readwrite");
        const store = transaction.objectStore("pending");
        store.clear();
      });
    }
  };
}
// Checks to see if network is online
window.addEventListener("online", checkDatabase);