import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, push, set, query, orderByChild, limitToLast, onValue }
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// Firebase Console-এর Web App থেকে নিজের config এখানে বসাও.
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://PASTE_YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "PASTE_YOUR_PROJECT",
  storageBucket: "PASTE_YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

let db = null, firebaseReady = false;
try {
  if (!firebaseConfig.apiKey.startsWith("PASTE_")) {
    db = getDatabase(initializeApp(firebaseConfig));
    firebaseReady = true;
  }
} catch (e) { console.error(e); }

const questions = [
 {question:"দুর্গাপূজা সাধারণত কোন মাসে হয়?",correct:"আশ্বিন",wrong:["পৌষ","চৈত্র","জ্যৈষ্ঠ"]},
 {question:"দেবী দুর্গার বাহন কী?",correct:"সিংহ",wrong:["হাতি","ঘোড়া","ময়ূর"]},
 {question:"দেবী দুর্গাকে সাধারণত কয়টি হাতসহ দেখানো হয়?",correct:"দশটি",wrong:["চারটি","ছয়টি","আটটি"]},
 {question:"দুর্গাপূজার কোন দিনটি বিজয়া দশমী নামে পরিচিত?",correct:"দশমী",wrong:["সপ্তমী","অষ্টমী","নবমী"]},
 {question:"গণেশ দেবী দুর্গার কী?",correct:"পুত্র",wrong:["ভাই","স্বামী","বাহন"]},
 {question:"দুর্গাপূজার ষষ্ঠ দিনের নাম কী?",correct:"ষষ্ঠী",wrong:["সপ্তমী","নবমী","দশমী"]},
 {question:"দুর্গাপূজার অষ্টমী ও নবমীর সন্ধিক্ষণে কোন বিশেষ পূজা হয়?",correct:"সন্ধিপূজা",wrong:["রথযাত্রা","দোলযাত্রা","জন্মাষ্টমী"]},
 {question:"লক্ষ্মী দেবী সাধারণভাবে কীসের সঙ্গে সম্পর্কিত?",correct:"সম্পদ ও সমৃদ্ধি",wrong:["শিক্ষা","বৃষ্টি","চিকিৎসা"]},
 {question:"বিজয়া দশমীতে প্রচলিত একটি রীতি কোনটি?",correct:"সিঁদুর খেলা",wrong:["রথযাত্রা","রাখি বন্ধন","হোলি খেলা"]},
 {question:"বিজয়া দশমীর পরে সাধারণত কী করা হয়?",correct:"প্রতিমা বিসর্জন",wrong:["নবান্ন শুরু","রথযাত্রা শুরু","বসন্ত উৎসব"]}
];

let currentQuestion=0, score=0, playerName="", currentOptions=[], answered=false;

const pages={name:document.getElementById("namePage"),quiz:document.getElementById("quizPage"),result:document.getElementById("resultPage"),leaderboard:document.getElementById("leaderboardPage")};
const playerNameInput=document.getElementById("playerName"),nameError=document.getElementById("nameError"),startBtn=document.getElementById("startBtn");
const scoreEl=document.getElementById("score"),progressText=document.getElementById("progressText"),progressBar=document.getElementById("progressBar");
const questionNumber=document.getElementById("questionNumber"),questionText=document.getElementById("questionText"),optionsEl=document.getElementById("options"),answerMessage=document.getElementById("answerMessage"),quizCard=document.getElementById("quizCard"),celebration=document.getElementById("celebration");
const resultName=document.getElementById("resultName"),finalScore=document.getElementById("finalScore"),resultMessage=document.getElementById("resultMessage");
const leaderboardBtn=document.getElementById("leaderboardBtn"),restartBtn=document.getElementById("restartBtn"),leaderboardStatus=document.getElementById("leaderboardStatus"),leaderboardList=document.getElementById("leaderboardList"),backBtn=document.getElementById("backBtn");

function showPage(page){Object.values(pages).forEach(p=>p.classList.remove("active"));pages[page].classList.add("active");window.scrollTo({top:0,behavior:"instant"});}
function randomItem(a){return a[Math.floor(Math.random()*a.length)];}
function shuffle(a){return [...a].sort(()=>Math.random()-.5);}

startBtn.addEventListener("click",startQuiz);
playerNameInput.addEventListener("keydown",e=>{if(e.key==="Enter")startQuiz();});

function startQuiz(){
  const name=playerNameInput.value.trim();
  if(!name){nameError.textContent="দয়া করে তোমার নাম লিখো।";playerNameInput.focus();return;}
  playerName=name.slice(0,25);currentQuestion=0;score=0;scoreEl.textContent="0";nameError.textContent="";
  showPage("quiz");showQuestion();
}

