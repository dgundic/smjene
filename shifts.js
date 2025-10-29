/**
 * shifts.js
 * Funkcije za generiranje tabličnog kalendara i bojenje smjena.
 *
 * API:
 *  createMonthCalendar(containerElement, year, month, shiftsArray)
 *
 * shiftsArray: [{ date: "YYYY-MM-DD", shifts: ["day","night"] }, ...]
 */

(function () {
  // mapiranje kratkog imena smjene -> data-shift vrijednost (isti string možete koristiti i u backendu)
  const SHIFT_NAMES = ['day', 'night', 'evening', 'off', 'remote'];

  // pomaže vratiti boju varijable za smjenu (iz :root CSS var)
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || null;
  }

  // sastavi split-gradient za više smjena koristeći CSS varijable (maks 3 dijela za čitljivost)
  function buildSplitGradient(parts) {
    const colors = parts.map(p => {
      const varName = `--shift-${p}`;
      const val = cssVar(varName) || '#999';
      return val;
    });
    const ratio = Math.floor(100 / colors.length);
    const stops = colors.map((c, i) => `${c} ${i * ratio}% ${(i + 1) * ratio}%`).join(', ');
    return `linear-gradient(90deg, ${stops})`;
  }

  // pronadi shift objekt po datumu
  function findShiftsForDate(shiftsArray, yyyy, mm, dd) {
    const d = `${String(yyyy).padStart(4,'0')}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
    const found = shiftsArray.find(s => s.date === d);
    return found ? found.shifts : null;
  }

  // glavni generator tablice
  window.createMonthCalendar = function(container, year, month /*1-12*/, shiftsArray) {
    container.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'cal';
    // header s danima u tjednu
    const thead = document.createElement('thead');
    const trh = document.createElement('tr');
    const days = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];
    days.forEach(d => {
      const th = document.createElement('th');
      th.textContent = d;
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    const first = new Date(year, month - 1, 1);
    // in JS: getDay() -> 0 (nedjelja) .. 6 (subota)
    // želimo tjedan počinje ponedjeljkom -> pomaknemo
    const startWeekday = (first.getDay() + 6) % 7; // 0 = pon
    const daysInMonth = new Date(year, month, 0).getDate();

    let row = document.createElement('tr');
    // ispunimo prazne ćelije prije prvog dana
    for (let i = 0; i < startWeekday; i++) {
      const td = document.createElement('td');
      td.className = 'cell empty';
      row.appendChild(td);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const weekdayIndex = (startWeekday + d - 1) % 7;
      const td = document.createElement('td');
      td.className = 'cell';
      // datum (prikazan kao broj u kutu)
      const spanDate = document.createElement('span');
      spanDate.className = 'date-num';
      spanDate.textContent = d;
      td.appendChild(spanDate);

      // provjeri smjene za taj datum
      const shifts = findShiftsForDate(shiftsArray, year, month, d);
      if (shifts && shifts.length > 0) {
        if (shifts.length === 1) {
          td.setAttribute('data-shift', shifts[0]);
          const span = document.createElement('span');
          span.className = 'shift';
          span.textContent = shifts[0][0].toUpperCase() + shifts[0].slice(1); // npr. "Day"
          td.appendChild(span);
        } else {
          // više smjena -> koristimo inline gradient i data-shift=multiple
          td.setAttribute('data-shift', 'multiple');
          const grad = buildSplitGradient(shifts.slice(0,3));
          td.style.backgroundImage = grad;
          td.style.border = '1px solid rgba(255,255,255,0.04)';
          const span = document.createElement('span');
          span.className = 'shift';
          span.textContent = shifts.join(' / ');
          td.appendChild(span);
        }
      } else {
        // nema podataka -> neutralna ćelija
      }

      row.appendChild(td);

      // kraj reda?
      if (weekdayIndex === 6) {
        tbody.appendChild(row);
        row = document.createElement('tr');
      }
    }

    // ako nakon zadnjeg dana još ima praznina u redu, dodaj ih
    if (row.children.length > 0) {
      // popuni preostale stupce
      while (row.children.length < 7) {
        const td = document.createElement('td');
        td.className = 'cell empty';
        row.appendChild(td);
      }
      tbody.appendChild(row);
    }

    table.appendChild(tbody);
    container.appendChild(table);
  };
})();
