const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const pageTitle = $("#pageTitle"), pageContent = $("#pageContent"), sidebar = $("#sidebar"), toast = $("#toast");
let toastTimer, currentPage="Overview", quizState=null;

const questions = [
 {id:"q1",domain:"Cloud concepts",question:"Which cloud benefit describes the ability to quickly increase or decrease resources to match demand?",options:["High availability","Scalability","Disaster recovery","Governance"],answer:1,explanation:"Scalability is the ability to adjust capacity to changing workload needs. High availability focuses on keeping services accessible."},
 {id:"q2",domain:"Cloud concepts",question:"Which cloud model combines on-premises infrastructure with public cloud services?",options:["Public cloud","Private cloud","Hybrid cloud","Community cloud"],answer:2,explanation:"A hybrid cloud combines private/on-premises environments with public cloud services, allowing data and applications to operate across them."},
 {id:"q3",domain:"Cloud concepts",question:"In a consumption-based cloud model, which cost approach is most typical?",options:["Pay a fixed amount for all future capacity","Pay only for resources consumed","Buy all hardware before deployment","Pay only when a service is unavailable"],answer:1,explanation:"Consumption-based pricing charges for the cloud resources you use, helping shift spending from upfront capital expenditure toward operating expenditure."},
 {id:"q4",domain:"Azure architecture & services",question:"What is an Azure region?",options:["A single physical server","A geographic area containing one or more datacenters","A user permission group","A billing profile"],answer:1,explanation:"An Azure region is a geographic area containing one or more datacenters connected through a dedicated, low-latency network."},
 {id:"q5",domain:"Azure architecture & services",question:"What do availability zones provide within a supported Azure region?",options:["Separate billing accounts","Physically separate datacenter locations with independent power, cooling, and networking","Automatic access permissions","A replacement for every backup"],answer:1,explanation:"Availability zones are physically separate locations within a region, designed to improve resiliency against datacenter-level failures."},
 {id:"q6",domain:"Azure architecture & services",question:"Which Azure service is primarily used to host and manage web applications without managing the underlying servers?",options:["Azure App Service","Azure Policy","Microsoft Entra ID","Azure Cost Management"],answer:0,explanation:"Azure App Service is a platform-as-a-service offering for hosting web apps and APIs while Azure manages much of the underlying infrastructure."},
 {id:"q7",domain:"Azure management & governance",question:"Which Azure service helps enforce organizational standards and assess resource compliance?",options:["Azure Monitor","Azure Policy","Azure Virtual Network","Azure DNS"],answer:1,explanation:"Azure Policy can audit, enforce, and assess resource configurations against organizational rules."},
 {id:"q8",domain:"Azure management & governance",question:"What is the primary purpose of role-based access control (RBAC) in Azure?",options:["Estimate monthly costs","Assign access permissions to users, groups, and applications","Deploy virtual machines automatically","Replicate data between regions"],answer:1,explanation:"Azure RBAC controls who can perform which actions on Azure resources, based on assigned roles and scope."},
 {id:"q9",domain:"Azure management & governance",question:"Which tool helps estimate the cost of Azure products before deployment?",options:["Azure Pricing calculator","Azure Service Health","Azure Advisor","Azure Resource Manager locks"],answer:0,explanation:"The Azure Pricing calculator estimates costs for Azure products and configurations before you deploy."}
];

const seedReviews = [
 {id:"r1",topic:"Azure architecture & services",concept:"Availability zones vs. region pairs",due:"Due today",priority:"High"},
 {id:"r2",topic:"Cloud concepts",concept:"CapEx vs. OpEx",due:"Due today",priority:"Medium"},
 {id:"r3",topic:"Azure management & governance",concept:"Azure Policy vs. RBAC",due:"Due tomorrow",priority:"Medium"}
];
let reviews = [...seedReviews];
let attempts = [];
try { attempts = JSON.parse(localStorage.getItem("cloudreadyAttempts") || "[]"); } catch { attempts=[]; }
try { reviews = JSON.parse(localStorage.getItem("cloudreadyReviews") || "null") || [...seedReviews]; } catch { reviews=[...seedReviews]; }

