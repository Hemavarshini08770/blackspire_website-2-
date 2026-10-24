"use strict";

/* ------------------------------------------------------------------
   ventures.js  (shared by index.html and venture.html)

   STEP 1 - Where does the data come from?
   Right now it reads the local file "ventures.csv".
   When your Google Sheet is ready, publish it as CSV
   (File > Share > Publish to web > choose the sheet > CSV)
   and paste that link between the quotes below.
------------------------------------------------------------------- */
const SHEET_URL = "ventures.csv";
// Example after publishing:
// const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/XXXXXXXX/pub?output=csv";


/* STEP 2 - Turn CSV text into rows.
   A CSV is just text: one line per row, columns split by commas.
   Catch: a cell can contain a comma inside "quotes", so we can't
   simply do text.split(","). This function walks letter by letter. */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } // "" means a literal quote
        else inQuotes = false;                         // closing quote
      } else {
        cell += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {                            // end of a cell
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {             // end of a row
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      rows.push(row);
      row = [];
    } else {
      cell += c;
    }
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows;
}


/* STEP 3 - Fetch the sheet and convert rows into objects.
   First row = column names (id, name, sector...).
   Each next row becomes: { id:"1", name:"UltraNova AI", ... }  */
let ventureSource = "";   // tells the page where the data came from

async function loadVentures() {
  try {
    const res = await fetch(SHEET_URL);
    if (!res.ok) throw new Error("HTTP " + res.status);

    const rows = parseCSV(await res.text());
    const headers = rows[0].map(h => h.trim().toLowerCase());
    ventureSource = SHEET_URL.startsWith("http") ? "Google Sheet (live)" : "ventures.csv";

    return rows
      .slice(1)
      .filter(r => r.some(c => c.trim() !== ""))       // skip empty rows
      .map(r => {
        const v = {};
        headers.forEach((h, i) => { v[h] = (r[i] || "").trim(); });
        return v;
      });
  } catch (err) {
    // Sheet/CSV not reachable (offline, wrong link, or opened by double-click)
    console.warn("Using backup data:", err);
    ventureSource = "local backup (ventures-data.js)";
    return VENTURES_BACKUP;
  }
}
