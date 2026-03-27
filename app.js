//   DATA
// ╚═══════════════════════════════════════╝
const K = {
  recipes:'mpos_recipes_v2', weekNotes:'mpos_notes_v2',
  mealPlan:'mpos_plan_v2', staples:'mpos_staples_v2',
  flexItems:'mpos_flex_v2', freezer:'mpos_freezer_v2',
  checks:'mpos_checks_v2',
};

const DAYS = ['monday','tuesday','wednesday','thursday','friday'];
const DAY_FULL = {monday:'Monday',tuesday:'Tuesday',wednesday:'Wednesday',thursday:'Thursday',friday:'Friday'};
const MEALS = ['breakfast','lunch','dinner'];
const MEAL_ICON = {breakfast:'🌅',lunch:'☀️',dinner:'🌙'};
const CATS = ['Produce','Protein','Grains & Breads','Dairy / Dairy-Free','Pantry & Seasonings','Freezer / Flex','Snacks / Extras'];
const CAT_ICON = {'Produce':'🥬','Protein':'🍗','Grains & Breads':'🌾','Dairy / Dairy-Free':'🥛','Pantry & Seasonings':'🧂','Freezer / Flex':'❄️','Snacks / Extras':'🥜'};

const BREAKFAST_TYPES = [
  {id:'easy',    icon:'⚡', name:'Easy Go-To',   sub:'Your no-decision breakfast'},
  {id:'prep',    icon:'🥣', name:'Meal Prep',     sub:'Made ahead of time'},
  {id:'quick',   icon:'⏱️', name:'Quick & Simple',sub:'Under 5 minutes'},
  {id:'out',     icon:'☕', name:'Out / On the Go',sub:'Coffee shop, grab & go'},
];
const LUNCH_TYPES = [
  {id:'easy',     icon:'⚡', name:'Easy Lunch',      sub:'Quick and reliable'},
  {id:'leftovers',icon:'🍱', name:'Leftovers',        sub:'From yesterday\'s dinner'},
  {id:'freezer',  icon:'❄️', name:'Freezer Meal',     sub:'Pull from your freezer'},
  {id:'lunchout', icon:'🥡', name:'Lunch Out',         sub:'Takeout, delivery, or dining out'},
];
const DINNER_TYPES = [
  {id:'goto',    icon:'⚡', name:'Easy Go-To',                  sub:'A reliable weeknight staple'},
  {id:'freezer', icon:'❄️', name:'Freezer Meal',               sub:'Pull from your freezer'},
  {id:'takeout', icon:'🥡', name:'Takeout / Delivery / Dining Out', sub:'Planned — not last minute'},
  {id:'fun',     icon:'✨', name:'Fun Night',                   sub:'Something new or special'},
];
const TYPE_MAP = {breakfast:BREAKFAST_TYPES, lunch:LUNCH_TYPES, dinner:DINNER_TYPES};

// Starter recipes — only loaded on first visit
const STARTER_RECIPES = [
  {id:'sr1',type:'breakfast',name:'Overnight Oatmeal',servings:5,
   notes:'Make 5 jars in under 10 minutes. Base: oats + milk 1:1 ratio.',
   ingredients:[
     {name:'Oats',qty:'1 cup',category:'Grains & Breads'},
     {name:'Milk',qty:'1 cup',category:'Dairy / Dairy-Free'},
     {name:'Mixed Berries',qty:'½ cup',category:'Produce'},
     {name:'Greek Yogurt',qty:'¼ cup',category:'Dairy / Dairy-Free'},
   ]},
  {id:'sr2',type:'breakfast',name:'Yogurt Parfait',servings:2,
   notes:'Layer and go. Great for rushed mornings.',
   ingredients:[
     {name:'Greek Yogurt',qty:'1 cup',category:'Dairy / Dairy-Free'},
     {name:'Granola',qty:'½ cup',category:'Grains & Breads'},
     {name:'Berries',qty:'½ cup',category:'Produce'},
   ]},
  {id:'sr3',type:'lunch',name:'Tuna Sandwich + Apple',servings:2,
   notes:'Prep in under 10 min, or make the night before.',
   ingredients:[
     {name:'Canned Tuna',qty:'1 can',category:'Protein'},
     {name:'Mayo',qty:'2 tbsp',category:'Pantry & Seasonings'},
     {name:'Bread',qty:'2 slices',category:'Grains & Breads'},
     {name:'Apple',qty:'1',category:'Produce'},
   ]},
  {id:'sr4',type:'lunch',name:'Lentil Soup',servings:6,
   notes:'Batch cook Sunday. Lasts all week in the fridge.',
   ingredients:[
     {name:'Lentils',qty:'1 cup',category:'Pantry & Seasonings'},
     {name:'Veggie Stock',qty:'4 cups',category:'Pantry & Seasonings'},
     {name:'Carrots',qty:'2',category:'Produce'},
     {name:'Onion',qty:'1',category:'Produce'},
     {name:'Garlic',qty:'3 cloves',category:'Produce'},
   ]},
  {id:'sr5',type:'dinner',name:'Sheet Pan Chicken & Veggies',servings:4,
   notes:'350°F for 30-45 min. Easy weeknight meal — make extra for leftover lunch.',
   ingredients:[
     {name:'Chicken',qty:'1 lb',category:'Protein'},
     {name:'Red Potatoes',qty:'4',category:'Produce'},
     {name:'Mixed Vegetables',qty:'2 cups',category:'Produce'},
     {name:'Olive Oil',qty:'2 tbsp',category:'Pantry & Seasonings'},
   ]},
  {id:'sr6',type:'dinner',name:'Pasta Marinara',servings:4,
   notes:'Simple and fast. Add protein if you want.',
   ingredients:[
     {name:'Pasta',qty:'8 oz',category:'Grains & Breads'},
     {name:'Marinara Sauce',qty:'1 jar',category:'Pantry & Seasonings'},
     {name:'Parmesan',qty:'¼ cup',category:'Dairy / Dairy-Free'},
   ]},
];

