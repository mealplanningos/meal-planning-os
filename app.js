//   DATA
// ╚═══════════════════════════════════════╝
const K = {
  recipes:'mpos_recipes_v2', weekNotes:'mpos_notes_v2',
  mealPlan:'mpos_plan_v2', staples:'mpos_staples_v2',
  flexItems:'mpos_flex_v2', freezer:'mpos_freezer_v2',
  checks:'mpos_checks_v2', adhocItems:'mpos_adhoc_v2',
};

const DAYS = ['monday','tuesday','wednesday','thursday','friday'];
const DAY_FULL = {monday:'Monday',tuesday:'Tuesday',wednesday:'Wednesday',thursday:'Thursday',friday:'Friday'};
const MEALS = ['breakfast','lunch','dinner'];
const MEAL_ICON = {breakfast:'🌅',lunch:'☀️',dinner:'🌙'};
const CATS = ['Produce','Protein','Grains & Breads','Dairy / Dairy-Free','Pantry & Seasonings','Freezer / Flex','Snacks / Extras'];
const CAT_ICON = {'Produce':'🥬','Protein':'🍗','Grains & Breads':'🌾','Dairy / Dairy-Free':'🥛','Pantry & Seasonings':'🧂','Freezer / Flex':'❄️','Snacks / Extras':'🥜'};

const MEAL_CATEGORIES = [
  {id:'goto',        icon:'⚡', name:'Go-To Meal',       sub:'Your reliable, no-decision choice'},
  {id:'experimental',icon:'✨', name:'Experimental Meal', sub:'Trying something new'},
  {id:'freezer',     icon:'❄️', name:'Freezer Meal',      sub:'Pull from your freezer'},
  {id:'leftovers',   icon:'🍱', name:'Leftovers',         sub:'Based on another meal this week'},
  {id:'eatingout',   icon:'🥡', name:'Eating Out',        sub:'Takeout, delivery, or dining out'},
];

// Starter recipes — seeded into new users' No-Decision Menu on first visit.
// Uses libraryId so "already added" detection works correctly in the library.
const STARTER_RECIPES = [
  {id:'sr1', libraryId:'lb13', type:'goto', name:'Overnight Oatmeal', servings:5,
   notes:'Add 1 cup oats and 1 cup milk to each jar. Stir well.\nAdd mixed berries.\nSeal jars.\nRefrigerate overnight. Grab and go — no reheating needed.\n(Optional) Add other ingredients like banana, protein powder, or chia seeds.',
   ingredients:[
     {name:'Oats',         qty:'1 cup', category:'Grains & Breads'},
     {name:'Milk',         qty:'1 cup', category:'Dairy / Dairy-Free'},
     {name:'Mixed Berries',qty:'½ cup', category:'Produce'},
   ]},
  {id:'sr2', libraryId:'lb15', type:'goto', name:'Spaghetti', servings:4,
   notes:'Boil salted water and cook spaghetti until al dente. Drain and set aside.\nPour marinara sauce into a separate pot. Simmer for 5 minutes.\nToss with pasta.\nOptional – Top with parmesan and serve with warm bread.\nTip – Freeze leftover sauce for a future no-effort dinner. Use the "Freezer" tab to log it.',
   ingredients:[
     {name:'Spaghetti',      qty:'12 oz', category:'Grains & Breads'},
     {name:'Marinara Sauce', qty:'1 jar', category:'Pantry & Seasonings'},
     {name:'(Optional) Parmesan',     qty:'¼ cup', category:'Dairy / Dairy-Free'},
     {name:'(Optional) Italian Bread',qty:'1 Loaf',category:'Grains & Breads'},
   ]},
  {id:'sr3', libraryId:'lb21', type:'experimental', name:'Chicken & Bean Burrito', servings:3,
   notes:'Cook rice according to package instructions.\nSeason chicken with seasonings. Cook in a pan with oil until done, then shred or chop.\nWarm drained black beans in a small pot with a pinch of seasonings.\nWarm tortillas in a pan or microwave. Layer rice, chicken, beans, cheese, and salsa.\nFold and wrap tightly. Heat all sides in the same pan with oil or butter – until browned.\nEat immediately or wrap in foil for later.\nTips – Increase serving size to batch cook, and freeze for your busiest weeknights.',
   ingredients:[
     {name:'Large Tortillas', qty:'3',      category:'Grains & Breads'},
     {name:'Chicken Breast',  qty:'1 lb',   category:'Protein'},
     {name:'Black Beans',     qty:'1 can',  category:'Protein'},
     {name:'Rice',            qty:'1 cup',  category:'Grains & Breads'},
     {name:'Shredded Cheese', qty:'½ cup',  category:'Dairy / Dairy-Free'},
     {name:'Salsa',           qty:'½ cup',  category:'Pantry & Seasonings'},
     {name:'Cumin',           qty:'1 tsp',  category:'Pantry & Seasonings'},
     {name:'Paprika',         qty:'1 tsp',  category:'Pantry & Seasonings'},
     {name:'Garlic Powder',   qty:'1 tsp',  category:'Pantry & Seasonings'},
     {name:'Salt & Pepper',   qty:'to taste',category:'Pantry & Seasonings'},
     {name:'Oil',             qty:'1 TBSP', category:'Pantry & Seasonings'},
   ]},
];