function showQuestion(){
  answered=false;
  const q=questions[currentQuestion];
  currentOptions=shuffle([{text:q.correct,correct:true},{text:randomItem(q.wrong),correct:false}]);
  questionNumber.textContent=String(currentQuestion+1).padStart(2,"0");
  progressText.textContent=`প্রশ্ন ${currentQuestion+1} / ${questions.length}`;
  progressBar.style.width=`${((currentQuestion+1)/questions.length)*100}%`;
  questionText.textContent=q.question;answerMessage.textContent="";
  quizCard.classList.remove("good","bad");optionsEl.innerHTML="";
  currentOptions.forEach((o,i)=>{
    const b=document.createElement("button");b.className="option";b.type="button";
    b.innerHTML=`<span class="option-letter">${i===0?"A":"B"}</span><span>${o.text}</span>`;
    b.addEventListener("click",()=>chooseAnswer(i));optionsEl.appendChild(b);
  });
}

function chooseAnswer(index){
  if(answered)return;answered=true;
  const selected=currentOptions[index], buttons=[...optionsEl.querySelectorAll(".option")];
  buttons.forEach(b=>b.disabled=true);
  if(selected.correct){
    score++;scoreEl.textContent=score;buttons[index].classList.add("correct");
    answerMessage.textContent="🎉 সঠিক উত্তর!";answerMessage.style.color="var(--green)";
    quizCard.classList.add("good");showCelebration();setTimeout(nextQuestion,1000);
  }else{
    buttons[index].classList.add("wrong");
    const ci=currentOptions.findIndex(o=>o.correct);buttons[ci].classList.add("correct");
    answerMessage.textContent="❌ ভুল উত্তর!";answerMessage.style.color="var(--red)";
    quizCard.classList.add("bad");setTimeout(nextQuestion,1300);
  }
}

function nextQuestion(){currentQuestion++;if(currentQuestion>=questions.length)finishQuiz();else showQuestion();}

async function finishQuiz(){
  resultName.textContent=playerName;finalScore.textContent=score;
  resultMessage.textContent=score===10?"🌟 অসাধারণ! সবকটি সঠিক!":score>=7?"🎉 খুব ভালো! দুর্গাপূজা সম্পর্কে তোমার জ্ঞান বেশ ভালো।":score>=5?"👏 ভালো চেষ্টা! আরেকবার খেললে আরও ভালো হবে।":"😊 আবার চেষ্টা করো!";
  showPage("result");await saveScore();
}

async function saveScore(){
  if(!firebaseReady||!db){console.warn("Firebase config নেই; score upload হয়নি.");return;}
  try{
    const newRef=push(ref(db,"scores"));
    await set(newRef,{name:playerName,score:score,total:10,createdAt:Date.now()});
  }catch(e){console.error("Score save failed:",e);}
}

leaderboardBtn.addEventListener("click",openLeaderboard);
function openLeaderboard(){
  showPage("leaderboard");
  if(!firebaseReady||!db){
    leaderboardStatus.textContent="Firebase setup না করলে leaderboard দেখা যাবে না.";
    leaderboardList.innerHTML='<div class="empty-board">script.js-এ Firebase config বসিয়ে refresh করো।</div>';
    return;
  }
  leaderboardStatus.textContent="Leaderboard লোড হচ্ছে...";leaderboardList.innerHTML="";
  const q=query(ref(db,"scores"),orderByChild("score"),limitToLast(50));
  onValue(q,snapshot=>{
    const players=[];
    snapshot.forEach(child=>{const d=child.val();if(d&&typeof d.name==="string")players.push({name:d.name,score:Number(d.score)||0});});
    players.sort((a,b)=>b.score-a.score);
    if(!players.length){leaderboardStatus.textContent="এখনও কোনো score নেই.";leaderboardList.innerHTML='<div class="empty-board">প্রথম player হিসেবে তুমি খেলো! 🎯</div>';return;}
    leaderboardStatus.textContent=`সর্বোচ্চ ${players.length}টি score দেখানো হচ্ছে`;
    leaderboardList.innerHTML="";
    players.forEach((p,i)=>{
      const row=document.createElement("div");row.className="rank-row";
      row.innerHTML=`<div class="rank-number">${i+1}</div><div class="rank-name">${escapeHtml(p.name)}</div><div class="rank-score">${p.score}/10</div>`;
      leaderboardList.appendChild(row);
    });
  },e=>{console.error(e);leaderboardStatus.textContent="Leaderboard লোড করা যায়নি। Firebase Rules/config check করো.";});
}

function escapeHtml(v){return v.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
backBtn.addEventListener("click",()=>showPage("result"));
restartBtn.addEventListener("click",()=>{playerNameInput.value="";score=0;currentQuestion=0;showPage("name");});

function showCelebration(){
  celebration.innerHTML="";const symbols=["✦","✧","•","✺","◆","✿"];
  for(let i=0;i<18;i++){
    const p=document.createElement("span");p.className="confetti";p.textContent=randomItem(symbols);
    p.style.setProperty("--x",`${Math.random()*280-140}px`);p.style.setProperty("--y",`${Math.random()*-260-40}px`);
    p.style.fontSize=`${10+Math.random()*13}px`;celebration.appendChild(p);
  }
  setTimeout(()=>celebration.innerHTML="",1000);
}