// ── RECIPE LIBRARY ─────────────────────────────────────────────────────────
// Curated by Meal Planning OS. These are read-only — users copy them into
// their own Go-To Meals. libraryId is preserved on the copy so we can detect
// "already added" without a name match.
const LIBRARY_RECIPES = [

  // ── BREAKFAST ──────────────────────────────────────────────────────────
  {id:'lb1', type:'breakfast', name:'PB Banana Smoothie', servings:1,
   tags:['Under 5 Min','High Protein'],
   notes:'Blend and go. Under 3 minutes. Double the batch if you\'re making for two.',
   ingredients:[
     {name:'Banana',          qty:'1',       category:'Produce'},
     {name:'Peanut Butter',   qty:'2 tbsp',  category:'Pantry & Seasonings'},
     {name:'Milk',            qty:'1 cup',   category:'Dairy / Dairy-Free'},
     {name:'Protein Powder',  qty:'1 scoop', category:'Pantry & Seasonings'},
   ]},

  {id:'lb2', type:'breakfast', name:'Egg & Avocado Toast', servings:1,
   tags:['Quick & Easy','High Protein'],
   notes:'Toast the bread, mash the avo, fry the egg. On the table in 8 minutes.',
   ingredients:[
     {name:'Bread',        qty:'2 slices', category:'Grains & Breads'},
     {name:'Avocado',      qty:'½',        category:'Produce'},
     {name:'Eggs',         qty:'2',        category:'Protein'},
     {name:'Salt & Pepper',qty:'to taste', category:'Pantry & Seasonings'},
   ]},

  {id:'lb3', type:'breakfast', name:'Meal Prep Hard-Boiled Eggs', servings:6,
   tags:['Meal Prep','Batch Cook','High Protein'],
   notes:'Boil a batch on Sunday. Grab 2 every morning with fruit or toast. The easiest no-decision breakfast there is.',
   ingredients:[
     {name:'Eggs', qty:'6',       category:'Protein'},
     {name:'Salt', qty:'to taste',category:'Pantry & Seasonings'},
   ]},

  {id:'lb4', type:'breakfast', name:'2-Ingredient Banana Oat Pancakes', servings:2,
   tags:['Quick & Easy','Budget Friendly'],
   notes:'Mash ripe bananas into oats, pan-fry 2 min per side. Top with honey or berries. Surprisingly filling for how simple they are.',
   ingredients:[
     {name:'Bananas', qty:'2',     category:'Produce'},
     {name:'Oats',    qty:'1 cup', category:'Grains & Breads'},
     {name:'Honey',   qty:'1 tbsp',category:'Pantry & Seasonings'},
     {name:'Berries', qty:'½ cup', category:'Produce'},
   ]},

  // ── LUNCH ──────────────────────────────────────────────────────────────
  {id:'lb5', type:'lunch', name:'Rotisserie Chicken Rice Bowl', servings:2,
   tags:['Easy Lunch','High Protein'],
   notes:'Grab a rotisserie chicken from the store. Shred it over rice and greens — done in 5 minutes once the rice is cooked.',
   ingredients:[
     {name:'Rotisserie Chicken', qty:'½ chicken', category:'Protein'},
     {name:'Rice',               qty:'1 cup',     category:'Grains & Breads'},
     {name:'Mixed Greens',       qty:'2 cups',    category:'Produce'},
     {name:'Olive Oil',          qty:'1 tbsp',    category:'Pantry & Seasonings'},
   ]},

  {id:'lb6', type:'lunch', name:'Turkey & Avocado Wrap', servings:1,
   tags:['Easy Lunch','Meal Prep'],
   notes:'Roll it up the night before and it\'s ready to grab on the way out. Add a handful of chips or a piece of fruit and you\'re set.',
   ingredients:[
     {name:'Large Tortilla', qty:'1',     category:'Grains & Breads'},
     {name:'Turkey',         qty:'4 oz',  category:'Protein'},
     {name:'Avocado',        qty:'½',     category:'Produce'},
     {name:'Spinach',        qty:'1 cup', category:'Produce'},
     {name:'Mustard',        qty:'1 tbsp',category:'Pantry & Seasonings'},
   ]},

  {id:'lb7', type:'lunch', name:'Greek Chickpea Salad', servings:2,
   tags:['No Cook','Meal Prep','Budget Friendly'],
   notes:'No cooking required. Make a big batch and it holds in the fridge for 3 days. Great for back-to-back lunches.',
   ingredients:[
     {name:'Chickpeas',       qty:'1 can',  category:'Protein'},
     {name:'Cucumber',        qty:'1',      category:'Produce'},
     {name:'Cherry Tomatoes', qty:'1 cup',  category:'Produce'},
     {name:'Feta',            qty:'¼ cup',  category:'Dairy / Dairy-Free'},
     {name:'Olive Oil',       qty:'2 tbsp', category:'Pantry & Seasonings'},
     {name:'Lemon Juice',     qty:'1 tbsp', category:'Pantry & Seasonings'},
   ]},

  {id:'lb8', type:'lunch', name:'Simple Egg Salad', servings:2,
   tags:['Meal Prep','High Protein','Easy Lunch'],
   notes:'Make it Sunday, eat it on toast all week. One of the easiest high-protein lunches you can prep ahead.',
   ingredients:[
     {name:'Eggs',    qty:'4',       category:'Protein'},
     {name:'Mayo',    qty:'2 tbsp',  category:'Pantry & Seasonings'},
     {name:'Mustard', qty:'1 tsp',   category:'Pantry & Seasonings'},
     {name:'Bread',   qty:'4 slices',category:'Grains & Breads'},
   ]},

  // ── DINNER ─────────────────────────────────────────────────────────────
  {id:'lb9', type:'dinner', name:'White Chicken Chili', servings:6,
   tags:['Freezer Friendly','Batch Cook','High Protein'],
   notes:'Make a big batch and freeze half. On a busy night, just pull it from the freezer. One of the best weapons in your meal planning arsenal.',
   ingredients:[
     {name:'Ground Chicken',    qty:'1 lb',  category:'Protein'},
     {name:'White Beans',       qty:'1 can', category:'Protein'},
     {name:'Chicken Broth',     qty:'2 cups',category:'Pantry & Seasonings'},
     {name:'Diced Green Chiles',qty:'1 can', category:'Pantry & Seasonings'},
     {name:'Cumin',             qty:'1 tsp', category:'Pantry & Seasonings'},
     {name:'Cream Cheese',      qty:'2 oz',  category:'Dairy / Dairy-Free'},
   ]},

  {id:'lb10', type:'dinner', name:'Baked Salmon & Roasted Broccoli', servings:2,
   tags:['Quick & Easy','High Protein'],
   notes:'400°F for 20 minutes. One pan, minimal cleanup. The go-to when you want something healthy without the effort.',
   ingredients:[
     {name:'Salmon Fillets', qty:'2',       category:'Protein'},
     {name:'Broccoli',       qty:'2 cups',  category:'Produce'},
     {name:'Olive Oil',      qty:'2 tbsp',  category:'Pantry & Seasonings'},
     {name:'Lemon',          qty:'1',       category:'Produce'},
     {name:'Garlic',         qty:'2 cloves',category:'Produce'},
   ]},

  {id:'lb11', type:'dinner', name:'Turkey Meatballs & Marinara', servings:4,
   tags:['Freezer Friendly','Batch Cook'],
   notes:'Double the batch and freeze half. Serve over pasta, with crusty bread, or alongside a salad. The freezer version saves countless weeknights.',
   ingredients:[
     {name:'Ground Turkey',  qty:'1 lb',    category:'Protein'},
     {name:'Egg',            qty:'1',       category:'Protein'},
     {name:'Breadcrumbs',    qty:'¼ cup',   category:'Grains & Breads'},
     {name:'Garlic',         qty:'2 cloves',category:'Produce'},
     {name:'Marinara Sauce', qty:'1 jar',   category:'Pantry & Seasonings'},
   ]},

  {id:'lb12', type:'dinner', name:'Black Bean Tacos', servings:2,
   tags:['Under 15 Min','Budget Friendly'],
   notes:'10-minute dinner. Keep canned black beans stocked and this is always on the table. Add leftover chicken or ground beef if you want protein.',
   ingredients:[
     {name:'Small Tortillas', qty:'4',     category:'Grains & Breads'},
     {name:'Black Beans',     qty:'1 can', category:'Protein'},
     {name:'Salsa',           qty:'½ cup', category:'Pantry & Seasonings'},
     {name:'Shredded Cheese', qty:'¼ cup', category:'Dairy / Dairy-Free'},
     {name:'Lime',            qty:'1',     category:'Produce'},
   ]},
];

