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
    if(cilj<poc) throw "Ciljni datum prije početnog!";
    const ukupno = daysBetweenInclusive(poc, cilj);
    const pune = Math.floor(ukupno/7);
    let prelazi = pune*3;
    let start = new Date(poc); start.setDate(start.getDate()+pune*7);
    let prev = grupa_dana(start);
    let cur = new Date(start);
    for(let i=0;i<ukupno%7;i++){
        cur.setDate(cur.getDate()+1);
        const g = grupa_dana(cur);
        if(g!==prev){ prelazi++; prev=g; }
    }
    return prelazi;
}

function smjena_na_datum(poc, pocShift, cilj){
    const startIdx = SMJENE.indexOf(pocShift);
    const idx = (startIdx + broj_prelazaka_grupa(poc, cilj)) % SMJENE.length;
    return SMJENE[idx];
}

function formatDate(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function hrvatskiDan(d){ return DANI[weekdayIndex(d)]; }

function onSubmit(ev){
    ev.preventDefault();
    const sD=parseDateInput(document.getElementById('startDate').value);
    const sShift=document.getElementById('startShift').value;
    const tD=parseDateInput(document.getElementById('targetDate').value);
    const shift = smjena_na_datum(sD,sShift,tD);
    document.getElementById('output').style.display='flex';
    document.getElementById('outDate').textContent=formatDate(tD);
    document.getElementById('outDay').textContent=hrvatskiDan(tD);
    document.getElementById('outShift').textContent=shift.toUpperCase();
    renderCalendarForMonth(sD,sShift,tD);
    return false;
}

function renderCalendarForMonth(startDate,startShift,targetDate){
    const y=targetDate.getFullYear(), m=targetDate.getMonth();
    document.getElementById('calendarWrap').style.display='block';
    document.getElementById('calHeader').textContent=`Kalendar: ${["siječanj","veljača","ožujak","travanj","svibanj","lipanj","srpanj","kolovoz","rujan","listopad","studeni","prosinac"][m]} ${y}`;
    const first=new Date(y,m,1), last=new Date(y,m+1,0), daysInMonth=last.getDate();
    let firstWeekday = weekdayIndex(first);
    let totalCells = Math.ceil((firstWeekday+daysInMonth)/7)*7;
    let html='<thead><tr>';
    ["Pon","Uto","Sri","Čet","Pet","Sub","Ned"].forEach(d=>html+=`<th>${d}</th>`);
    html+='</tr></thead><tbody>';
    let dayCounter=1;
    for(let c=0;c<totalCells;c++){
        if(c%7===0) html+='<tr>';
        if(c<firstWeekday || dayCounter>daysInMonth){ html+='<td class="cell"></td>'; }
        else{
            const d=new Date(y,m,dayCounter);
            const shift=smjena_na_datum(startDate,startShift,d);
            const kratice = { "jutarnja": "J", "popodnevna": "P", "noćna": "N", "slobodan": "S" };
            html+=`<td class="cell ${shift} ${formatDate(d)===formatDate(targetDate)?' today':''}">
            <span class="date-num">${dayCounter}</span>
            <span class="shift">${kratice[shift]}</span>
            </td>`;

            dayCounter++;
        }
        if(c%7===6) html+='</tr>';
    }
    html+='</tbody>';
    document.getElementById('calTable').innerHTML=html;
}