// ── RECIPE LIBRARY ─────────────────────────────────────────────────────────
// Curated by Meal Planning OS. These are read-only — users copy them into
// their own No-Decision Menu. libraryId is preserved on the copy so we can detect
// "already added" without a name match.
const LIBRARY_RECIPES = [

  // ── GO-TO MEALS ────────────────────────────────────────────────────────
  {id:'lb13', type:'goto', name:'Overnight Oatmeal', servings:5,
   tags:['Under 15 Min','Under 30 Min','Batch Cook'],
   notes:'Make 5 jars in under 10 minutes.',
   ingredients:[
     {name:'Oats',         qty:'1 cup', category:'Grains & Breads'},
     {name:'Milk',         qty:'1 cup', category:'Dairy / Dairy-Free'},
     {name:'Mixed Berries',qty:'½ cup', category:'Produce'},
   ],
   steps:'Add 1 cup oats and 1 cup milk to each jar. Stir well.\nAdd mixed berries.\nSeal jars.\nRefrigerate overnight. Grab and go — no reheating needed.\n(Optional) Add other ingredients like banana, protein powder, or chia seeds.'},

  {id:'lb14', type:'goto', name:'Tacos', servings:4,
   tags:['Under 15 Min','Under 30 Min'],
   notes:'Keep tortillas, protein, and toppings stocked. Done in under 15 minutes on any weeknight.',
   ingredients:[
     {name:'Small Tortillas',              qty:'8',       category:'Grains & Breads'},
     {name:'Protein of Choice (for tacos)',qty:'16 oz',   category:'Protein'},
     {name:'Taco Seasoning',               qty:'1 packet',category:'Pantry & Seasonings'},
     {name:'Salt & Pepper',                qty:'to taste',category:'Pantry & Seasonings'},
     {name:'Shredded Cheese',              qty:'½ cup',   category:'Dairy / Dairy-Free'},
     {name:'Onion',                        qty:'½',       category:'Produce'},
     {name:'Salsa',                        qty:'1 Jar',   category:'Pantry & Seasonings'},
     {name:'Limes',                        qty:'2',       category:'Produce'},
     {name:'(Optional) Tortilla Chips',    qty:'1 Bag',   category:'Pantry & Seasonings'},
     {name:'Oil',                          qty:'1 TBSP',  category:'Pantry & Seasonings'},
   ],
   steps:'Saute diced onions and brown protein in a skillet over medium-high heat. Drain fat – if needed.\nAdd taco seasoning. Stir and simmer for 2 minutes.\nWarm tortillas in a dry pan or microwave for 30 seconds.\nAssemble — protein, cheese, salsa, squeeze of lime.\nTip – You can switch up your protein: ground beef, sliced steak, chicken, tofu, seitan, etc.'},

  {id:'lb15', type:'goto', name:'Spaghetti', servings:4,
   tags:['Under 15 Min','Under 30 Min'],
   notes:'The ultimate reliable weeknight meal.',
   ingredients:[
     {name:'Spaghetti',               qty:'12 oz', category:'Grains & Breads'},
     {name:'Marinara Sauce',          qty:'1 jar',  category:'Pantry & Seasonings'},
     {name:'(Optional) Parmesan',     qty:'¼ cup',  category:'Dairy / Dairy-Free'},
     {name:'(Optional) Italian Bread',qty:'1 Loaf', category:'Grains & Breads'},
   ],
   steps:'Boil salted water and cook spaghetti until al dente. Drain and set aside.\nPour marinara sauce into a separate pot. Simmer for 5 minutes.\nToss with pasta.\nOptional – Top with parmesan and serve with warm bread.\nTip – Freeze leftover sauce for a future no-effort dinner. Use the "Freezer" tab to log it.'},

  {id:'lb16', type:'goto', name:'Green Detox Smoothie', servings:1,
   tags:['Under 15 Min','Under 30 Min'],
   notes:'Clean, energizing, and zero cooking required.',
   ingredients:[
     {name:'Spinach',    qty:'2 cups', category:'Produce'},
     {name:'Banana',     qty:'1',      category:'Produce'},
     {name:'Apple',      qty:'½',      category:'Produce'},
     {name:'Ginger',     qty:'½ tsp',  category:'Pantry & Seasonings'},
     {name:'Lemon Juice',qty:'1 tbsp', category:'Pantry & Seasonings'},
     {name:'Water',      qty:'1 cup',  category:'Pantry & Seasonings'},
   ],
   steps:'Add all ingredients to a blender.\nBlend on high 30–45 seconds until smooth.\nTaste and adjust — more lemon for tang, more banana for sweetness.'},

  {id:'lb17', type:'goto', name:'Red Lentil Soup', servings:4,
   tags:['Batch Cook','Freezer Friendly'],
   notes:'One of the best meal-prep investments you can make.',
   ingredients:[
     {name:'Red Lentils',  qty:'1 cup',   category:'Protein'},
     {name:'Veggie Broth', qty:'4 cups',  category:'Pantry & Seasonings'},
     {name:'Water',        qty:'1.5 Cups',category:'Pantry & Seasonings'},
     {name:'Onion',        qty:'1',       category:'Produce'},
     {name:'Garlic',       qty:'4 cloves',category:'Produce'},
     {name:'Large Carrots',qty:'2',       category:'Produce'},
     {name:'Sweet Potatoes',qty:'2',      category:'Produce'},
     {name:'Celery',       qty:'2',       category:'Produce'},
     {name:'Lemon',        qty:'1',       category:'Produce'},
     {name:'Tomato Paste', qty:'1 TBSP',  category:'Pantry & Seasonings'},
     {name:'Cumin',        qty:'1 tsp',   category:'Pantry & Seasonings'},
     {name:'Chili Powder', qty:'1 tsp',   category:'Pantry & Seasonings'},
     {name:'Salt & Pepper',qty:'to taste',category:'Pantry & Seasonings'},
     {name:'Olive Oil',    qty:'2 tbsp',  category:'Pantry & Seasonings'},
   ],
   steps:'Dice onion, carrots, and celery. Cube sweet potatoes, and mince garlic. Sauté in olive oil over medium heat for 3-5 minutes.\nAdd seasonings – and stir for 30 seconds until fragrant.\nAdd lentils and veggie broth. Bring to a boil.\nReduce heat and simmer for 20-25 minutes until lentils are soft, and potatoes are fork tender.\nBlend partially for creamier texture (optional). Season to taste. Freeze extras in portions.\nTip – Add everything into a crock pot or instant pot instead. Just set it, and forget it.'},

  // ── EXPERIMENTAL MEALS ─────────────────────────────────────────────────
  {id:'lb18', type:'experimental', name:'One Pot Jambalaya', servings:6,
   tags:['One Pan','Batch Cook','Freezer Friendly'],
   notes:'Everything goes in one pot. Big flavor, big batch.',
   ingredients:[
     {name:'Andouille Sausage',qty:'12 oz',   category:'Protein'},
     {name:'Chicken Thighs',   qty:'1 lb',    category:'Protein'},
     {name:'Rice',             qty:'1½ cups', category:'Grains & Breads'},
     {name:'Diced Tomatoes',   qty:'1 can',   category:'Pantry & Seasonings'},
     {name:'Bell Pepper',      qty:'1',       category:'Produce'},
     {name:'Celery',           qty:'2 stalks',category:'Produce'},
     {name:'Onion',            qty:'1',       category:'Produce'},
     {name:'Cajun Seasoning',  qty:'2 tsp',   category:'Pantry & Seasonings'},
     {name:'Chicken Broth',    qty:'2 cups',  category:'Pantry & Seasonings'},
     {name:'Salt & Pepper',    qty:'to taste',category:'Pantry & Seasonings'},
   ],
   steps:'Cut meat into chunks. Brown sausage first – then chicken separately, in a large pot over medium-high heat. Set both aside.\nIn the same pot – sauté diced onion, bell pepper, and celery until softened, about 3-4 minutes.\nReturn meat to pot. Add diced tomatoes, cajun seasoning, and chicken broth. Stir to combine.\nStir in rice. Bring to a boil, cover and simmer for 20-25 minutes.\nFluff with a fork. Freeze extras in individual portions.'},

  {id:'lb19', type:'experimental', name:'Crustless Egg Quiche', servings:6,
   tags:['Batch Cook','One Pan'],
   notes:'Bake once, eat all week.',
   ingredients:[
     {name:'Eggs',           qty:'8',       category:'Protein'},
     {name:'Milk',           qty:'½ cup',   category:'Dairy / Dairy-Free'},
     {name:'Spinach',        qty:'2 cups',  category:'Produce'},
     {name:'Shredded Cheese',qty:'½ cup',   category:'Dairy / Dairy-Free'},
     {name:'Cherry Tomatoes',qty:'½ cup',   category:'Produce'},
     {name:'Onion',          qty:'½',       category:'Produce'},
     {name:'Salt & Pepper',  qty:'to taste',category:'Pantry & Seasonings'},
     {name:'Oil',            qty:'2 TBSP',  category:'Pantry & Seasonings'},
   ],
   steps:'Preheat the oven to 375°F. Grease a baking dish (use oil or butter).\nWhisk eggs and milk together. Season with salt and pepper.\nFold in spinach, cherry tomatoes, diced onion, and shredded cheese.\nPour into the dish and bake for 30–35 minutes until set in the center.\nSlice into portions. Reheat in the microwave for 60–90 seconds – to serve.'},

  {id:'lb20', type:'experimental', name:'Egg White Breakfast Burrito', servings:2,
   tags:['Under 15 Min','Under 30 Min','Freezer Friendly','Batch Cook'],
   notes:'High protein and faster than stopping for one.',
   ingredients:[
     {name:'Large Tortillas',qty:'2',       category:'Grains & Breads'},
     {name:'Egg Whites',     qty:'6',       category:'Protein'},
     {name:'Black Beans',    qty:'½ cup',   category:'Protein'},
     {name:'Shredded Cheese',qty:'¼ cup',   category:'Dairy / Dairy-Free'},
     {name:'Salsa',          qty:'¼ cup',   category:'Pantry & Seasonings'},
     {name:'Avocado',        qty:'½',       category:'Produce'},
     {name:'Butter',         qty:'1 TBSP',  category:'Dairy / Dairy-Free'},
     {name:'Salt & Pepper',  qty:'to taste',category:'Pantry & Seasonings'},
   ],
   steps:'Cook egg whites in a non-stick pan over medium heat with butter. Season with salt & pepper.\nAdd black beans and cheese into eggs.\nWarm tortilla in a dry pan for 30 seconds.\nLayer egg mixture, salsa, and sliced avocado on the tortilla.\nFold and wrap tightly. Heat all sides in the same pan with oil or butter – until browned.\nEat immediately or wrap in foil for later.\nTips – Increase serving size to batch cook, and freeze for your busiest mornings.'},

  {id:'lb21', type:'experimental', name:'Chicken & Bean Burrito', servings:3,
   tags:['Batch Cook','Under 30 Min','Freezer Friendly'],
   notes:'Double the batch and wrap extras in foil — they freeze perfectly.',
   ingredients:[
     {name:'Large Tortillas',qty:'3',       category:'Grains & Breads'},
     {name:'Chicken Breast', qty:'1 lb',    category:'Protein'},
     {name:'Black Beans',    qty:'1 can',   category:'Protein'},
     {name:'Rice',           qty:'1 cup',   category:'Grains & Breads'},
     {name:'Shredded Cheese',qty:'½ cup',   category:'Dairy / Dairy-Free'},
     {name:'Salsa',          qty:'½ cup',   category:'Pantry & Seasonings'},
     {name:'Cumin',          qty:'1 tsp',   category:'Pantry & Seasonings'},
     {name:'Paprika',        qty:'1 tsp',   category:'Pantry & Seasonings'},
     {name:'Garlic Powder',  qty:'1 tsp',   category:'Pantry & Seasonings'},
     {name:'Salt & Pepper',  qty:'to taste',category:'Pantry & Seasonings'},
     {name:'Oil',            qty:'1 TBSP',  category:'Pantry & Seasonings'},
   ],
   steps:'Cook rice according to package instructions.\nSeason chicken with seasonings. Cook in a pan with oil until done, then shred or chop.\nWarm drained black beans in a small pot with a pinch of seasonings.\nWarm tortillas in a pan or microwave. Layer rice, chicken, beans, cheese, and salsa.\nFold and wrap tightly. Heat all sides in the same pan with oil or butter – until browned.\nEat immediately or wrap in foil for later.\nTips – Increase serving size to batch cook, and freeze for your busiest weeknights.'},

  {id:'lb22', type:'experimental', name:'Beef & Broccoli', servings:4,
   tags:['Under 30 Min','One Pan'],
   notes:'Better than takeout and ready in 25 minutes.',
   ingredients:[
     {name:'Flank Steak',  qty:'1 lb',    category:'Protein'},
     {name:'Broccoli',     qty:'3 cups',  category:'Produce'},
     {name:'Soy Sauce',    qty:'¼ cup',   category:'Pantry & Seasonings'},
     {name:'Garlic',       qty:'3 cloves',category:'Produce'},
     {name:'Ginger',       qty:'1 tsp',   category:'Pantry & Seasonings'},
     {name:'Sesame Oil',   qty:'1 tbsp',  category:'Pantry & Seasonings'},
     {name:'Cornstarch',   qty:'2 tbsp',  category:'Pantry & Seasonings'},
     {name:'Rice',         qty:'2 cups',  category:'Grains & Breads'},
     {name:'Salt & Pepper',qty:'to taste',category:'Pantry & Seasonings'},
   ],
   steps:'Cook rice according to package instructions.\nSlice flank steak thin against the grain. Toss with cornstarch, salt, and pepper.\nSear beef in sesame oil over high heat 2–3 minutes until browned. Set aside.\nStir-fry broccoli in the same pan for 3 minutes.\nReturn beef to the pan. Add soy sauce, minced garlic, and ginger. Toss and cook for 1–2 minutes.\nServe over rice.\nTips – Use alternative proteins in place of steak, or substitute another vegetable as needed.'},
];

const DEFAULT_STAPLES = [
  {id:'st1',name:'Eggs'},
  {id:'st2',name:'Bread'},
  {id:'st3',name:'Olive Oil'},
];
const DEFAULT_FLEX = [
  {id:'fl1',name:'Rotisserie chicken'},
  {id:'fl2',name:'Canned soup'},
  {id:'fl3',name:'Frozen pizza'},
];

function load(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch{return d;}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}
function uid(){return Math.random().toString(36).substr(2,9);}

let recipes    = load(K.recipes, null);
let weekNotes  = load(K.weekNotes, {});
let mealPlan   = load(K.mealPlan, {});
let staples    = load(K.staples, DEFAULT_STAPLES);
let flexItems  = load(K.flexItems, DEFAULT_FLEX);
let freezer    = load(K.freezer, []);
let checks     = load(K.checks, {});
let adhocItems = load(K.adhocItems, []);

// First visit — seed with 3 starter meals so the app feels alive immediately
if (recipes === null) { recipes = STARTER_RECIPES.map(r=>({...r,ingredients:r.ingredients.map(i=>({...i}))})); save(K.recipes, recipes); }

// ╔═══════════════════════════════════════╗
//   NAV
// ╚═══════════════════════════════════════╝
function switchTab(id){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  const idx={step1:0,step3:1,step4:2,step2:3,freezer:4,library:5}[id];
  document.querySelectorAll('.nav-tab')[idx].classList.add('active');
  if(id==='library') renderLibrary();
  if(id==='step3') renderMealPlan();
  if(id==='step4') renderGrocery();
  if(id==='freezer') renderFreezer();
  localStorage.setItem('mpos_active_tab', id);
}

// ╔═══════════════════════════════════════╗
//   RECIPE LIBRARY
// ╚═══════════════════════════════════════╝
let _libFilter='all';
let _libTagFilter='';