const DEFAULT_STAPLES = [
  {id:'st1',name:'Eggs'},{id:'st2',name:'Milk'},{id:'st3',name:'Bread'},
  {id:'st4',name:'Fruit'},{id:'st5',name:'Coffee'},{id:'st6',name:'Olive Oil'},
  {id:'st7',name:'Salt & Pepper'},
];
const DEFAULT_FLEX = [
  {id:'fl1',name:'Frozen broccoli'},{id:'fl2',name:'Canned soup'},
  {id:'fl3',name:'Rotisserie chicken'},{id:'fl4',name:'Trail mix / nuts'},
  {id:'fl5',name:'Frozen pizza (emergency)'},
];

function load(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch{return d;}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}
function uid(){return Math.random().toString(36).substr(2,9);}

let recipes   = load(K.recipes, null);
let weekNotes = load(K.weekNotes, {});
let mealPlan  = load(K.mealPlan, {});
let staples   = load(K.staples, DEFAULT_STAPLES);
let flexItems = load(K.flexItems, DEFAULT_FLEX);
let freezer   = load(K.freezer, []);
let checks    = load(K.checks, {});

// First visit — blank slate, let users build their own menu
if (recipes === null) { recipes = []; save(K.recipes, recipes); }

// ╔═══════════════════════════════════════╗
//   NAV
// ╚═══════════════════════════════════════╝
function switchTab(id){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  const idx={step1:0,step2:1,step3:2,step4:3,freezer:4,library:5}[id];
  document.querySelectorAll('.nav-tab')[idx].classList.add('active');
  if(id==='library') renderLibrary();
  if(id==='step3') renderMealPlan();
  if(id==='step4') renderGrocery();
  if(id==='freezer') renderFreezer();
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
    {id:'all',       label:'All'},
    {id:'breakfast', label:'🌅 Breakfast'},
    {id:'lunch',     label:'☀️ Lunch'},
    {id:'dinner',    label:'🌙 Dinner'},
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
    const catFull=!alreadyAdded && typeCount>=5;

    // Ingredient preview (first 4)
    const ingList=lr.ingredients.slice(0,4).map(i=>i.name).join(', ')
      +(lr.ingredients.length>4?` +${lr.ingredients.length-4} more`:'');

    // Servings label
    const srvLabel=lr.servings===1?'1 serving':''+lr.servings+' servings per batch';

    // Type badge
    const typeName=lr.type.charAt(0).toUpperCase()+lr.type.slice(1);
    const typeClass='lib-type-'+lr.type;

    // Footer action
    let footerAction='';
    if(alreadyAdded){
      footerAction=`<span class="lib-badge-added">✓ In Your Go-Tos</span>`;
    } else if(catFull){
      footerAction=`<span class="lib-badge-full">Category full (5/5)</span>`;
    } else {
      footerAction=`<button class="btn btn-primary lib-add-btn" onclick="addFromLibrary('${lr.id}')">+ Add to My Go-Tos</button>`;
    }

    // Tag pills — colour-coded by category
    const tagColorMap={
      'Freezer Friendly':'freezer','Batch Cook':'batch','Meal Prep':'mealprep',
      'Under 5 Min':'quick','Under 15 Min':'quick','Quick & Easy':'quick',
      'High Protein':'protein','No Cook':'nocook',
      'Easy Lunch':'easy','Budget Friendly':'budget',
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
  if(recipes.filter(r=>r.type===lr.type).length>=5){
    alert('Your '+lr.type+' category is full — remove one recipe to make room, then try again.');
    return;
  }
  // Copy recipe into user's list
  const newRecipe={
    id: uid(),
    libraryId: lr.id,
    type: lr.type,
    name: lr.name,
    servings: lr.servings,
    notes: lr.notes||'',
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
      });
    });
  });
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
      <div style="font-size:13px;color:var(--text-2);max-width:320px;margin:0 auto 18px;line-height:1.55">Add your go-to meals here — recipes you already know and trust. Or browse the library to get started fast.</div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="openRecipeModal(null,'breakfast')">+ Add a Recipe</button>
        <button class="btn btn-secondary" onclick="switchTab('library')">📚 Browse Library</button>
      </div>
    </div>`;
    return;
  }
  MEALS.forEach(type=>{
    const list=recipes.filter(r=>r.type===type);
    const rem=5-list.length;
    const wrap=document.createElement('div');
    wrap.innerHTML=`
      <div class="meal-section-header">
        <div class="meal-type-label">
          <div class="meal-type-icon ${type}">${MEAL_ICON[type]}</div>
          <div>
            <div class="meal-type-title">${type.charAt(0).toUpperCase()+type.slice(1)}</div>
            <div class="meal-slots-count">${list.length}/5 — ${rem>0?rem+' slot'+(rem>1?'s':'')+' left':'No-Decision Menu locked in ✓'}</div>
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
        ${r.notes?`<div class="recipe-card-note">${r.notes}</div>`:''}
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
      slot.innerHTML=`<div class="plus">+</div><div class="slot-text">Add a ${type} recipe</div>`;
      grid.appendChild(slot);
    } else {
      const max=document.createElement('div');
      max.className='max-reached';
      max.innerHTML=`<strong>5/5 ✓</strong><span>Menu locked in — no decisions needed.</span>`;
      grid.appendChild(max);
    }
  });
}