function save(){try{localStorage.setItem("cloudreadyAttempts",JSON.stringify(attempts));localStorage.setItem("cloudreadyReviews",JSON.stringify(reviews));}catch{}}
function showToast(msg){toast.textContent=msg;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),2400);}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function pageHead(kicker,title,sub){return `<section class="page-heading"><div><p class="eyebrow">${kicker}</p><h1>${title}</h1><p class="subtitle">${sub}</p></div></section>`;}
function nav(page){
 currentPage=page; pageTitle.textContent=page; sidebar.classList.remove("open");
 $$(".nav-item").forEach(b=>{let on=b.dataset.nav===page;b.classList.toggle("active",on);if(on)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");});
 const renderers={Overview:renderOverview,Practice:renderPractice,Revision:renderRevision,Progress:renderProgress,Resources:renderResources};
 (renderers[page]||renderOverview)();
}
function stats(){
 const total=attempts.length, correct=attempts.filter(a=>a.correct).length;
 return {total,accuracy:total?Math.round(correct/total*100):0};
}
function domainStats(domain){
 const rows=attempts.filter(a=>a.domain===domain);
 return rows.length?Math.round(rows.filter(a=>a.correct).length/rows.length*100):0;
}
function renderOverview(){
 const s=stats(), due=reviews.length;
 pageContent.innerHTML=pageHead("YOUR CERTIFICATION JOURNEY","Good afternoon, learner.","Track your AZ-900 progress and keep moving toward your Azure fundamentals certification.")+
 `<section class="hero"><div class="hero-content"><div class="hero-kicker">✧ PERSONALIZED STUDY PLAN</div><h2>Your Azure Study Buddy</h2><p>A focused learning session built around the topics that need your attention most.</p><button class="hero-button" id="heroPractice">▶ &nbsp; Continue learning &nbsp; →</button></div><div class="hero-art"><div class="hero-cloud">☁</div></div><div class="hero-glow"></div></section>
 <section class="stat-grid">
 <article class="stat-card"><div class="stat-top"><span class="stat-icon blue">◉</span><span class="stat-label">Practice readiness</span></div><div class="stat-value">${s.total?Math.min(100,Math.round(s.accuracy*.9+Math.min(s.total,30)/3)):76}<span class="stat-unit">/100</span></div><div class="stat-foot"><span class="positive">${s.total?"Based on your attempts":"Sample score · demo"}</span></div></article>
 <article class="stat-card"><div class="stat-top"><span class="stat-icon violet">▣</span><span class="stat-label">Practice accuracy</span></div><div class="stat-value">${s.total?s.accuracy:78}<span class="stat-unit">%</span></div><div class="stat-foot">${s.total?"Calculated from your answers":"Illustrative sample"}</div></article>
 <article class="stat-card"><div class="stat-top"><span class="stat-icon cyan">✦</span><span class="stat-label">Questions answered</span></div><div class="stat-value">${s.total||42}</div><div class="stat-foot">${s.total?"Your recorded attempts":"Sample activity"}</div></article>
 <article class="stat-card"><div class="stat-top"><span class="stat-icon amber">↻</span><span class="stat-label">Reviews due</span></div><div class="stat-value">${due}</div><div class="stat-foot"><span class="due-dot"></span>Reinforce missed concepts</div></article></section>
 <section class="content-grid"><article class="panel"><div class="panel-heading"><div class="heading-icon">⌁</div><div><p class="section-kicker">SKILL PROGRESS</p><h3>Learning path</h3></div><button class="text-button" data-route="Progress">View progress →</button></div>
 <div class="weakest-callout"><div><strong>Your next focus</strong><p>Practice your weakest AZ-900 domain and review the explanations.</p></div><button class="small-primary" id="focusPractice">Practice topic</button></div>
 ${renderDomainRows()}<div class="panel-footer"><span>Domain accuracy from recorded practice attempts.</span><span>● Topic mastery</span></div></article>
 <article class="panel"><div class="panel-heading"><div class="heading-icon">↻</div><div><p class="section-kicker">SMART REVISION</p><h3>Review queue <span class="pill">${due}</span></h3></div></div><p class="panel-description">Revisit missed concepts while they’re still fresh.</p>${renderReviewItems()}<button class="revision-button" data-route="Revision">Open revision queue →</button></article></section>
 <section class="bottom-grid"><article class="panel"><div class="panel-heading"><div class="heading-icon">◷</div><div><p class="section-kicker">RECENT ACTIVITY</p><h3>Keep the momentum</h3></div></div><div class="activity-line"><span class="positive">●</span><div><strong>${s.total?"Practice attempts recorded":"Start your first practice session"}</strong><small>${s.total?`${s.total} answers submitted`:"Take a short quiz to establish your baseline."}</small></div></div><div class="activity-line"><span style="color:#8a61e4">●</span><div><strong>Revision queue</strong><small>${due} concepts waiting for review</small></div></div></article><article class="tip-card"><p class="section-kicker">STUDY TIP</p><h3>Understand the “why,” not just the answer.</h3><p>After each question, learn why the correct option fits and why the distractors do not.</p><button class="tip-link" data-route="Resources">Explore official study resources →</button></article></section>`;
 bindRoutes(); $("#heroPractice").onclick=()=>nav("Practice");$("#focusPractice").onclick=()=>nav("Practice");
}
function renderDomainRows(){
 const domains=["Cloud concepts","Azure architecture & services","Azure management & governance"];
 const fallback=[85,68,76];
 return domains.map((d,i)=>{let p=attempts.length?domainStats(d):fallback[i];return `<div class="domain-row"><div class="domain-name"><span class="domain-symbol">${["☁","◇","⌘"][i]}</span><div><strong>${d}</strong><small>${attempts.filter(a=>a.domain===d).length||[13,16,13][i]} questions attempted ${i===1?"· Focus area":""}</small></div></div><div class="domain-progress"><div class="progress-track"><i style="width:${p}%"></i></div><strong>${p}%</strong></div></div>`}).join("");
}
function renderReviewItems(){
 if(!reviews.length)return `<div class="empty-state"><h3>Queue cleared!</h3><p>Great work. Practice more questions to add concepts for revision.</p></div>`;
 return reviews.slice(0,4).map(r=>`<div class="review-item"><span class="review-mark">${r.priority==="High"?"!":"↻"}</span><div class="review-copy"><strong>${esc(r.concept)}</strong><small>${esc(r.topic)} · ${esc(r.due)}</small></div><button class="review-done" data-review-done="${r.id}" title="Mark reviewed">✓</button></div>`).join("");
}
function renderPractice(){
 quizState={list:[...questions],index:0,answers:[],selected:null,finished:false};
 pageContent.innerHTML=pageHead("PRACTICE HUB","Practice AZ-900","Try original practice questions aligned to the three AZ-900 knowledge domains. These are not real exam questions.")+
 `<div class="page-toolbar"><select id="quizFilter" class="filter-select"><option value="all">All domains · ${questions.length} questions</option><option>Cloud concepts</option><option>Azure architecture & services</option><option>Azure management & governance</option></select><span class="muted">Instant feedback · Explanations included</span></div><div id="quizMount"></div>`;
 $("#quizFilter").onchange=e=>{const v=e.target.value;quizState={list:v==="all"?[...questions]:questions.filter(q=>q.domain===v),index:0,answers:[],selected:null,finished:false};drawQuestion();};
 drawQuestion();
}
function drawQuestion(){
 const mount=$("#quizMount"),q=quizState.list[quizState.index];
 if(!q){mount.innerHTML=`<div class="quiz-card result-box"><p class="section-kicker">SESSION COMPLETE</p><h2>Practice session finished</h2><div class="result-score">${quizState.answers.filter(a=>a.correct).length}/${quizState.list.length}</div><p>You answered ${quizState.answers.filter(a=>a.correct).length} correctly out of ${quizState.list.length}. Review the explanations, then practise another domain.</p><button class="primary-button" id="again">Try another session</button> <button class="secondary-button" id="goRevision">Review queue</button></div>`;$("#again").onclick=()=>nav("Practice");$("#goRevision").onclick=()=>nav("Revision");return;}
 const selected=quizState.selected,answered=selected!==null;
 mount.innerHTML=`<article class="quiz-card"><div class="quiz-meta"><span>${esc(q.domain)}</span><span>Question ${quizState.index+1} of ${quizState.list.length}</span></div><div class="quiz-progress"><span style="width:${(quizState.index/quizState.list.length)*100}%"></span></div><h2>${esc(q.question)}</h2><div class="answer-options">${q.options.map((o,i)=>{let cls="";if(answered&&i===q.answer)cls=" correct";else if(answered&&i===selected)cls=" incorrect";return `<button class="answer-option${cls}" data-answer="${i}" ${answered?"disabled":""}><span class="option-letter">${String.fromCharCode(65+i)}</span>${esc(o)}</button>`}).join("")}</div>${answered?`<div class="feedback ${selected===q.answer?"good":"bad"}"><strong>${selected===q.answer?"Correct!":"Not quite."}</strong> ${esc(q.explanation)}</div><div class="quiz-actions"><button class="primary-button" id="nextQuestion">${quizState.index===quizState.list.length-1?"See results":"Next question →"}</button></div>`:"<p class=\"muted\" style=\"font-size:11px;margin-top:16px\">Choose an answer to see feedback and an explanation.</p>"}</article>`;
 $$(".answer-option",mount).forEach(b=>b.onclick=()=>chooseAnswer(Number(b.dataset.answer)));
 if(answered)$("#nextQuestion").onclick=()=>{quizState.index++;quizState.selected=null;drawQuestion();};
}
function chooseAnswer(index){
 const q=quizState.list[quizState.index];quizState.selected=index;
 const attempt={questionId:q.id,domain:q.domain,selected:index,correct:index===q.answer,at:new Date().toISOString()};
 attempts.push(attempt);quizState.answers.push(attempt);
 if(index!==q.answer){const exists=reviews.some(r=>r.concept===q.question);if(!exists)reviews.unshift({id:"auto-"+q.id,topic:q.domain,concept:q.question,due:"Added just now",priority:"High"});}
 save();drawQuestion();
}
function renderRevision(){
 pageContent.innerHTML=pageHead("SPACED REVISION","Revision queue","Review concepts you missed or chose to revisit. Mark an item complete after you can explain it in your own words.")+
 `<div class="panel"><div class="panel-heading"><div class="heading-icon">↻</div><div><p class="section-kicker">YOUR REVIEW LIST</p><h3>${reviews.length} concepts to revisit</h3></div><button class="text-button" id="revQuiz">Practice quiz →</button></div><p class="panel-description">Demo behavior: completing an item removes it from this queue. A production version should schedule the next review interval.</p>${reviews.length?`<div style="overflow-x:auto"><table class="review-table"><thead><tr><th>Concept</th><th>Domain</th><th>Timing</th><th>Priority</th><th></th></tr></thead><tbody>${reviews.map(r=>`<tr><td><strong>${esc(r.concept)}</strong></td><td>${esc(r.topic)}</td><td>${esc(r.due)}</td><td><span class="pill">${r.priority}</span></td><td><button class="small-primary" data-complete="${r.id}">Mark done</button></td></tr>`).join("")}</tbody></table></div>`:`<div class="empty-state"><h3>Nothing due right now</h3><p>Take another practice quiz; missed answers can be added here.</p></div>`}</div>`;
 $("#revQuiz").onclick=()=>nav("Practice");
 $$("[data-complete]").forEach(b=>b.onclick=()=>{reviews=reviews.filter(r=>r.id!==b.dataset.complete);save();renderRevision();updateDueBadge();showToast("Revision item completed.");});
}
function renderProgress(){
 const s=stats();
 pageContent.innerHTML=pageHead("PERFORMANCE","Your progress","Track practice outcomes by AZ-900 domain. Your stats update as you answer questions.")+
 `<div class="progress-summary"><article class="stat-card"><p class="stat-label">Answered</p><div class="stat-value">${s.total||0}</div><div class="stat-foot">Recorded questions</div></article><article class="stat-card"><p class="stat-label">Accuracy</p><div class="stat-value">${s.total?s.accuracy:0}%</div><div class="stat-foot">Correct responses</div></article><article class="stat-card"><p class="stat-label">Revision items</p><div class="stat-value">${reviews.length}</div><div class="stat-foot">Waiting to review</div></article></div>
 <div class="panel"><div class="panel-heading"><div class="heading-icon">▥</div><div><p class="section-kicker">DOMAIN BREAKDOWN</p><h3>Mastery by objective area</h3></div></div><p class="panel-description">Before practice attempts are recorded, bars use illustrative demo values. Once you answer questions, domain accuracy reflects your recorded responses.</p>${["Cloud concepts","Azure architecture & services","Azure management & governance"].map((d,i)=>{let p=attempts.length?domainStats(d):[85,68,76][i],n=attempts.filter(a=>a.domain===d).length;return `<div class="progress-topic"><header><span>${d}</span><span>${p}%</span></header><div class="progress-track"><i style="width:${p}%"></i></div><p class="muted" style="font-size:10px;margin:9px 0 0">${n} recorded attempts</p></div>`}).join("")}<div class="notice">Readiness is a practice indicator only. It is not an official Microsoft score or a guarantee of passing the certification exam.</div></div>`;
}
function renderResources(){
 const resources=[
 ["Official AZ-900 study guide","Review the skills measured and exam domains from Microsoft's current study guide.","https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900"],
 ["Azure fundamentals learning path","Learn cloud concepts, Azure architecture, services, and management fundamentals.","https://learn.microsoft.com/en-us/training/paths/az-900-describe-cloud-concepts/"],
 ["Azure architecture and services","Explore core architectural components and common Azure services.","https://learn.microsoft.com/en-us/training/paths/az-900-describe-azure-architecture-services/"],
 ["Azure management and governance","Study governance, compliance, cost management, and monitoring topics.","https://learn.microsoft.com/en-us/training/paths/az-900-describe-azure-management-governance/"]
 ];
 pageContent.innerHTML=pageHead("STUDY LIBRARY","Learning resources","Use official Microsoft Learn materials alongside CloudReady practice. External links open in a new tab.")+
 `<div class="resource-list">${resources.map(([t,d,u])=>`<article class="resource-card"><span class="pill">Microsoft Learn</span><h3>${t}</h3><p>${d}</p><a href="${u}" target="_blank" rel="noopener noreferrer">Open learning resource ↗</a></article>`).join("")}</div><p class="notice" style="margin-top:15px">Practice questions in this demo are original study prompts. For exam preparation, verify objectives and terminology against the current official study guide.</p>`;
}
function bindRoutes(){$$("[data-route]").forEach(b=>b.onclick=()=>nav(b.dataset.route));}
function updateDueBadge(){$("#navDue").textContent=reviews.length;}
$$("[data-nav]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();nav(b.dataset.nav);}));
$("#mobileMenu").onclick=()=>sidebar.classList.toggle("open");
$("#resetButton").onclick=()=>{if(confirm("Reset saved practice attempts and revision queue for this demo?")){attempts=[];reviews=[...seedReviews];save();updateDueBadge();nav("Overview");showToast("Demo progress reset.");}};
updateDueBadge();nav("Overview");