function renderLibrary(){
  // ── Meal type filter ─────────────────────────────────────────────────────
  const filterEl=document.getElementById('libFilters');
  const filters=[
    {id:'all',          label:'All'},
    {id:'goto',         label:'⚡ Go-To Meal'},
    {id:'experimental', label:'✨ Experimental'},
  ];
  // ── Tag filter (derived from all recipes) ────────────────────────────────
  const allTags=[...new Set(LIBRARY_RECIPES.flatMap(r=>r.tags||[]))];
  filterEl.innerHTML=`
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">
      ${filters.map(f=>`<button class="lib-filter-btn${_libFilter===f.id?' active':''}" onclick="_libFilter='${f.id}';renderLibrary()">${f.label}</button>`).join('')}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      <button class="lib-filter-btn lib-filter-tag${_libTagFilter===''?' active':''}" onclick="_libTagFilter='';renderLibrary()">All Tags</button>
      ${allTags.map(t=>`<button class="lib-filter-btn lib-filter-tag${_libTagFilter===t?' active':''}" onclick="_libTagFilter='${t}';renderLibrary()">${t}</button>`).join('')}
    </div>`;

  // ── Recipe grid ─────────────────────────────────────────────────────────
  const grid=document.getElementById('libGrid');
  let filtered=_libFilter==='all'?LIBRARY_RECIPES:LIBRARY_RECIPES.filter(r=>r.type===_libFilter);
  if(_libTagFilter) filtered=filtered.filter(r=>(r.tags||[]).includes(_libTagFilter));
  grid.innerHTML='';

  filtered.forEach(lr=>{
    // State checks
    const alreadyAdded=recipes.some(r=>r.libraryId===lr.id);
    const typeCount=recipes.filter(r=>r.type===lr.type).length;
    const catFull=!alreadyAdded && typeCount>=3;

    // Ingredient preview (first 4)
    const ingList=lr.ingredients.slice(0,4).map(i=>i.name).join(', ')
      +(lr.ingredients.length>4?` +${lr.ingredients.length-4} more`:'');

    // Servings label
    const srvLabel=lr.servings===1?'1 serving':''+lr.servings+' servings per batch';

    // Type badge
    const typeLabels={goto:'⚡ Go-To Meal',experimental:'✨ Experimental'};
    const typeName=typeLabels[lr.type]||(lr.type.charAt(0).toUpperCase()+lr.type.slice(1));
    const typeClass='lib-type-'+(lr.type==='goto'?'goto':'experimental');

    // Footer action
    let footerAction='';
    if(alreadyAdded){
      footerAction=`<span class="lib-badge-added">✓ In Your Menu</span>`;
    } else if(catFull){
      footerAction=`<span class="lib-badge-full">Category full (3/3)</span>`;
    } else {
      footerAction=`<button class="btn btn-primary lib-add-btn" onclick="addFromLibrary('${lr.id}')">+ Add to My Menu</button>`;
    }

    // Tag pills — colour-coded by category
    const tagColorMap={
      'Under 15 Min':'quick','Under 30 Min':'quick',
      'Batch Cook':'batch','Freezer Friendly':'freezer',
      'One Pan':'onepan',
    };
    const tagPills=(lr.tags||[]).map(t=>{
      const cls=tagColorMap[t]||'easy';
      return `<span class="lib-tag lib-tag-${cls}">${t}</span>`;
    }).join('');

    const card=document.createElement('div');
    card.className='lib-card';
    card.innerHTML=`
      <div class="lib-card-top">
        <div class="lib-card-name">${lr.name}</div>
        <span class="lib-type-tag ${typeClass}">${typeName}</span>
      </div>
      <div class="lib-card-srv">${srvLabel}</div>
      ${tagPills?`<div class="lib-tags">${tagPills}</div>`:''}
      ${lr.notes?`<div class="lib-card-note">${lr.notes}</div>`:''}
      <div class="lib-card-ings">${ingList}</div>
      <div class="lib-card-footer">${footerAction}</div>`;
    grid.appendChild(card);
  });

  // Empty state (shouldn't happen, but just in case)
  if(filtered.length===0){
    grid.innerHTML=`<div style="color:var(--text-3);font-size:13px;padding:20px 0">No recipes in this category yet.</div>`;
  }
}

function addFromLibrary(id){
  const lr=LIBRARY_RECIPES.find(r=>r.id===id);
  if(!lr) return;
  // Double-check limits
  if(recipes.some(r=>r.libraryId===id)) return;
  if(recipes.filter(r=>r.type===lr.type).length>=3){
    const catLabel=lr.type==='goto'?'Go-To Meal':'Experimental';
    alert('Your '+catLabel+' category is full (3/3) — remove one recipe to make room, then try again.');
    return;
  }
  // Copy recipe into user's list — use steps field if present, else notes
  const newRecipe={
    id: uid(),
    libraryId: lr.id,
    type: lr.type,
    name: lr.name,
    servings: lr.servings,
    notes: lr.steps||lr.notes||'',
    ingredients: lr.ingredients.map(i=>({...i})),
  };
  recipes.push(newRecipe);
  save(K.recipes, recipes);
  renderLibrary();        // re-render library (button state changes)
  renderMealSections();   // keep Step 2 in sync
}

// ╔═══════════════════════════════════════╗
//   STEP 1 — WEEK NOTES
// ╚═══════════════════════════════════════╝
function renderWeek(){
  // Week badge
  const now=new Date(), d=now.getDay();
  const mon=new Date(now); mon.setDate(now.getDate()-(d===0?6:d-1));
  document.getElementById('weekBadge').textContent='Week of '+mon.toLocaleDateString('en-US',{month:'short',day:'numeric'});

  const grid=document.getElementById('weekGrid');
  grid.innerHTML='';
  DAYS.forEach(day=>{
    const notes=weekNotes[day]||{am:'',pm:''};
    const hasNote=notes.am||notes.pm;
    const card=document.createElement('div');
    card.className='day-card'+(hasNote?' has-note':'');
    card.id='daycard-'+day;
    card.innerHTML=`
      <div class="day-header"><div class="day-name">${DAY_FULL[day]}</div></div>
      <div class="day-slots">
        <div class="day-slot">
          <div class="slot-label"><span>🌅</span> AM</div>
          <textarea data-day="${day}" data-slot="am" placeholder="Morning meeting, workout, early drop-off…">${notes.am||''}</textarea>
        </div>
        <div class="day-slot">
          <div class="slot-label"><span>🌙</span> PM</div>
          <textarea data-day="${day}" data-slot="pm" placeholder="Late calls, family plans, dinner out…">${notes.pm||''}</textarea>
        </div>
      </div>`;
    grid.appendChild(card);
    card.querySelectorAll('textarea').forEach(ta=>{
      ta.addEventListener('input',e=>{
        const{day,slot}=e.target.dataset;
        if(!weekNotes[day]) weekNotes[day]={am:'',pm:''};
        weekNotes[day][slot]=e.target.value;
        save(K.weekNotes,weekNotes);
        const anyNote=weekNotes[day].am||weekNotes[day].pm;
        document.getElementById('daycard-'+day).classList.toggle('has-note',!!anyNote);
        // Hide starter note as soon as the user fills in anything
        const sn=document.getElementById('weekStarterNote');
        if(sn) sn.innerHTML='';
      });
    });
  });

  // Show starter note only when every slot is empty
  const anyFilled=DAYS.some(d=>weekNotes[d]&&(weekNotes[d].am||weekNotes[d].pm));
  const starterNote=document.getElementById('weekStarterNote');
  if(starterNote){
    starterNote.innerHTML=anyFilled?'':`
      <div class="starter-note" style="margin-top:12px">
        <span>👆</span>
        <span>Tap any day to add a morning or evening commitment — early meeting, gym, late night, travel, whatever shapes that day. Takes 60 seconds. Do this first, then build your meal plan.</span>
      </div>`;
  }
}

// ╔═══════════════════════════════════════╗
//   STEP 2 — RECIPES
// ╚═══════════════════════════════════════╝
function renderMealSections(){
  const el=document.getElementById('mealSections');
  el.innerHTML='';
  // First-time empty state
  if(recipes.length===0){
    el.innerHTML=`<div style="text-align:center;padding:40px 20px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow)">
      <div style="font-size:36px;margin-bottom:12px">🍽️</div>
      <div style="font-size:15px;font-weight:800;margin-bottom:6px">Your menu is empty</div>
      <div style="font-size:13px;color:var(--text-2);max-width:320px;margin:0 auto 18px;line-height:1.55">Add your go-to and experimental meals here — recipes you already know and trust. Or browse the library to get started fast.</div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="openRecipeModal(null,'goto')">+ Add a Recipe</button>
        <button class="btn btn-secondary" onclick="switchTab('library')">📚 Browse Library</button>
      </div>
    </div>`;
    return;
  }
  const MENU_GROUPS=[
    {type:'goto',       icon:'⚡', label:'Go-To Meals',       desc:'Reliable recipes you could cook half-asleep'},
    {type:'experimental',icon:'✨',label:'Experimental Meals', desc:'More involved recipes that push you to try something new'},
  ];
  MENU_GROUPS.forEach(({type,icon,label,desc})=>{
    const list=recipes.filter(r=>r.type===type);
    const rem=3-list.length;
    const wrap=document.createElement('div');
    wrap.innerHTML=`
      <div class="meal-section-header">
        <div class="meal-type-label">
          <div class="meal-type-icon">${icon}</div>
          <div>
            <div class="meal-type-title">${label}</div>
            <div class="meal-type-desc">${desc}</div>
            <div class="meal-slots-count">${list.length}/3 — ${rem>0?rem+' slot'+(rem>1?'s':'')+' left':'Menu locked in ✓'}</div>
          </div>
        </div>
        ${rem>0?`<button class="btn btn-secondary btn-sm" onclick="openRecipeModal(null,'${type}')">+ Add Recipe</button>`:''}
      </div>
      <div class="recipes-grid" id="rgrid-${type}"></div>`;
    el.appendChild(wrap);
    const grid=document.getElementById('rgrid-'+type);
    list.forEach(r=>{
      const card=document.createElement('div');
      card.className='recipe-card';
      const ingPreview=r.ingredients.slice(0,3).map(i=>i.name).join(', ')+(r.ingredients.length>3?` +${r.ingredients.length-3} more`:'');
      card.innerHTML=`
        <div class="recipe-card-name">${r.name}</div>
        <div class="recipe-card-servings">${r.servings} serving${r.servings!==1?'s':''} per batch</div>
        ${renderSteps(r.notes)}
        <div class="recipe-card-ings">${ingPreview||'No ingredients yet'}</div>
        <div class="recipe-card-actions">
          <button class="btn btn-secondary btn-sm" onclick="openRecipeModal('${r.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteRecipe('${r.id}')">Remove</button>
        </div>`;
      grid.appendChild(card);
    });
    if(rem>0){
      const slot=document.createElement('div');
      slot.className='add-recipe-slot';
      slot.onclick=()=>openRecipeModal(null,type);
      slot.innerHTML=`<div class="plus">+</div><div class="slot-text">Add a ${label.toLowerCase().replace(' meals','')} recipe</div>`;
      grid.appendChild(slot);
    } else {
      const max=document.createElement('div');
      max.className='max-reached';
      max.innerHTML=`<strong>3/3 ✓</strong><span>Locked in — no decisions needed.</span>`;
      grid.appendChild(max);
    }
  });
}