let _editId=null, _editType='breakfast';
function openRecipeModal(id,type){
  _editId=id;
  const r=id?recipes.find(x=>x.id===id):null;
  _editType=type||(r?r.type:'breakfast');
  document.getElementById('recipeModalTitle').textContent=id?'Edit Recipe':'Add Recipe';
  document.getElementById('r_name').value=r?r.name:'';
  document.getElementById('r_servings').value=r?r.servings:4;
  document.getElementById('r_notes').value=r?r.notes||'':'';
  document.getElementById('r_type').value=r?r.type:_editType;
  document.getElementById('ingRows').innerHTML='';
  const ings=r?r.ingredients:[];
  if(ings.length===0) addIngRow(); else ings.forEach(i=>addIngRow(i));
  // Show revert button only when editing a library-sourced recipe
  const revertBtn=document.getElementById('revertBtn');
  if(revertBtn) revertBtn.style.display=(r&&r.libraryId)?'inline-block':'none';
  document.getElementById('recipeModal').classList.add('open');
  setTimeout(()=>document.getElementById('r_name').focus(),100);
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
  const data={name,type,servings:parseInt(document.getElementById('r_servings').value)||4,notes:document.getElementById('r_notes').value.trim(),ingredients:ings};
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
  document.getElementById('r_notes').value=lr.notes||'';
  document.getElementById('r_type').value=lr.type;
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
  if(meal==='breakfast') return 'type-breakfast';
  if(meal==='lunch') return a.mealType==='freezer'?'type-dinner-freezer':a.mealType==='lunchout'?'type-dinner-takeout':'type-lunch';
  return 'type-dinner-'+(a.mealType||'goto');
}
function getCellTag(meal,a){
  const t=a.mealType;
  if(!t) return '';
  const map={
    easy:'<span class="cell-tag tag-goto">⚡ Easy Go-To</span>',
    prep:'<span class="cell-tag tag-goto">🥣 Meal Prep</span>',
    quick:'<span class="cell-tag tag-goto">⏱️ Quick</span>',
    out:'<span class="cell-tag tag-takeout">☕ Out</span>',
    leftovers:'<span class="cell-tag tag-leftovers">🍱 Leftovers</span>',
    freezer:'<span class="cell-tag tag-freezer">❄️ Freezer</span>',
    lunchout:'<span class="cell-tag tag-lunchout">🥡 Lunch Out</span>',
    goto:'<span class="cell-tag tag-goto">⚡ Easy Go-To</span>',
    takeout:'<span class="cell-tag tag-takeout">🥡 Takeout / Dining Out</span>',
    fun:'<span class="cell-tag tag-fun">✨ Fun Night</span>',
  };
  return map[t]||'';
}
function removeCell(d,m){if(mealPlan[d])delete mealPlan[d][m];save(K.mealPlan,mealPlan);renderMealPlan();}

