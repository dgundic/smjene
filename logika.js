const SMJENE = ["jutarnja","popodnevna","noćna","slobodan"];
const DANI = ["pon","uto","sri","čet","pet","sub","ned"];

function parseDateInput(val){
    if(!val) return null;
    const p = val.split('-').map(Number);
    return new Date(p[0], p[1]-1, p[2]);
}

function weekdayIndex(jsDate){ return (jsDate.getDay() + 6) % 7; }

function grupa_dana(jsDate){
    const wd = jsDate.getDay();
    if(wd===1 || wd===2) return 0;
    if(wd===3 || wd===4) return 1;
    return 2;
}

function daysBetweenInclusive(start,end){
    return Math.round((Date.UTC(end.getFullYear(),end.getMonth(),end.getDate())
        - Date.UTC(start.getFullYear(),start.getMonth(),start.getDate()))/(24*60*60*1000));
}

function broj_prelazaka_grupa(poc, cilj){
    // Omogućuje računanje i unazad
    const smjer = cilj >= poc ? 1 : -1;
    const start = smjer === 1 ? poc : cilj;
    const end = smjer === 1 ? cilj : poc;

    const ukupno = daysBetweenInclusive(start, end);
    const pune = Math.floor(ukupno / 7);
    let prelazi = pune * 3;
    let cur = new Date(start);
    let prev = grupa_dana(cur);

    for (let i = 0; i < ukupno % 7; i++) {
        cur.setDate(cur.getDate() + 1);
        const g = grupa_dana(cur);
        if (g !== prev) { prelazi++; prev = g; }
    }
    return prelazi * smjer;
}
function smjena_na_datum(poc, pocShift, cilj){
    const startIdx = SMJENE.indexOf(pocShift);
    const pomak = broj_prelazaka_grupa(poc, cilj);
    const duljina = SMJENE.length;
    const idx = ((startIdx + pomak) % duljina + duljina) % duljina; // ispravno za negativne vrijednosti
    return SMJENE[idx];
}

function formatDate(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function hrvatskiDan(d){ return DANI[weekdayIndex(d)]; }

function onSubmit(ev){
    ev.preventDefault();

    // Fiksni referentni datum
    const sD = new Date(2025, 8, 16); // 16.09.2025.

    // Smjena ovisi o odabranoj grupi
    const selectedGroup = document.querySelector('input[name="group"]:checked').value;
    let sShift = "jutarnja"; // default
    if (selectedGroup === "A") sShift = "noćna";
    else if (selectedGroup === "B") sShift = "slobodan";
    else if (selectedGroup === "C") sShift = "jutarnja";
    else if (selectedGroup === "D") sShift = "popodnevna";

    const tInput = document.getElementById("targetDate");
    if (!tInput.value) {
        alert("Molim odaberi valjani datum.");
        return false;
    }

    const tD = parseDateInput(tInput.value);
    const shift = smjena_na_datum(sD, sShift, tD);

    document.getElementById("output").style.display = "flex";
    document.getElementById("outDate").textContent = tD.toLocaleDateString("hr-HR");
    document.getElementById("outDay").textContent = hrvatskiDan(tD);
    document.getElementById("outShift").textContent = shift.toUpperCase();

    renderCalendarForMonth(sD, sShift, tD);
    return false;
}

function renderCalendarForMonth(startDate, startShift, targetDate) {
    const y = targetDate.getFullYear(),
          m = targetDate.getMonth();

    const mjeseci = [
        "siječanj", "veljača", "ožujak", "travanj", "svibanj", "lipanj",
        "srpanj", "kolovoz", "rujan", "listopad", "studeni", "prosinac"
    ];

    document.getElementById('calendarWrap').style.display = 'block';
    document.getElementById('calHeader').innerHTML = 
        `Kalendar: <strong>${mjeseci[m]}</strong> ${y}`;
    
    const first = new Date(y, m, 1),
          last = new Date(y, m + 1, 0),
          daysInMonth = last.getDate();
    let firstWeekday = weekdayIndex(first);
    let totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
    let html = '<thead><tr>';
    ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"].forEach(d => html += `<th>${d}</th>`);
    html += '</tr></thead><tbody>';
    let dayCounter = 1;

    for (let c = 0; c < totalCells; c++) {
        if (c % 7 === 0) html += '<tr>';
        if (c < firstWeekday || dayCounter > daysInMonth) {
            html += '<td class="cell"></td>';
        } else {
            const d = new Date(y, m, dayCounter);
            const shift = smjena_na_datum(startDate, startShift, d);
            const kratice = { "jutarnja": "J", "popodnevna": "P", "noćna": "N", "slobodan": "S" };
            html += `<td class="cell ${shift} ${formatDate(d) === formatDate(targetDate) ? ' today' : ''}">
                        <span class="date-num">${dayCounter}</span>
                        <span class="shift">${kratice[shift]}</span>
                     </td>`;
            dayCounter++;
        }
        if (c % 7 === 6) html += '</tr>';
    }
    html += '</tbody>';
    document.getElementById('calTable').innerHTML = html;
}