let _editId=null, _editType='goto';
function openRecipeModal(id,type){
  _editId=id;
  const r=id?recipes.find(x=>x.id===id):null;
  _editType=type||(r?r.type:'goto');
  document.getElementById('recipeModalTitle').textContent=id?'Edit Recipe':'Add Recipe';
  document.getElementById('r_name').value=r?r.name:'';
  document.getElementById('r_servings').value=r?r.servings:4;
  document.getElementById('r_type').value=r?r.type:_editType;
  // Populate step rows from notes (newline-separated)
  const stepsEl=document.getElementById('stepsRows');
  stepsEl.innerHTML='';
  const existingSteps=r&&r.notes?r.notes.split('\n').filter(s=>s.trim()):[];
  if(existingSteps.length===0) addStepRow(''); else existingSteps.forEach(s=>addStepRow(s));
  document.getElementById('ingRows').innerHTML='';
  const ings=r?r.ingredients:[];
  if(ings.length===0) addIngRow(); else ings.forEach(i=>addIngRow(i));
  // Show revert button only when editing a library-sourced recipe
  const revertBtn=document.getElementById('revertBtn');
  if(revertBtn) revertBtn.style.display=(r&&r.libraryId)?'inline-block':'none';
  document.getElementById('recipeModal').classList.add('open');
  setTimeout(()=>document.getElementById('r_name').focus(),100);
}
function addStepRow(text){
  const stepsEl=document.getElementById('stepsRows');
  const idx=stepsEl.children.length+1;
  const row=document.createElement('div');
  row.className='step-row';
  row.innerHTML=`
    <span class="step-num">${idx}</span>
    <input type="text" placeholder="e.g. Heat oil in pan over medium heat…" value="${text?text.replace(/"/g,'&quot;'):''}">
    <button onclick="this.closest('.step-row').remove();_renumberSteps()" title="Remove">✕</button>`;
  stepsEl.appendChild(row);
}
function _renumberSteps(){
  document.querySelectorAll('#stepsRows .step-row').forEach((row,i)=>{
    const num=row.querySelector('.step-num');
    if(num) num.textContent=i+1;
  });
}
function addIngRow(ing){
  const row=document.createElement('div');
  row.className='ing-row';
  const opts=CATS.map(c=>`<option value="${c}"${ing&&ing.category===c?' selected':''}>${c}</option>`).join('');
  row.innerHTML=`
    <input type="text" placeholder="e.g. Oats" value="${ing?ing.name:''}">
    <input type="text" placeholder="1 cup" value="${ing?ing.qty:''}">
    <select>${opts}</select>
    <button onclick="this.closest('.ing-row').remove()" title="Remove">✕</button>`;
  document.getElementById('ingRows').appendChild(row);
}
function saveRecipe(){
  const name=document.getElementById('r_name').value.trim();
  if(!name){document.getElementById('r_name').focus();return;}
  const type=document.getElementById('r_type').value;
  const existing=recipes.filter(r=>r.type===type&&r.id!==_editId).length;
  if(existing>=5){alert('You\'ve reached the limit for '+type+' — 5 per category is all you need. That\'s the whole point.');return;}
  const ings=Array.from(document.querySelectorAll('#ingRows .ing-row')).map(row=>{
    const ins=row.querySelectorAll('input');
    return{name:ins[0].value.trim(),qty:ins[1].value.trim(),category:row.querySelector('select').value};
  }).filter(i=>i.name);
  // Collect steps and join as newline-separated string (matches renderSteps format)
  const notes=Array.from(document.querySelectorAll('#stepsRows .step-row input'))
    .map(i=>i.value.trim()).filter(Boolean).join('\n');
  const data={name,type,servings:parseInt(document.getElementById('r_servings').value)||4,notes,ingredients:ings};
  if(_editId){const i=recipes.findIndex(r=>r.id===_editId);if(i>-1)recipes[i]={...recipes[i],...data};}
  else{recipes.push({id:uid(),...data});}
  save(K.recipes,recipes);
  closeModal('recipeModal');
  renderMealSections();
}
function revertRecipe(){
  const r=recipes.find(x=>x.id===_editId);
  if(!r||!r.libraryId) return;
  const lr=LIBRARY_RECIPES.find(l=>l.id===r.libraryId);
  if(!lr) return;
  if(!confirm('Reset this recipe to the original Meal Planning OS version? Any edits you\'ve made will be lost.')) return;
  document.getElementById('r_name').value=lr.name;
  document.getElementById('r_servings').value=lr.servings;
  document.getElementById('r_type').value=lr.type;
  // Repopulate step rows from library notes
  const stepsEl=document.getElementById('stepsRows');
  stepsEl.innerHTML='';
  const libSteps=(lr.steps||lr.notes||'').split('\n').filter(s=>s.trim());
  if(libSteps.length===0) addStepRow(''); else libSteps.forEach(s=>addStepRow(s));
  document.getElementById('ingRows').innerHTML='';
  lr.ingredients.forEach(i=>addIngRow(i));
}
function deleteRecipe(id){
  if(!confirm('Remove this recipe?')) return;
  recipes=recipes.filter(r=>r.id!==id);
  DAYS.forEach(d=>MEALS.forEach(m=>{if(mealPlan[d]&&mealPlan[d][m]&&mealPlan[d][m].recipeId===id)delete mealPlan[d][m];}));
  save(K.recipes,recipes); save(K.mealPlan,mealPlan);
  renderMealSections();
}

// ╔═══════════════════════════════════════╗
//   STEP 3 — MEAL PLAN
// ╚═══════════════════════════════════════╝
function renderMealPlan(){
  const tbl=document.getElementById('mealPlanTable');
  tbl.innerHTML='';
  // Header
  const thead=document.createElement('thead');
  let h='<tr><th><div class="th-inner"></div></th>';
  DAYS.forEach(d=>{
    const n=weekNotes[d]||{};
    let coms='';
    if(n.am) coms+=`<div class="th-commitment"><span class="th-commitment-icon">🌅</span><span class="th-commitment-text">${n.am}</span></div>`;
    if(n.pm) coms+=`<div class="th-commitment"><span class="th-commitment-icon">🌙</span><span class="th-commitment-text">${n.pm}</span></div>`;
    h+=`<th><div class="th-inner"><div class="th-day">${DAY_FULL[d]}</div>${coms}</div></th>`;
  });
  h+='</tr>';
  thead.innerHTML=h; tbl.appendChild(thead);
  // Body
  const tbody=document.createElement('tbody');
  MEALS.forEach(meal=>{
    const tr=document.createElement('tr');
    const rowStyle={
      breakfast:`background:var(--yellow-light);border-right:3px solid var(--yellow)`,
      lunch:`background:var(--green-light);border-right:3px solid var(--green)`,
      dinner:`background:var(--accent-light);border-right:3px solid var(--accent)`
    }[meal];
    const rowNameColor={breakfast:'var(--yellow)',lunch:'var(--green)',dinner:'var(--accent)'}[meal];
    let row=`<td style="${rowStyle};padding:0"><div class="row-label"><div class="row-label-icon">${MEAL_ICON[meal]}</div><div class="row-label-name" style="color:${rowNameColor}">${meal}</div></div></td>`;
    DAYS.forEach(d=>{
      const asgn=mealPlan[d]&&mealPlan[d][meal];
      row+=`<td>`;
      if(asgn){
        const cls=getCellClass(meal,asgn);
        const tag=getCellTag(meal,asgn);
        row+=`<div class="cell-filled ${cls}" onclick="openAssignModal('${d}','${meal}')">
          <button class="cell-remove" onclick="event.stopPropagation();removeCell('${d}','${meal}')">✕</button>
          <div class="cell-meal-name">${asgn.name}</div>
          <div class="cell-servings">${asgn.servings} serving${asgn.servings!==1?'s':''}</div>
          ${tag}
        </div>`;
      } else {
        row+=`<div class="plan-cell empty" onclick="openAssignModal('${d}','${meal}')"><span class="cell-empty-label">+ Add</span></div>`;
      }
      row+='</td>';
    });
    tr.innerHTML=row; tbody.appendChild(tr);
  });
  tbl.appendChild(tbody);
}
function getCellClass(meal,a){
  const t=a.mealType||'goto';
  const classMap={
    goto:'type-goto',
    experimental:'type-experimental',
    freezer:'type-freezer',
    leftovers:'type-leftovers',
    eatingout:'type-eatingout',
    // legacy values
    easy:'type-goto', prep:'type-goto', quick:'type-goto',
    out:'type-eatingout', lunchout:'type-eatingout', takeout:'type-eatingout',
    fun:'type-experimental',
  };
  return classMap[t]||'type-goto';
}
function getCellTag(meal,a){
  const t=a.mealType;
  if(!t) return '';
  const map={
    goto:'<span class="cell-tag tag-goto">⚡ Go-To</span>',
    experimental:'<span class="cell-tag tag-experimental">✨ Experimental</span>',
    freezer:'<span class="cell-tag tag-freezer">❄️ Freezer</span>',
    leftovers:'<span class="cell-tag tag-leftovers">🍱 Leftovers</span>',
    eatingout:'<span class="cell-tag tag-eatingout">🥡 Eating Out</span>',
    // legacy values — map gracefully
    easy:'<span class="cell-tag tag-goto">⚡ Go-To</span>',
    prep:'<span class="cell-tag tag-goto">⚡ Go-To</span>',
    quick:'<span class="cell-tag tag-goto">⚡ Go-To</span>',
    out:'<span class="cell-tag tag-eatingout">🥡 Eating Out</span>',
    lunchout:'<span class="cell-tag tag-eatingout">🥡 Eating Out</span>',
    takeout:'<span class="cell-tag tag-eatingout">🥡 Eating Out</span>',
    fun:'<span class="cell-tag tag-experimental">✨ Experimental</span>',
  };
  return map[t]||'';
}
function removeCell(d,m){if(mealPlan[d])delete mealPlan[d][m];save(K.mealPlan,mealPlan);renderMealPlan();}

