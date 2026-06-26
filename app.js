const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSoVsWLs_Ww7ffHP4gbok89xJ6nAexPnEgTFSAIZ6_szx_Ogt63qqmWOE4y3Mh06g7imbn-mM__Mz1n/pub?gid=1405857124&single=true&output=csv";

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

catch(error){
    console.error("ERREUR CLASSEMENT :", error);

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

const ATN_VOTE_API_URL = "https://script.google.com/macros/s/AKfycbw41nr9MIPqhSDur_jMx4H8zC8actmrR1jgE2rQLEYTYK2DJRtBmdx__Ng_AgP4GHIJ/exec";

const ATN_TITLES = [
  {
    title: "Avant l'Aube",
    image: "https://lh7-rt.googleusercontent.com/formsz/AN7BsVCnaMSRBkXaS2_2cv3i-MMCLMbEZzhxsmyIOO-vFzxLZ_mynQILBvt5mmWUJ3JmSr562dkvYkZMDaj2G4is6zMWjXTx2HY3kyAO1fUrY5E_1uaatBYbWpYqHhqAfvoeoQsO0bbbZLW12j1BgjqbzJRlP5LiflFChHPA-qn0Gw=s2048?key=9sB5KGCgr7SA4UzQBsPuaA"
  },
  {
    title: "Laissez-moi brûler",
    image: "https://lh7-rt.googleusercontent.com/formsz/AN7BsVAkakZlXCf0ZQ1RtnDkMZ_mAdxnriEq54kBpmK13ONtgt8qLkiwChDQ2xW44mbwf8qGNdpY-WiWkihuKMaFd3iRwyjmHxJoYCna6Hp42JcH4sB6XJinQA9WGb1BFhqaon3kHt2T60pZQcYAi-oUBgUpcHTa5mdS2vQt5OPivA=s2048?key=9sB5KGCgr7SA4UzQBsPuaA"
  },
  {
    title: "Touche pas à ma soeur",
    image: "https://lh7-rt.googleusercontent.com/formsz/AN7BsVABiCCkeOLP4wf3XqiTreKT-zJc8WbkUBrGCc24UZz6BwZEjx4afV_jkiCV7_2I5bL3jHt6rPInl4r5ph_bCgzy4nnzxzbB22jdjgwxdUOBZX07TF4qGxeqqv7vcERHbgYR8CIJdVQQwVVSA2JLx2nL2lGTt_4YrBqAzT0d=s2048?key=9sB5KGCgr7SA4UzQBsPuaA"
  },
  {
    title: "Le Monde est plus grand",
    image: "https://lh7-rt.googleusercontent.com/formsz/AN7BsVCmSCkmShmhbCokXYfceQg9oudB0AXB1JrZd9PZ-1DJ3raV-niLHlG3e1qUilJmCnrd0QRc0umX5V0oJiGdmpPjccKWdwFeMTmpf1nGxrcIylhkNQbjb7qgHQxD0je2vZ1rE2vPNXqUxi8izNg4jKtHq9BKHZxpQwwa7zt0AA=s2048?key=9sB5KGCgr7SA4UzQBsPuaA"
  },
  {
    title: "Je suis rentré chez moi",
    image: "https://lh7-rt.googleusercontent.com/formsz/AN7BsVDhCiWil_Fmg-ms6rhhlNX0iHfE-NQO0Qf691ylGB_RFnF12lVJvKWhN9v9lzOtK4B8F_ii_p9y0k_q-NolLZ12l1bsfIlc7IgNmwJ4frkYsCJnTTrt4024doUenRkj0a9hneStymSi76WCcjMVRIpP7OHOCGzvxeMln1z7yw=s2048?key=9sB5KGCgr7SA4UzQBsPuaA"
  },
  {
    title: "Pourquoi on court ?",
    image: "https://lh7-rt.googleusercontent.com/formsz/AN7BsVD_6xBeKB5F4k7Gx9Bp4EoUeWRpc2x9yWl3_kP7tqOBB7qMEpFul4igq_jsu4ATjbUjof2yEJbLptm2iFw6uM5gw6dPjgKHA00Js6OQo0CAmqyoe0yncqpaJiVgPBpMAX2N30q_nws6M0a6c5c5als5-dPzU_c_TpRoC2au3A=s2048?key=9sB5KGCgr7SA4UzQBsPuaA"
  },
  {
    title: "J'veux sortir",
    image: "https://lh7-rt.googleusercontent.com/formsz/AN7BsVDkhbh4E-pG1KyxRs0IzDFnDb5py4wwFbuggfVLz67sIQ5HbjiYhP1BcGJT6jJ9FfE_cpXXJ1dlL7uX-v1E8Y2szQ-hUBkAA8kFoyqkGc8bMhtZsq-CqhTtTpMw1x6pLRFGVJHqOJod4tzTwwTjkNDlgQkptEb3Sy-tsag3BQ=s2048?key=9sB5KGCgr7SA4UzQBsPuaA"
  },
  {
    title: "Le bruit du silence",
    image: "https://lh7-rt.googleusercontent.com/formsz/AN7BsVAbNBMeF9V2YSVoNjLu296wyLdhXEWHqXdBAzbo6KhahKxUzl55cNl60yrLMzMosOOucFpZOuaAj_Fx_Mk6bThJGDne6rGHjtkE1JpFwtRcaF8nNWkQqfUMvfvZuG773uaUYRCV0h_4AwVvPn77s5B_SxQ7AaNZ6Znz9aIaUw=s2048?key=9sB5KGCgr7SA4UzQBsPuaA"
  },
  {
    title: "J'ai rampé hors du sous-sol",
    image: "https://lh7-rt.googleusercontent.com/formsz/AN7BsVAT1R4kqHVASbqN8tuxtrqCghFmZr8osq9o-bvM6tro7Ycy9xNwuHHK51dEAD978wtzxlBIj2mefdfFqu2-74Y_npsemlZ3-hkOL3VZDIa_U8tX-bbryKAEt8Dm-_RXEBiiBz-5s5oC1azVEro2EVphVIgALHkeuLJIR41Vfw=s2048?key=9sB5KGCgr7SA4UzQBsPuaA"
  },
  {
    title: "On se l'était dit",
    image: "https://lh7-rt.googleusercontent.com/formsz/AN7BsVC3onJqYor6MZmDMxTEe0POoicbei4qUVzxMU-il_X2tZ8N-dr0r5ZOmyrtLTy9QJnGXcblyX6rep6_s8rbZQhlr4aDdE-MeOW--M7w3joIxR5reOs50lz_yfAWxSluZ88e5qjddAt6izzsy5qc3bKJEag_FKr5Yr1jvL182g=s2048?key=9sB5KGCgr7SA4UzQBsPuaA"
  },
  {
    title: "J'ai oublié de vivre",
    image: "https://lh7-rt.googleusercontent.com/formsz/AN7BsVBbYOwtp7AMjvA-HYIzTepFbqginmfeS4sAdJbFjvnw91AhMCHTskpFrXOuDZHQYeKhiu50q10NAbUvL8J1jm1EuXfEEmmcWQijIeZ78xBSKbH1n2lvNry9ZljCVeJC4EmXpykdlICVDkgjix451GC5utn9RRvay09NAzEf=s2048?key=9sB5KGCgr7SA4UzQBsPuaA"
  }
];


const atnGrid = document.getElementById("atnVoteGrid");