// Assign modal
let _aC={};
function openAssignModal(day,meal){
  _aC={day,meal,name:'',servings:2,mealType:null,recipeId:null};
  _lastAutoFill=''; // reset on every open so previous modal state doesn't bleed through
  const existing=mealPlan[day]&&mealPlan[day][meal];
  if(existing){_aC={..._aC,...existing};}
  document.getElementById('assignModalTitle').textContent=MEAL_ICON[meal]+' '+DAY_FULL[day]+' '+meal.charAt(0).toUpperCase()+meal.slice(1);
  const types=TYPE_MAP[meal];
  const typeRecipes=recipes.filter(r=>r.type===meal);
  let html='';
  // Type grid
  html+=`<div style="font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">What's the plan?</div>`;
  html+=`<div class="assign-type-grid">`;
  types.forEach(t=>{
    const sel=_aC.mealType===t.id?'sel':'';
    html+=`<div class="assign-type-btn ${sel}" data-tid="${t.id}" onclick="selectAType('${t.id}')">
      <div class="atype-icon">${t.icon}</div>
      <div class="atype-name">${t.name}</div>
      <div class="atype-sub">${t.sub}</div>
    </div>`;
  });
  html+='</div>';
  // Meal name (optional)
  html+=`<div style="font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;margin-top:4px">Meal Name <span style="font-weight:400;text-transform:none;letter-spacing:0">(optional)</span></div>`;
  html+=`<div class="form-group" style="margin-bottom:10px"><input type="text" id="a_mealName" placeholder="Leave blank to use the type label, or type a specific meal…" value="${existing?existing.name:''}"></div>`;
  // Freezer picker — shown when freezer type selected
  const isFreezerType=_aC.mealType==='freezer';
  html+=`<div id="freezerPickerSection" style="display:${isFreezerType?'block':'none'}">`;
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
  // Recipe picker — hidden when freezer type selected
  if(typeRecipes.length>0){
    html+=`<div id="recipePickerSection" style="display:${isFreezerType?'none':'block'}">`;
    html+=`<div style="font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Pick from your Go-To Meals <span style="font-weight:400;text-transform:none;letter-spacing:0">(optional)</span></div>`;
    html+=`<div class="recipe-picker" id="recipePicker">`;
    typeRecipes.forEach(r=>{
      const sel=_aC.recipeId===r.id?'sel':'';
      html+=`<div class="recipe-pick-opt ${sel}" data-rid="${r.id}" onclick="pickRecipe('${r.id}','${r.name.replace(/'/g,"\\'")}',${r.servings})">
        <span class="rpo-name">${r.name}</span>
        <span class="rpo-sub">${r.servings} srv</span>
      </div>`;
    });
    html+='</div></div>';
  }
  // Servings
  html+=`<div style="display:flex;align-items:center;gap:10px;margin-top:14px">
    <label style="margin:0;white-space:nowrap">Servings:</label>
    <input type="number" id="a_servings" min="1" max="50" value="${existing?existing.servings:2}" style="width:80px">
  </div>`;
  document.getElementById('assignModalBody').innerHTML=html;
  document.getElementById('assignModal').classList.add('open');
}
let _lastAutoFill='';
function selectAType(id){
  _aC.mealType=id;
  // Clear freezer selection if switching away
  if(id!=='freezer'){ _aC.freezerId=null; _aC.freezerItem=false; }
  document.querySelectorAll('.assign-type-btn').forEach(b=>b.classList.toggle('sel',b.dataset.tid===id));
  // Show/hide freezer vs recipe pickers
  const fzSec=document.getElementById('freezerPickerSection');
  const recSec=document.getElementById('recipePickerSection');
  if(fzSec) fzSec.style.display=id==='freezer'?'block':'none';
  if(recSec) recSec.style.display=id==='freezer'?'none':'block';
  // Auto-fill name: update if field is empty OR still showing a previous auto-fill value
  const nameEl=document.getElementById('a_mealName');
  const autoNames={takeout:'Planned Takeout / Delivery / Dining Out',lunchout:'Lunch Out',out:'Out / On the Go'};
  const currentIsAutoFilled=nameEl.value===_lastAutoFill;
  if(!nameEl.value||currentIsAutoFilled){
    const newAuto=autoNames[id]||'';
    nameEl.value=newAuto;
    _lastAutoFill=newAuto;
  }
}
function pickRecipe(id,name,servings){
  _aC.recipeId=id; _aC.freezerId=null; _aC.freezerItem=false;
  document.querySelectorAll('.recipe-pick-opt[data-rid]').forEach(b=>b.classList.toggle('sel',b.dataset.rid===id));
  document.querySelectorAll('.recipe-pick-opt[data-fid]').forEach(b=>b.classList.remove('sel'));
  document.getElementById('a_mealName').value=name;
  document.getElementById('a_servings').value=servings;
}
function pickFreezerItem(id,name,servings){
  _aC.freezerId=id; _aC.freezerItem=true; _aC.recipeId=null;
  document.querySelectorAll('.recipe-pick-opt[data-fid]').forEach(b=>b.classList.toggle('sel',b.dataset.fid===id));
  document.querySelectorAll('.recipe-pick-opt[data-rid]').forEach(b=>b.classList.remove('sel'));
  document.getElementById('a_mealName').value=name;
  document.getElementById('a_servings').value=servings;
}
function confirmAssign(){
  // Name is optional — fall back to type label or "Meal"
  let name=(document.getElementById('a_mealName').value||'').trim();
  if(!name){
    const typeLabel=TYPE_MAP[_aC.meal]?.find(t=>t.id===_aC.mealType)?.name;
    name=typeLabel||(_aC.meal.charAt(0).toUpperCase()+_aC.meal.slice(1)+' Meal');
  }
  const{day,meal}=_aC;
  if(!mealPlan[day]) mealPlan[day]={};
  mealPlan[day][meal]={
    name,
    servings:parseInt(document.getElementById('a_servings').value)||2,
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

  // Meta
  const meta=document.getElementById('groceryMeta');
  if(meta) meta.textContent=recipeCount>0?`${recipeCount} recipe${recipeCount!==1?'s':''} in your plan this week`:'Add recipes to your meal plan in Step 3 to populate your list.';

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
}

function renderListSection(container,title,subtitle,items,type,refresh,isStaples){
  const sec=document.createElement('div');
  sec.className='list-only-section';
  const inputId='new-'+type+'-input';
  let rows='';
  items.forEach(item=>{
    rows+=`<div class="list-item-row">
      <span class="item-name">${item.name}</span>
      <button class="item-remove" onclick="${isStaples?'removeStaple':'removeFlexItem'}('${item.id}')">✕</button>
    </div>`;
  });
  sec.innerHTML=`<div class="category-header" style="margin-top:10px">
    <span class="category-icon">${title.split(' ')[0]}</span>
    <span class="category-name">${title.replace(/^[^\s]+\s/,'')}</span>
  </div>
  <div style="font-size:12px;color:var(--text-3);margin-bottom:10px">${subtitle}</div>
  <div class="list-only-items" id="list-${type}">${rows}</div>
  <div class="add-list-item" style="margin-top:8px">
    <input type="text" id="${inputId}" placeholder="Add item…" onkeydown="if(event.key==='Enter')${isStaples?'addStaple':'addFlexItem'}()">
    <button class="btn btn-secondary btn-sm" onclick="${isStaples?'addStaple':'addFlexItem'}()">Add</button>
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
// SUPABASE AUTH + SYNC
// ============================================================
// HOW DATA IS STORED:
//   user_access  — keyed by EMAIL.  Webhook writes here after payment.
//   user_data    — keyed by USER ID (UUID). App reads/writes here.
//   localStorage — fast local cache only. Supabase is source of truth.
// ============================================================

const SUPABASE_URL = 'https://vgtsxthotnnvknrqyhec.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_lq13XvUG9YsoiHrU8p36qg_EXE0vo8f';
const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let _currentUser = null;
let _saveTimer   = null;

// ── Auth tab switching ────────────────────────────────────────
function switchAuthTab(tab) {
  const isSignIn = tab === 'signin';
  document.getElementById('tabSignIn').classList.toggle('active', isSignIn);
  document.getElementById('tabSignUp').classList.toggle('active', !isSignIn);
  document.getElementById('panelSignIn').style.display = isSignIn ? 'block' : 'none';
  document.getElementById('panelSignUp').style.display = isSignIn ? 'none' : 'block';
  document.getElementById('authMsg').textContent = '';
}

function setAuthMsg(text, isError) {
  const el = document.getElementById('authMsg');
  el.textContent = text;
  el.className = 'auth-msg ' + (isError ? 'error' : 'success');
}

// ── Sign In (returning users) ─────────────────────────────────
async function signIn() {
  const email    = document.getElementById('siEmail').value.trim();
  const password = document.getElementById('siPassword').value;
  if (!email || !password) { setAuthMsg('Please enter your email and password.', true); return; }

  setAuthMsg('Signing in…', false);
  const { data, error } = await _sb.auth.signInWithPassword({ email, password });
  if (error) {
    setAuthMsg(error.message === 'Invalid login credentials'
      ? 'Incorrect email or password. Try again, or use "Create Account" if you\'re new.'
      : error.message, true);
  }
  // On success, onAuthStateChange fires → handleSession
}

// ── Sign Up (new users who already paid) ─────────────────────
async function signUp() {
  const email    = document.getElementById('suEmail').value.trim();
  const password = document.getElementById('suPassword').value;
  if (!email || !password) { setAuthMsg('Please enter your email and password.', true); return; }
  if (password.length < 6)  { setAuthMsg('Password must be at least 6 characters.', true); return; }

  setAuthMsg('Creating account…', false);
  const { data, error } = await _sb.auth.signUp({ email, password });
  if (error) {
    setAuthMsg(error.message, true);
    return;
  }
  setAuthMsg('Account created! Signing you in…', false);
  // signUp auto-signs in → onAuthStateChange fires → handleSession
}

// ── Sign Out ──────────────────────────────────────────────────
async function signOut() {
  await _sb.auth.signOut();
  _currentUser = null;
  showAuth();
}

// ── UI State ──────────────────────────────────────────────────
function showAuth() {
  document.getElementById('authScreen').style.display  = 'flex';
  document.getElementById('accessGate').style.display  = 'none';
  document.getElementById('appRoot').style.display     = 'none';
}

function showAccessGate(user) {
  _currentUser = user;
  document.getElementById('authScreen').style.display  = 'none';
  document.getElementById('accessGate').style.display  = 'flex';
  document.getElementById('appRoot').style.display     = 'none';
  document.getElementById('gateEmail').textContent     = user.email;
}

function showApp(user) {
  _currentUser = user;
  document.getElementById('authScreen').style.display  = 'none';
  document.getElementById('accessGate').style.display  = 'none';
  document.getElementById('appRoot').style.display     = 'block';
  document.getElementById('userEmail').textContent     = user.email;
}

// ── Access Check: query user_access by email ──────────────────
// The webhook writes the customer's email here after Stripe payment.
// This is the ONLY source of truth for access.
async function hasAccess(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const { data, error } = await _sb
    .from('user_access')
    .select('has_access')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error('Access check error:', error.message);
    return false;
  }
  return data?.has_access === true;
}

// ── Cloud Persistence ─────────────────────────────────────────
// user_data is keyed by user_id (UUID from Supabase auth).
// This is stable — it never changes even if email changes.

async function loadFromSupabase(userId) {
  const { data, error } = await _sb
    .from('user_data')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) { console.error('Load error:', error.message); return null; }
  return data;
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
    groceries:   { staples, flexItems, checks },
    updated_at:  new Date().toISOString(),
  };
  const { error } = await _sb
    .from('user_data')
    .upsert(payload, { onConflict: 'user_id' });
  if (error) console.error('Sync error:', error.message);
}

function scheduleSyncToSupabase() {
  if (!_currentUser) return;
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(syncToSupabase, 2000);
}

function applyCloudData(data) {
  if (!data) return;
  if (Array.isArray(data.recipes))  { recipes   = data.recipes;    save(K.recipes,   recipes); }
  if (data.assignments)             { mealPlan  = data.assignments; save(K.mealPlan,  mealPlan); }
  if (data.week_notes)              { weekNotes = data.week_notes;  save(K.weekNotes, weekNotes); }
  if (data.freezer)                 { freezer   = data.freezer;     save(K.freezer,   freezer); }
  if (data.groceries) {
    if (data.groceries.staples)   { staples   = data.groceries.staples;   save(K.staples,   staples); }
    if (data.groceries.flexItems) { flexItems = data.groceries.flexItems; save(K.flexItems, flexItems); }
    if (data.groceries.checks)    { checks    = data.groceries.checks;    save(K.checks,    checks); }
  }
}

function renderAll() {
  renderWeek(); renderMealSections(); renderMealPlan();
  renderGrocery(); renderFreezer(); renderLibrary(); updateWeekBadge();
}

// ── Patch save() to also schedule a cloud sync ────────────────
const _origSave = save;
window.save = function(k, v) { _origSave(k, v); scheduleSyncToSupabase(); };

// ── Session Handler ───────────────────────────────────────────
async function handleSession(session) {
  const user = session.user;

  const paid = await hasAccess(user.email);
  if (!paid) {
    showAccessGate(user);
    return;
  }

  showApp(user);
  const cloud = await loadFromSupabase(user.id);
  applyCloudData(cloud);

  // If no cloud data yet, migrate anything in localStorage
  if (!cloud) await syncToSupabase();

  renderAll();
}

// ── Bootstrap ─────────────────────────────────────────────────
async function initAuth() {
  const { data: { session } } = await _sb.auth.getSession();
  if (session) {
    await handleSession(session);
  } else {
    showAuth();
  }

  _sb.auth.onAuthStateChange(async (_event, session) => {
    if (session) await handleSession(session);
    else showAuth();
  });
}

initAuth();