// Assign modal
let _aC={};
function openAssignModal(day,meal){
  _aC={day,meal,name:'',servings:2,mealType:null,recipeId:null,freezerId:null,freezerItem:false};
  const existing=mealPlan[day]&&mealPlan[day][meal];
  if(existing){ _aC={..._aC,...existing}; }
  document.getElementById('assignModalTitle').textContent=MEAL_ICON[meal]+' '+DAY_FULL[day]+' — '+meal.charAt(0).toUpperCase()+meal.slice(1);

  let html='';
  // ── Category selector ─────────────────────────────────────────────────
  html+=`<div style="font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">What's the plan?</div>`;
  html+=`<div class="assign-type-grid">`;
  MEAL_CATEGORIES.forEach(t=>{
    const sel=_aC.mealType===t.id?'sel':'';
    html+=`<div class="assign-type-btn ${sel}" data-tid="${t.id}" onclick="selectAType('${t.id}')">
      <div class="atype-icon">${t.icon}</div>
      <div class="atype-name">${t.name}</div>
      <div class="atype-sub">${t.sub}</div>
    </div>`;
  });
  html+='</div>';

  // ── Freezer picker ────────────────────────────────────────────────────
  const isFreezer=_aC.mealType==='freezer';
  html+=`<div id="freezerPickerSection" style="display:${isFreezer?'block':'none'};margin-top:12px">`;
  html+=`<div style="font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Pick from your Freezer</div>`;
  if(freezer.length>0){
    freezer.forEach(f=>{
      const sel=_aC.freezerId===f.id?'sel':'';
      html+=`<div class="recipe-pick-opt ${sel}" data-fid="${f.id}" onclick="pickFreezerItem('${f.id}','${f.name.replace(/'/g,"\\'")}',${f.servings})">
        <span style="font-size:18px">🧊</span>
        <div style="flex:1"><div class="rpo-name">${f.name}</div><div class="rpo-sub">${f.servings} srv · Made ${fmtDate(f.dateMade)}</div></div>
      </div>`;
    });
  } else {
    html+=`<div style="font-size:13px;color:var(--text-3);padding:12px 0">No meals in your freezer yet. Log some in the Freezer tab.</div>`;
  }
  html+='</div>';

  // ── Recipe picker (goto / experimental) ──────────────────────────────
  const isRecipeCat=_aC.mealType==='goto'||_aC.mealType==='experimental';
  const catRecipes=isRecipeCat?recipes.filter(r=>r.type===_aC.mealType):[];
  html+=`<div id="recipePickerSection" style="display:${isRecipeCat?'block':'none'};margin-top:12px">`;
  html+=`<div style="font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Pick from your menu <span style="font-weight:400;text-transform:none;letter-spacing:0">(optional)</span></div>`;
  html+=`<div class="recipe-picker" id="recipePicker">`;
  if(catRecipes.length>0){
    catRecipes.forEach(r=>{
      const sel=_aC.recipeId===r.id?'sel':'';
      html+=`<div class="recipe-pick-opt ${sel}" data-rid="${r.id}" onclick="pickRecipe('${r.id}','${r.name.replace(/'/g,"\\'")}',${r.servings})">
        <span class="rpo-name">${r.name}</span><span class="rpo-sub">${r.servings} srv</span>
      </div>`;
    });
  } else {
    html+=`<div style="font-size:13px;color:var(--text-3);padding:8px 0">No recipes yet — <a href="#" style="color:var(--accent);text-decoration:none;font-weight:600" onclick="closeModal('assignModal');switchTab('step2')">build your menu</a> or <a href="#" style="color:var(--accent);text-decoration:none;font-weight:600" onclick="closeModal('assignModal');switchTab('library')">browse the library</a> first.</div>`;
  }
  html+='</div></div>';

  // ── Leftovers text ────────────────────────────────────────────────────
  const isLeftovers=_aC.mealType==='leftovers';
  html+=`<div id="leftoverSection" style="display:${isLeftovers?'block':'none'};margin-top:12px">`;
  html+=`<div style="font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Which meal?</div>`;
  html+=`<input type="text" id="a_mealName_leftovers" placeholder="e.g. Monday's pasta, last night's chili…" value="${existing&&isLeftovers?existing.name:''}" onkeydown="event.stopPropagation();if(event.key==='Enter'){event.preventDefault();confirmAssign();}">`;
  html+=`<div style="font-size:11px;color:var(--text-3);margin-top:5px">Note any meal from this week — whatever you're finishing up.</div>`;
  html+='</div>';

  // ── Eating Out text ───────────────────────────────────────────────────
  const isEatingOut=_aC.mealType==='eatingout';
  html+=`<div id="eatingOutSection" style="display:${isEatingOut?'block':'none'};margin-top:12px">`;
  html+=`<div style="font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Where / What? <span style="font-weight:400;text-transform:none;letter-spacing:0">(optional)</span></div>`;
  html+=`<input type="text" id="a_mealName_eatingout" placeholder="e.g. Thai takeout, date night, coffee shop…" value="${existing&&isEatingOut?existing.name:''}" onkeydown="event.stopPropagation();if(event.key==='Enter'){event.preventDefault();confirmAssign();}">`;
  html+='</div>';

  // ── Meal name for goto / experimental / freezer ───────────────────────
  const showNameField=!isLeftovers&&!isEatingOut;
  html+=`<div id="mealNameSection" style="display:${showNameField?'block':'none'};margin-top:12px">`;
  html+=`<div style="font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Meal Name</div>`;
  html+=`<input type="text" id="a_mealName_recipe" placeholder="Leave blank or type a custom name…" value="${existing&&showNameField?existing.name:''}" onkeydown="event.stopPropagation();if(event.key==='Enter'){event.preventDefault();confirmAssign();}">`;
  html+='</div>';

  // ── Servings ──────────────────────────────────────────────────────────
  html+=`<div style="display:flex;align-items:center;gap:10px;margin-top:14px">
    <label style="margin:0;white-space:nowrap">Servings:</label>
    <input type="number" id="a_servings" min="1" max="50" value="${existing?existing.servings:2}" style="width:80px">
  </div>`;

  document.getElementById('assignModalBody').innerHTML=html;
  document.getElementById('assignModal').classList.add('open');
}

function selectAType(id){
  _aC.mealType=id;
  if(id!=='freezer'){ _aC.freezerId=null; _aC.freezerItem=false; }
  if(id!=='goto'&&id!=='experimental'){ _aC.recipeId=null; }
  document.querySelectorAll('.assign-type-btn').forEach(b=>b.classList.toggle('sel',b.dataset.tid===id));
  const isRecipeCat=id==='goto'||id==='experimental';
  const fzSec=document.getElementById('freezerPickerSection');
  const recSec=document.getElementById('recipePickerSection');
  const lvSec=document.getElementById('leftoverSection');
  const eoSec=document.getElementById('eatingOutSection');
  const nmSec=document.getElementById('mealNameSection');
  if(fzSec) fzSec.style.display=id==='freezer'?'block':'none';
  if(lvSec) lvSec.style.display=id==='leftovers'?'block':'none';
  if(eoSec) eoSec.style.display=id==='eatingout'?'block':'none';
  if(nmSec) nmSec.style.display=(id!=='leftovers'&&id!=='eatingout')?'block':'none';
  // clear name fields when switching category
  ['a_mealName_recipe','a_mealName_eatingout','a_mealName_leftovers'].forEach(function(fid){
    const el=document.getElementById(fid); if(el) el.value='';
  });
  _aC.recipeId=null; _aC.freezerId=null; _aC.freezerItem=false;
  if(recSec){
    recSec.style.display=isRecipeCat?'block':'none';
    if(isRecipeCat){
      const catRecipes=recipes.filter(r=>r.type===id);
      const picker=document.getElementById('recipePicker');
      if(picker){
        picker.innerHTML=catRecipes.length>0
          ?catRecipes.map(r=>`<div class="recipe-pick-opt${_aC.recipeId===r.id?' sel':''}" data-rid="${r.id}" onclick="pickRecipe('${r.id}','${r.name.replace(/'/g,"\\'")}',${r.servings})"><span class="rpo-name">${r.name}</span><span class="rpo-sub">${r.servings} srv</span></div>`).join('')
          :`<div style="font-size:13px;color:var(--text-3);padding:8px 0">No recipes yet — <a href="#" style="color:var(--accent);text-decoration:none;font-weight:600" onclick="closeModal('assignModal');switchTab('step2')">build your menu</a> or <a href="#" style="color:var(--accent);text-decoration:none;font-weight:600" onclick="closeModal('assignModal');switchTab('library')">browse the library</a> first.</div>`;
      }
    }
  }
}
function _getNameInput(){
  const t=_aC.mealType;
  if(t==='eatingout') return document.getElementById('a_mealName_eatingout');
  if(t==='leftovers') return document.getElementById('a_mealName_leftovers');
  return document.getElementById('a_mealName_recipe');
}
function pickRecipe(id,name,servings){
  _aC.recipeId=id; _aC.freezerId=null; _aC.freezerItem=false;
  document.querySelectorAll('.recipe-pick-opt[data-rid]').forEach(b=>b.classList.toggle('sel',b.dataset.rid===id));
  document.querySelectorAll('.recipe-pick-opt[data-fid]').forEach(b=>b.classList.remove('sel'));
  const nm=_getNameInput(); if(nm) nm.value=name;
  const sv=document.getElementById('a_servings'); if(sv) sv.value=servings;
}
function pickFreezerItem(id,name,servings){
  _aC.freezerId=id; _aC.freezerItem=true; _aC.recipeId=null;
  document.querySelectorAll('.recipe-pick-opt[data-fid]').forEach(b=>b.classList.toggle('sel',b.dataset.fid===id));
  document.querySelectorAll('.recipe-pick-opt[data-rid]').forEach(b=>b.classList.remove('sel'));
  const nm=_getNameInput(); if(nm) nm.value=name;
  const sv=document.getElementById('a_servings'); if(sv) sv.value=servings;
}
function confirmAssign(){
  let name=(_getNameInput()?.value||'').trim();
  if(!name){
    const cat=MEAL_CATEGORIES.find(c=>c.id===_aC.mealType);
    name=cat?cat.name:(_aC.meal.charAt(0).toUpperCase()+_aC.meal.slice(1)+' Meal');
  }
  const{day,meal}=_aC;
  if(!mealPlan[day]) mealPlan[day]={};
  mealPlan[day][meal]={
    name,
    servings:parseInt(document.getElementById('a_servings')?.value)||2,
    mealType:_aC.mealType||null,
    recipeId:_aC.recipeId||null,
    freezerItem:_aC.freezerItem||false,
    freezerId:_aC.freezerId||null,
  };
  save(K.mealPlan,mealPlan);
  closeModal('assignModal');
  renderMealPlan();
}

// ╔═══════════════════════════════════════╗
//   STEP 4 — GROCERY LIST
// ╚═══════════════════════════════════════╝

// Pluralize common grocery units
function pluralUnit(unit, total){
  if(total<=1) return unit;
  const u=unit.toLowerCase().trim();
  const map={cup:'cups',tbsp:'tbsp',tsp:'tsp',oz:'oz',lb:'lbs',can:'cans',clove:'cloves',slice:'slices',piece:'pieces',bag:'bags',jar:'jars',bottle:'bottles',bunch:'bunches',head:'heads',stalk:'stalks',sheet:'sheets',pack:'packs',packet:'packets'};
  return map[u]||unit; // return original if no mapping (already plural, or unmapped)
}

// Convert a decimal to a readable fraction string
function toFrac(n){
  if(n===0) return '0';
  const whole=Math.floor(n), dec=+(n-whole).toFixed(3);
  const map=[[0.125,'⅛'],[0.25,'¼'],[0.333,'⅓'],[0.5,'½'],[0.667,'⅔'],[0.75,'¾'],[0.875,'⅞']];
  if(dec===0) return String(whole);
  const closest=map.reduce((a,b)=>Math.abs(b[0]-dec)<Math.abs(a[0]-dec)?b:a);
  return (whole>0?whole:'')+closest[1];
}

