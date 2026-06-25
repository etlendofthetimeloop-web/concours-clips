const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSoVsWLs_Ww7ffHP4gbok89xJ6nAexPnEgTFSAIZ6_szx_Ogt63qqmWOE4y3Mh06g7imbn-mM__Mz1n/pub?gid=1405857124&single=true&output=csv";

let previousVotes = {};
let previousOrder = [];

function splitCSV(line){
  const result=[];
  let current="";
  let quote=false;

  for(let i=0;i<line.length;i++){
    const char=line[i];

    if(char === '"') quote=!quote;
    else if(char === "," && !quote){
      result.push(current);
      current="";
    }else{
      current+=char;
    }
  }

  result.push(current);
  return result.map(x=>x.replace(/^"|"$/g,"").trim());
}

function medal(index){
  if(index===0) return "🥇";
  if(index===1) return "🥈";
  if(index===2) return "🥉";
  return index+1;
}

function badge(index, votes, max){
  if(index===0) return "Favori actuel";
  if(index===1 && max - votes <= 2) return "Duel serré";
  if(index===1 || index===2) return "En course";
  if(votes > 0 && max - votes <= 2) return "Peut créer la surprise";
  if(votes > 0) return "Soutenu par le public";
  return "";
}

function showToast(message){
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),2200);
}

async function loadRanking(manual=false){
  const refreshBtn = document.getElementById("refreshBtn");

  if(manual){
    refreshBtn.classList.add("syncing");
    refreshBtn.innerText = "Synchronisation…";
  }

  try{
    const response = await fetch(CSV_URL + "&cache=" + Date.now());
    const text = await response.text();
    const lines = text.trim().split(/\r?\n/).slice(1);

    const songs = lines.map(line=>{
      const c = splitCSV(line);
      return {
        title:c[2],
        votes:Number(c[3]) || 0,
        image:c[5]
      };
    }).filter(s=>s.title);

    const max = Math.max(...songs.map(s=>s.votes),1);
    const totalChoices = songs.reduce((sum,s)=>sum+s.votes,0);
    const participants = Math.round(totalChoices / 3);

    document.getElementById("subtitle").innerHTML =
      `<span class="live-dot">● LIVE</span> · ${participants} participant(s) · ${totalChoices} choix enregistrés`;

    const newOrder = songs.map(s=>s.title);
    const leaderChanged =
      previousOrder.length > 0 && previousOrder[0] !== newOrder[0];

    const ranking = document.getElementById("ranking");
    ranking.innerHTML = "";

    songs.forEach((s,i)=>{
      const percent = Math.max(4,(s.votes/max)*100);
      const topClass = i===0 ? "top1" : i===1 ? "top2" : i===2 ? "top3" : "";
      const voteChanged =
        previousVotes[s.title] !== undefined &&
        previousVotes[s.title] !== s.votes;

      const positionChanged =
        previousOrder.length > 0 &&
        previousOrder.indexOf(s.title) !== i;

      const changed = voteChanged || positionChanged;

      const badgeText = badge(i, s.votes, max);

      const item = document.createElement("div");
      item.className = `item ${topClass} ${changed ? "changed" : ""}`;

      item.innerHTML = `
        <div class="rank">${medal(i)}</div>
        <img class="cover" src="${s.image}">
        <div>
          <div class="title">${s.title}</div>
          ${badgeText ? `<div class="badge">${badgeText}</div>` : ``}
          <div class="bar-bg">
            <div class="bar" style="width:${percent}%"></div>
          </div>
        </div>
        <div class="votes">${s.votes}<span class="small">voix</span></div>
      `;

      ranking.appendChild(item);
      previousVotes[s.title] = s.votes;
    });

    previousOrder = newOrder;

    const now = new Date();
    document.getElementById("footer").innerText =
      "Dernière mise à jour : " + now.toLocaleTimeString("fr-FR");

    if(leaderChanged){
      showToast("🏆 Nouveau leader : " + newOrder[0]);
    }else if(manual){
      showToast("✓ Classement mis à jour");
    }

  }catch(error){
    document.getElementById("ranking").innerHTML =
      '<div class="subtitle">Erreur de chargement du classement.</div>';
  }

  if(manual){
    refreshBtn.classList.remove("syncing");
    refreshBtn.innerText = "Actualiser";
  }
}

document.getElementById("refreshBtn").addEventListener("click", ()=>loadRanking(true));

document.getElementById("refreshBtn").addEventListener("keydown", (e)=>{
  if(e.key === "Enter" || e.key === " "){
    e.preventDefault();
    loadRanking(true);
  }
});

loadRanking();
setInterval(loadRanking, 8000);