// Ingredient-specific package size lookup
function practicalHint(ingredientName, total, unit){
  const n=ingredientName.toLowerCase();
  const u=(unit||'').toLowerCase().replace(/s$/,'').trim();
  const isCup=['cup','c'].includes(u);
  const isOz=['oz','ounce'].includes(u);
  const isTbsp=['tbsp','tbs','tablespoon'].includes(u);

  // BERRIES (any kind)
  if(/berr/.test(n) && isCup){
    if(total<=1)  return '≈ 1 small clamshell';
    if(total<=2)  return '≈ 1 pint container';
    if(total<=4)  return '≈ 1 quart container';
    return '≈ '+Math.ceil(total/4)+' quart containers';
  }
  // OATS
  if(/oat/.test(n) && isCup){
    if(total<=6)  return '≈ 1 small canister';
    if(total<=14) return '≈ 1 standard canister';
    return '≈ '+Math.ceil(total/14)+' canisters';
  }
  // YOGURT (greek or plain)
  if(/yogurt/.test(n) && isCup){
    if(total<=0.5) return '≈ 1 individual cup';
    if(total<=2)   return '≈ 1 small tub (17oz)';
    if(total<=4)   return '≈ 1 large tub (32oz)';
    return '≈ '+Math.ceil(total/4)+' large tubs';
  }
  // GRANOLA
  if(/granola/.test(n) && isCup){
    if(total<=4) return '≈ 1 bag';
    return '≈ '+Math.ceil(total/4)+' bags';
  }
  // MILK (cups — gallon context)
  if(/\bmilk\b/.test(n) && isCup){
    if(total<=4)  return '≈ 1 qt';
    if(total<=8)  return '≈ 1 half-gallon';
    if(total<=16) return '≈ 1 gallon';
    return '≈ '+Math.ceil(total/16)+' gallons';
  }
  // BROTH / STOCK
  if(/(broth|stock)/.test(n) && isCup){
    if(total<=4)  return '≈ 1 small carton (32oz)';
    if(total<=8)  return '≈ 1 large carton (64oz)';
    return '≈ '+Math.ceil(total/8)+' large cartons';
  }
  // EGGS
  if(/\begg\b/.test(n)){
    if(total<=6)  return '≈ ½ dozen';
    if(total<=12) return '≈ 1 dozen';
    return '≈ '+Math.ceil(total/12)+' dozen';
  }
  // PASTA / NOODLES
  if(/(pasta|spaghetti|penne|fettuccin|linguine|noodle|macaroni)/.test(n)){
    if(isOz){ const b=Math.ceil(total/16); return '≈ '+b+' box'+(b>1?'es':'')+' (1 lb each)'; }
    if(isCup){ const b=Math.ceil(total/4);  return '≈ '+b+' box'+(b>1?'es':''); }
  }
  // RICE
  if(/\brice\b/.test(n) && isCup){
    if(total<=4) return '≈ 1 small bag';
    if(total<=8) return '≈ 1 standard bag';
    return '≈ '+Math.ceil(total/8)+' bags';
  }
  // BEANS / LENTILS / CHICKPEAS (dry cups → cans)
  if(/(bean|lentil|chickpea)/.test(n) && isCup){
    // ~1.5 cups cooked per can
    const cans=Math.ceil(total/1.5);
    return '≈ '+cans+' can'+(cans>1?'s':'');
  }
  // NUT BUTTER / PEANUT BUTTER
  if(/(nut butter|peanut butter|almond butter)/.test(n) && isTbsp){
    if(total<=16) return '≈ 1 small jar';
    return '≈ 1 large jar';
  }
  // HONEY
  if(/\bhoney\b/.test(n) && isTbsp){
    if(total<=16) return '≈ 1 small bottle';
    return '≈ 1 standard bottle';
  }
  // OLIVE OIL / OIL
  if(/oil/.test(n) && isTbsp){
    if(total<=32) return '≈ 1 bottle';
  }
  // PARMESAN / CHEESE (shredded, in cups)
  if(/(parmesan|mozzarella|cheddar|feta|cheese)/.test(n) && isCup){
    if(total<=1)  return '≈ 1 small bag';
    if(total<=2)  return '≈ 1 standard bag';
    return '≈ '+Math.ceil(total/2)+' bags';
  }
  // SPINACH / ARUGULA / GREENS (cups)
  if(/(spinach|arugula|kale|greens|lettuce)/.test(n) && isCup){
    if(total<=4) return '≈ 1 small bag';
    if(total<=8) return '≈ 1 large bag';
    return '≈ '+Math.ceil(total/8)+' large bags';
  }
  return null;
}

// Master hint function — ingredient lookup first, then unit conversion fallback
function shoppingHint(ingredientName, total, unit){
  const specific=practicalHint(ingredientName, total, unit);
  if(specific) return specific;
  // Generic unit conversions
  const u=(unit||'').toLowerCase().replace(/s$/,'').trim();
  if(['cup','c'].includes(u) && total>=2){
    if(total>=16){ return '≈ '+toFrac(total/16)+' gal'; }
    const q=total/4; return '≈ '+toFrac(q)+' qt'+(q===1?'':'s');
  }
  if(['tbsp','tbs','tablespoon'].includes(u) && total>=8){
    const c=total/16; return '≈ '+toFrac(c)+' cup'+(c===1?'':'s');
  }
  if(['tsp','teaspoon'].includes(u) && total>=6){
    return '≈ '+toFrac(total/3)+' tbsp';
  }
  if(['oz','ounce'].includes(u) && total>=16){
    const lb=total/16; return '≈ '+toFrac(lb)+' lb'+(lb===1?'':'s');
  }
  return null;
}

function renderGrocery(){
  const container=document.getElementById('groceryMain');
  const agg={};
  let recipeCount=0;
  DAYS.forEach(d=>MEALS.forEach(m=>{
    const a=mealPlan[d]&&mealPlan[d][m];
    if(!a||!a.recipeId) return;
    const r=recipes.find(x=>x.id===a.recipeId);
    if(!r) return;
    recipeCount++;
    const srv=a.servings||r.servings||1;
    r.ingredients.forEach(ing=>{
      if(!ing.name) return;
      const cat=ing.category||'Pantry & Seasonings';
      if(!agg[cat]) agg[cat]={};
      const k=ing.name.toLowerCase().trim();
      if(!agg[cat][k]) agg[cat][k]={name:ing.name,qtys:[],rawQty:ing.qty};
      const n=parseFloat(ing.qty);
      // qty is total batch amount — scale by (assigned servings / batch size)
      agg[cat][k].qtys.push(isNaN(n)?null:n*(srv/(r.servings||1)));
    });
  }));

  // Meta — removed recipe count display

  container.innerHTML='';

  if(Object.keys(agg).length===0){
    container.innerHTML=`<div class="grocery-empty">
      <div class="empty-icon">🛒</div>
      <p>Assign recipes to your meal plan in Step 3 and your list will build itself — sorted by store section, quantities already calculated.</p>
    </div>`;
  } else {
    CATS.forEach(cat=>{
      const items=agg[cat];
      if(!items||Object.keys(items).length===0) return;
      const sec=document.createElement('div');
      sec.className='grocery-category';
      const count=Object.keys(items).length;
      let rows='';
      Object.entries(items).forEach(([k,item])=>{
        const ck=cat+'|'+k;
        const done=checks[ck]||false;
        let qty='', hint='';
        const nums=item.qtys.filter(n=>n!==null);
        if(nums.length>0){
          const total=nums.reduce((a,b)=>a+b,0);
          const rawUnit=item.rawQty?item.rawQty.replace(/^[\d.½¼¾\s\/]+/,'').trim():'';
          // Pluralize common units when total > 1
          const unit=rawUnit&&total!==1?pluralUnit(rawUnit,total):rawUnit;
          qty=toFrac(total)+(unit?' '+unit:'');
          hint=shoppingHint(item.name,total,unit);
        } else if(item.rawQty){ qty=item.rawQty; }
        rows+=`<div class="grocery-item">
          <input type="checkbox" ${done?'checked':''} onchange="toggleCheck('${cat}','${k}',this.checked)">
          <span class="grocery-item-name${done?' done':''}" id="gn-${cat}-${k}">${item.name}</span>
          ${qty?`<span class="grocery-item-qty">${qty}${hint?` <span class="hint">(${hint})</span>`:''}</span>`:''}
        </div>`;
      });
      sec.innerHTML=`<div class="category-header">
        <span class="category-icon">${CAT_ICON[cat]||'📦'}</span>
        <span class="category-name">${cat}</span>
        <span class="category-count">${count} item${count!==1?'s':''}</span>
      </div>${rows}`;
      container.appendChild(sec);
    });
  }

  // Weekly Staples — no checkboxes, list style
  renderListSection(container,'📌 Weekly Staples','Your recurring essentials — add these to your cart every week.',staples,'staples',()=>renderGrocery(),true);
  // Flex & Backup
  renderListSection(container,'🛟 Flex & Backup Items','Your rescue plan for busy nights. Cheaper and better than last-minute delivery.',flexItems,'flex',()=>renderGrocery(),false);
  // Ad-Hoc — catch-all at the bottom
  renderListSection(container,'🛍️ Ad-Hoc Items','Anything else you need — cleaning supplies, toiletries, or whatever didn\'t make the list.',adhocItems,'adhoc',()=>renderGrocery(),false);
}

function renderListSection(container,title,subtitle,items,type,refresh,isStaples){
  const sec=document.createElement('div');
  sec.className='list-only-section';
  const inputId='new-'+type+'-input';
  const ckPrefix='__'+type+'__|';
  let rows='';
  items.forEach(item=>{
    const ck=ckPrefix+item.id;
    const done=checks[ck]||false;
    rows+=`<div class="list-item-row">
      <input type="checkbox" ${done?'checked':''} onchange="toggleCheck('${ckPrefix.slice(0,-1)}','${item.id}',this.checked)">
      <span class="item-name${done?' done':''}" id="gn-${ckPrefix.slice(0,-1)}-${item.id}">${item.name}</span>
      <button class="item-remove" onclick="${type==='staples'?'removeStaple':type==='adhoc'?'removeAdhocItem':'removeFlexItem'}('${item.id}')">✕</button>
    </div>`;
  });
  const addFn=type==='staples'?'addStaple':type==='adhoc'?'addAdhocItem':'addFlexItem';
  sec.innerHTML=`<div class="category-header" style="margin-top:10px">
    <span class="category-icon">${title.split(' ')[0]}</span>
    <span class="category-name">${title.replace(/^[^\s]+\s/,'')}</span>
  </div>
  <div style="font-size:12px;color:var(--text-3);margin-bottom:10px">${subtitle}</div>
  <div class="list-only-items" id="list-${type}">${rows}</div>
  <div class="add-list-item" style="margin-top:8px">
    <input type="text" id="${inputId}" placeholder="Add item…" onkeydown="if(event.key==='Enter')${addFn}()">
    <button class="btn btn-secondary btn-sm" onclick="${addFn}()">Add</button>
  </div>`;
  container.appendChild(sec);
}

function toggleCheck(cat,k,done){
  const ck=cat+'|'+k; checks[ck]=done; save(K.checks,checks);
  const el=document.getElementById('gn-'+cat+'-'+k);
  if(el) el.classList.toggle('done',done);
}
function uncheckAll(){ checks={}; save(K.checks,checks); renderGrocery(); }
function addStaple(){
  const el=document.getElementById('new-staples-input'); if(!el) return;
  const name=el.value.trim(); if(!name) return;
  staples.push({id:uid(),name}); save(K.staples,staples); el.value=''; renderGrocery();
}
function removeStaple(id){ staples=staples.filter(s=>s.id!==id); save(K.staples,staples); renderGrocery(); }
function addFlexItem(){
  const el=document.getElementById('new-flex-input'); if(!el) return;
  const name=el.value.trim(); if(!name) return;
  flexItems.push({id:uid(),name}); save(K.flexItems,flexItems); el.value=''; renderGrocery();
}
function removeFlexItem(id){ flexItems=flexItems.filter(f=>f.id!==id); save(K.flexItems,flexItems); renderGrocery(); }
function addAdhocItem(){
  const el=document.getElementById('new-adhoc-input'); if(!el) return;
  const name=el.value.trim(); if(!name) return;
  adhocItems.push({id:uid(),name}); save(K.adhocItems,adhocItems); el.value=''; renderGrocery();
}
function removeAdhocItem(id){ adhocItems=adhocItems.filter(a=>a.id!==id); save(K.adhocItems,adhocItems); renderGrocery(); }

// ╔═══════════════════════════════════════╗
//   FREEZER
// ╚═══════════════════════════════════════╝
function openFreezerModal(){
  const today=new Date(), exp=new Date(today);
  exp.setMonth(exp.getMonth()+3);
  document.getElementById('fz_name').value='';
  document.getElementById('fz_made').value=toDateInput(today);
  document.getElementById('fz_exp').value=toDateInput(exp);
  document.getElementById('fz_servings').value=2;
  document.getElementById('fz_notes').value='';
  document.getElementById('freezerModal').classList.add('open');
  setTimeout(()=>document.getElementById('fz_name').focus(),100);
}
function saveFreezerItem(){
  const name=document.getElementById('fz_name').value.trim();
  if(!name){document.getElementById('fz_name').focus();return;}
  freezer.push({id:uid(),name,dateMade:document.getElementById('fz_made').value,expDate:document.getElementById('fz_exp').value,servings:parseInt(document.getElementById('fz_servings').value)||2,notes:document.getElementById('fz_notes').value.trim()});
  freezer.sort((a,b)=>new Date(a.dateMade)-new Date(b.dateMade));
  save(K.freezer,freezer);
  closeModal('freezerModal'); renderFreezer();
}
function renderFreezer(){
  const list=document.getElementById('freezerList');
  if(!list) return;
  if(freezer.length===0){
    list.innerHTML=`<div class="freezer-empty">
      <div style="font-size:42px;margin-bottom:12px">❄️</div>
      <div style="font-size:14px;font-weight:700;margin-bottom:6px">Nothing frozen yet</div>
      <div style="font-size:13px">Next time you batch cook, make a few extra portions and log them here. Pulled from the freezer on a busy night = the easiest dinner you'll ever plan.</div>
    </div>`; return;
  }
  list.innerHTML='';
  const today=new Date();
  freezer.forEach((f,i)=>{
    const exp=new Date(f.expDate+'T00:00:00');
    const days=Math.round((exp-today)/(86400000));
    let cls='exp-ok',txt=`Expires in ${days} days`;
    if(days<0){cls='exp-danger';txt=`Expired ${Math.abs(days)} days ago`;}
    else if(days<30){cls='exp-warn';txt=`Expires soon — ${days} days`;}
    const card=document.createElement('div');
    card.className='freezer-card'+(i===0?' use-first':'');
    card.innerHTML=`
      <div class="freezer-icon">🧊</div>
      <div class="freezer-body">
        <div class="freezer-name">${f.name}${i===0?'<span class="fifo-badge">USE FIRST</span>':''}</div>
        <div class="freezer-meta">Made ${fmtDate(f.dateMade)} · ${f.servings} serving${f.servings!==1?'s':''}</div>
        ${f.notes?`<div class="freezer-note">${f.notes}</div>`:''}
        <div class="freezer-exp ${cls}">${txt}</div>
      </div>
      <div class="freezer-actions">
        <button class="btn btn-secondary btn-sm" onclick="openFzPlan('${f.id}')">Add to Plan</button>
        <button class="btn btn-danger btn-sm" onclick="removeFreezerItem('${f.id}')">Remove</button>
      </div>`;
    list.appendChild(card);
  });
}
let _fzPlanId=null;
function openFzPlan(id){ _fzPlanId=id; document.getElementById('fzPlanModal').classList.add('open'); }
function confirmFzPlan(){
  const day=document.getElementById('fzp_day').value;
  const meal=document.getElementById('fzp_meal').value;
  const f=freezer.find(x=>x.id===_fzPlanId);
  if(!f){closeModal('fzPlanModal');return;}
  if(!mealPlan[day]) mealPlan[day]={};
  mealPlan[day][meal]={name:f.name,servings:f.servings,mealType:'freezer',freezerItem:true,freezerId:f.id};
  save(K.mealPlan,mealPlan);
  closeModal('fzPlanModal');
  switchTab('step3');
}
function removeFreezerItem(id){
  if(!confirm('Remove this meal from your freezer?')) return;
  freezer=freezer.filter(f=>f.id!==id); save(K.freezer,freezer); renderFreezer();
}

// ╔═══════════════════════════════════════╗
//   UTILS
// ╚═══════════════════════════════════════╝
function closeModal(id){ document.getElementById(id).classList.remove('open'); }
function toDateInput(d){ return d.toISOString().split('T')[0]; }
function fmtDate(s){
  if(!s) return '';
  const d=new Date(s+'T00:00:00');
  return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}

// Close on backdrop click
document.querySelectorAll('.modal-overlay').forEach(o=>{
  o.addEventListener('click',e=>{ if(e.target===o) o.classList.remove('open'); });
});

// ╔═══════════════════════════════════════╗
//   INIT
// ╚═══════════════════════════════════════╝
renderWeek();
renderMealSections();

// ============================================================
// SUPABASE AUTH + SYNC  (Supabase JS SDK loaded in index.html)
// ============================================================
const SUPABASE_URL = 'https://vgtsxthotnnvknrqyhec.supabase.co';
const SUPABASE_KEY = 'sb_publishable_lq13XvUG9YsoiHrU8p36qg_EXE0vo8f';
const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let _currentUser     = null;
let _saveTimer       = null;
let _recoveryToken   = null; // access token saved from PASSWORD_RECOVERY event

// ── UI state helpers ─────────────────────────────────────────
let _authMode = 'signin';

function showLanding() {
  _currentUser = null;
  document.getElementById('landingScreen').style.display = 'flex';
  document.getElementById('authScreen').style.display    = 'none';
  document.getElementById('accessGate').style.display    = 'none';
  document.getElementById('appRoot').style.display       = 'none';
}

// ── Auth state machine ────────────────────────────────────────
// States: 'signup' | 'signin' | 'forgot' | 'reset'
function showAuthState(state) {
  _authMode = state;
  const $ = id => document.getElementById(id);
  const show = id => { const el=$(id); if(el) el.style.display=''; };
  const hide = id => { const el=$(id); if(el) el.style.display='none'; };

  // Clear any previous message
  const msg=$('authMsg');
  if(msg){ msg.textContent=''; msg.className='auth-msg'; }

  // Reset all variable sections to default-visible first
  show('authEmailGroup'); show('authPasswordGroup'); show('authToggleWrap');
  hide('authForgotWrap'); hide('authNewPasswordGroup');
  hide('authBackWrap'); hide('authPurchaseNote');

  const btn=$('authBtn'); const title=$('authTitle');

  if(state==='signup'){
    if(title) title.textContent='Create your account';
    if(btn){ btn.textContent='Create Account'; btn.disabled=false; }
    show('authPurchaseNote');
    if($('authToggleText')) $('authToggleText').textContent='Already have an account?';
    if($('authToggleLink')) $('authToggleLink').textContent='Sign in';
  } else if(state==='signin'){
    if(title) title.textContent='Welcome back';
    if(btn){ btn.textContent='Sign In'; btn.disabled=false; }
    show('authForgotWrap');
    if($('authToggleText')) $('authToggleText').textContent="Don't have an account?";
    if($('authToggleLink')) $('authToggleLink').textContent='Sign up';
  } else if(state==='forgot'){
    if(title) title.textContent='Reset your password';
    if(btn){ btn.textContent='Send Reset Link'; btn.disabled=false; }
    hide('authPasswordGroup'); hide('authToggleWrap');
    show('authBackWrap');
  } else if(state==='reset'){
    if(title) title.textContent='Set a new password';
    if(btn){ btn.textContent='Set New Password'; btn.disabled=false; }
    hide('authEmailGroup'); hide('authPasswordGroup'); hide('authToggleWrap');
    show('authNewPasswordGroup');
  }
}

// context: optional string shown as a green confirmation banner above the form
function showAuth(context) {
  _currentUser = null;
  document.getElementById('landingScreen').style.display = 'none';
  document.getElementById('authScreen').style.display    = 'flex';
  document.getElementById('accessGate').style.display    = 'none';
  document.getElementById('appRoot').style.display       = 'none';
  const e = document.getElementById('authEmail');
  const p = document.getElementById('authPassword');
  if(e) e.value = '';
  if(p) p.value = '';
  showAuthState('signup');
  const ctx = document.getElementById('authContextMsg');
  if(ctx){
    if(context){ ctx.textContent=context; ctx.style.display='block'; }
    else        { ctx.textContent='';     ctx.style.display='none';  }
  }
}

function showAccessGate(user) {
  _currentUser = user;
  document.getElementById('landingScreen').style.display = 'none';
  document.getElementById('authScreen').style.display    = 'none';
  document.getElementById('accessGate').style.display    = 'flex';
  document.getElementById('appRoot').style.display       = 'none';
  const ue = document.getElementById('userEmail');
  if (ue) ue.textContent = user.email;
}

function normalizeRecipeTypes() {
  // Silently migrate old type values (breakfast/lunch/dinner) → goto
  const OLD_TYPES = ['breakfast','lunch','dinner'];
  let changed = false;
  recipes = recipes.map(r => {
    if (OLD_TYPES.includes(r.type)) {
      changed = true;
      return {...r, type: 'goto'};
    }
    return r;
  });
  if (changed) save(K.recipes, recipes);
}

function showApp(user) {
  _currentUser = user;
  document.getElementById('landingScreen').style.display = 'none';
  document.getElementById('authScreen').style.display    = 'none';
  document.getElementById('accessGate').style.display    = 'none';
  document.getElementById('appRoot').style.display       = 'block';
  const ue = document.getElementById('userEmail');
  if (ue) ue.textContent = user.email;
  // Restore last active tab
  const savedTab = localStorage.getItem('mpos_active_tab');
  const validTabs = ['step1','step2','step3','step4','freezer','library'];
  if (savedTab && validTabs.includes(savedTab)) switchTab(savedTab);
}

// ── Email + Password Auth ─────────────────────────────────────
function toggleAuthMode() {
  showAuthState(_authMode === 'signin' ? 'signup' : 'signin');
}

// Single dispatcher — routes to correct handler based on current auth state
function authSubmit() {
  if(_authMode==='forgot') sendPasswordReset();
  else if(_authMode==='reset') submitPasswordReset();
  else handleAuth();
}

// Send password reset email via Supabase (no Netlify function needed)
async function sendPasswordReset() {
  const email = document.getElementById('authEmail').value.trim();
  const btn   = document.getElementById('authBtn');
  const msg   = document.getElementById('authMsg');
  if(!email){
    msg.textContent='Please enter your email address.';
    msg.className='auth-msg error'; return;
  }
  btn.disabled=true; btn.textContent='Sending…';
  const { error } = await _sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname
  });
  btn.disabled=false; btn.textContent='Send Reset Link';
  if(error){
    msg.textContent=error.message||'Could not send reset email. Please try again.';
    msg.className='auth-msg error';
  } else {
    msg.textContent='✓ Check your inbox — reset link sent.';
    msg.className='auth-msg success';
  }
}

// Set new password after user clicks the reset link in their email.
// Uses the REST API directly with the token saved at PASSWORD_RECOVERY time —
// avoids the Supabase JS localStorage lock that causes "lock stole" errors
// when updateUser() and the SDK's internal state run concurrently.
async function submitPasswordReset() {
  const password = document.getElementById('authNewPassword').value;
  const btn      = document.getElementById('authBtn');
  const msg      = document.getElementById('authMsg');
  if(!password||password.length<6){
    msg.textContent='Password must be at least 6 characters.';
    msg.className='auth-msg error'; return;
  }
  if(!_recoveryToken){
    msg.textContent='Your reset link has expired. Please request a new one.';
    msg.className='auth-msg error';
    setTimeout(() => showAuthState('forgot'), 2500);
    return;
  }
  btn.disabled=true; btn.textContent='Saving…';
  try {
    const res  = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method : 'PUT',
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': `Bearer ${_recoveryToken}`,
        'apikey'       : SUPABASE_KEY
      },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    btn.disabled=false; btn.textContent='Set New Password';
    if(!res.ok){
      msg.textContent = data.message || data.error_description || 'Could not update password. Try requesting a new reset link.';
      msg.className='auth-msg error';
    } else {
      _recoveryToken = null;
      msg.textContent='✓ Password updated — signing you in…';
      msg.className='auth-msg success';
      // Sign in automatically with the new password
      const { data: signInData, error: signInErr } = await _sb.auth.signInWithPassword({ email: data.email, password });
      if(!signInErr && signInData.session) await handleSession(signInData.session);
    }
  } catch(e) {
    btn.disabled=false; btn.textContent='Set New Password';
    msg.textContent='Error: ' + (e?.message || e?.toString() || 'Unknown error');
    msg.className='auth-msg error';
    console.error('submitPasswordReset error:', e);
  }
}

async function handleAuth() {
  const email    = document.getElementById('authEmail').value.trim().toLowerCase();
  const password = document.getElementById('authPassword').value;
  const msg      = document.getElementById('authMsg');
  const btn      = document.getElementById('authBtn');

  if (!email || !password) {
    msg.textContent = 'Please enter your email and password.';
    msg.className = 'auth-msg error'; return;
  }
  if (password.length < 6) {
    msg.textContent = 'Password must be at least 6 characters.';
    msg.className = 'auth-msg error'; return;
  }

  btn.disabled = true;
  btn.textContent = _authMode === 'signin' ? 'Signing in…' : 'Creating account…';

  if (_authMode === 'signin') {
    const { data, error } = await _sb.auth.signInWithPassword({ email, password });
    if (error) {
      msg.textContent = error.message || 'Sign in failed. Please check your credentials.';
      msg.className = 'auth-msg error'; btn.disabled = false; btn.textContent = 'Sign In';
    } else if (data.session) {
      await handleSession(data.session);
    }
  } else {
    const { data, error } = await _sb.auth.signUp({ email, password });
    if (error) {
      msg.textContent = error.message || 'Sign up failed. Please try again.';
      msg.className = 'auth-msg error'; btn.disabled = false; btn.textContent = 'Create Account'; return;
    }
    // Create a profile row for metadata
    if (data.user) {
      await _sb.from('profiles').upsert({
        id: data.user.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    }
    if (data.session) {
      await handleSession(data.session);
    } else {
      msg.textContent = '✓ Account created! Check your email to confirm, then sign in here.';
      msg.className = 'auth-msg success'; btn.disabled = false; btn.textContent = 'Create Account';
    }
  }
}

// ── Sign out ─────────────────────────────────────────────────
async function signOut() {
  await _sb.auth.signOut();
  // Reload the page for a clean slate — clears all in-memory state
  window.location.reload();
}

// ── Check and claim payment entitlement ──────────────────────
// Source of truth for access. Never trusts the URL — always queries the DB.
async function checkAndClaimAccess(userId) {
  // 1. Already claimed and active for this user?
  const { data: active } = await _sb
    .from('payment_entitlements')
    .select('id')
    .eq('claimed_by_user_id', userId)
    .eq('access_status', 'active')
    .eq('payment_status', 'paid')
    .maybeSingle();
  if (active) return true;

  // 2. Unclaimed paid entitlement matching this user's email? (RLS enforces email match)
  const { data: unclaimed } = await _sb
    .from('payment_entitlements')
    .select('id')
    .eq('payment_status', 'paid')
    .eq('access_status', 'unclaimed')
    .maybeSingle();
  if (!unclaimed) return false;

  // 3. Claim it — link this user_id to the entitlement
  const { error } = await _sb
    .from('payment_entitlements')
    .update({
      claimed_by_user_id: userId,
      claimed_at:         new Date().toISOString(),
      access_status:      'active',
      granted_at:         new Date().toISOString(),
      updated_at:         new Date().toISOString(),
    })
    .eq('id', unclaimed.id)
    .eq('access_status', 'unclaimed'); // Guard against race conditions

  if (error) { console.error('Failed to claim entitlement:', error.message); return false; }
  return true;
}

// ── Stripe: start checkout via Payment Link ───────────────────
function startCheckout() {
  window.location.href = 'https://buy.stripe.com/dRmbJ1ewoaCH4cI7Uk3sI00';
}

// ── Cloud load / save ─────────────────────────────────────────
async function loadFromSupabase(userId) {
  const { data, error } = await _sb
    .from('user_data').select('*').eq('user_id', userId).single();
  if (error || !data) return null;
  return data;
}

function scheduleSyncToSupabase() {
  if (!_currentUser) return;
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(syncToSupabase, 2000);
}

async function syncToSupabase() {
  if (!_currentUser) return;
  const payload = {
    user_id:     _currentUser.id,
    recipes:     recipes,
    assignments: mealPlan,
    week_notes:  weekNotes,
    week_start:  localStorage.getItem('mpos_weekstart') || '',
    freezer:     freezer,
    groceries:   { staples, flexItems, checks, adhocItems },
    updated_at:  new Date().toISOString()
  };
  const { error: syncErr } = await _sb.from('user_data').upsert(payload, { onConflict: 'user_id' });
  if (syncErr) console.error('Cloud sync failed:', syncErr.message);
}

async function migrateIfNeeded(userId) {
  const cloud = await loadFromSupabase(userId);
  if (cloud) return cloud;
  const localRecipes = localStorage.getItem('mpos_recipes_v2');
  if (!localRecipes) return null;
  await syncToSupabase();
  return null;
}

function applyCloudData(data) {
  if (!data) return;
  if (Array.isArray(data.recipes))  { recipes   = data.recipes;    save(K.recipes,   recipes); }
  if (data.assignments)             { mealPlan  = data.assignments; save(K.mealPlan,  mealPlan); }
  if (data.week_notes !== undefined) { weekNotes = data.week_notes;  save(K.weekNotes, weekNotes); }
  if (data.freezer)                 { freezer   = data.freezer;     save(K.freezer,   freezer); }
  if (data.groceries) {
    if (data.groceries.staples)    { staples     = data.groceries.staples;     save(K.staples,     staples); }
    if (data.groceries.flexItems)  { flexItems   = data.groceries.flexItems;   save(K.flexItems,   flexItems); }
    if (data.groceries.checks)     { checks      = data.groceries.checks;      save(K.checks,      checks); }
    if (data.groceries.adhocItems) { adhocItems  = data.groceries.adhocItems;  save(K.adhocItems,  adhocItems); }
  }
}

function renderSteps(notes) {
  if (!notes || !notes.trim()) return '';
  var steps = notes.split('\n').filter(function(s){ return s.trim(); });
  if (!steps.length) return '';
  var items = steps.map(function(s){ return '<li>' + s.trim() + '</li>'; }).join('');
  return '<div class="recipe-card-note"><ol class="recipe-steps">' + items + '</ol></div>';
}

function renderAll() {
  renderWeek(); renderMealSections(); renderMealPlan();
  renderGrocery(); renderFreezer(); renderLibrary(); updateWeekBadge();
}

// ── Patch save() to also trigger cloud sync ───────────────────
const _origSave = save;
window.save = function(k, v) { _origSave(k, v); scheduleSyncToSupabase(); };

// ── Bootstrap ────────────────────────────────────────────────
let _isRecoveryFlow = false;    // guard: prevents SIGNED_IN from overriding the reset form
let _initialRouteDone = false;  // prevents double-routing between getSession and onAuthStateChange

async function initAuth() {
  // CRITICAL ORDER: register onAuthStateChange BEFORE calling getSession().
  // With Supabase PKCE flow, the ?code= token in the URL is exchanged during
  // getSession(). If the listener isn't registered yet, we miss PASSWORD_RECOVERY
  // and fall through to SIGNED_IN, which loads the app instead of the reset form.
  _sb.auth.onAuthStateChange(async (event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      _isRecoveryFlow = true;
      _initialRouteDone = true;
      _recoveryToken = session?.access_token || null; // save for REST call — avoids SDK lock
      document.getElementById('authScreen').style.display = 'flex';
      document.getElementById('appRoot').style.display    = 'none';
      showAuthState('reset');
      return;
    }
    if (event === 'USER_UPDATED') {
      _isRecoveryFlow = false;
      if (session) await handleSession(session);
      return;
    }
    // Block any event (SIGNED_IN etc) while mid-reset
    if (_isRecoveryFlow) return;
    // On first load, getSession() handles routing below — don't double-fire
    if (!_initialRouteDone) return;
    if (session) await handleSession(session);
    else showAuth();
  });

  // Implicit flow: older Supabase email links put #type=recovery in the hash
  if (window.location.hash.includes('type=recovery')) {
    _isRecoveryFlow = true;
    _initialRouteDone = true;
    document.getElementById('authScreen').style.display = 'flex';
    showAuthState('reset');
    return;
  }

  // Normal page load — check for an existing session and route
  const { data: { session } } = await _sb.auth.getSession();
  const params        = new URLSearchParams(window.location.search);
  const isPostPayment = params.get('payment') === 'success';

  // onAuthStateChange may have already caught a PASSWORD_RECOVERY above — don't override it
  if (_isRecoveryFlow) return;

  _initialRouteDone = true;

  if (session) {
    await handleSession(session);
  } else if (isPostPayment) {
    window.history.replaceState({}, '', window.location.pathname);
    showAuth('🎉 Payment confirmed! Create an account (or sign in) with the same email you used at checkout to get instant access.');
  } else {
    showAuth();
  }
}

async function handleSession(session) {
  const user   = session.user;
  const params = new URLSearchParams(window.location.search);

  // Clean up URL immediately so refreshing doesn't re-trigger polling
  if (params.get('payment') === 'success') {
    window.history.replaceState({}, '', window.location.pathname);
    // Webhook may not have fired yet — poll up to 6s
    let tries = 0;
    while (tries < 6) {
      const access = await checkAndClaimAccess(user.id);
      if (access) { showApp(user); await loadAndRender(user.id); return; }
      await new Promise(r => setTimeout(r, 1000));
      tries++;
    }
    // Webhook took too long — show access gate; user can refresh to retry
    showAccessGate(user);
    return;
  }

  const access = await checkAndClaimAccess(user.id);
  if (!access) { showAccessGate(user); return; }

  showApp(user);
  await loadAndRender(user.id);
}

async function loadAndRender(userId) {
  await migrateIfNeeded(userId);
  const cloud = await loadFromSupabase(userId);
  applyCloudData(cloud);
  normalizeRecipeTypes();
  renderAll();
}

// ── Flush pending cloud save on tab close ────────────────────
window.addEventListener('beforeunload', () => {
  if (_saveTimer) { clearTimeout(_saveTimer); syncToSupabase(); }
});

// ── Start ────────────────────────────────────────────────────
initAuth();
