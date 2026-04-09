//   DATA
// ╚═══════════════════════════════════════╝
const K = {
  recipes:'mpos_recipes_v2', weekNotes:'mpos_notes_v2',
  mealPlan:'mpos_plan_v2', staples:'mpos_staples_v2',
  flexItems:'mpos_flex_v2', freezer:'mpos_freezer_v2',
  checks:'mpos_checks_v2', adhocItems:'mpos_adhoc_v2',
  categoryItems:'mpos_catitems_v2',
  onboarding:'mpos_onboarding_v2',
};

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAY_FULL = {monday:'Monday',tuesday:'Tuesday',wednesday:'Wednesday',thursday:'Thursday',friday:'Friday',saturday:'Saturday',sunday:'Sunday'};
const DAY_SHORT = {monday:'Mon',tuesday:'Tue',wednesday:'Wed',thursday:'Thu',friday:'Fri',saturday:'Sat',sunday:'Sun'};
const WEEKDAYS = ['monday','tuesday','wednesday','thursday','friday']; // subset used by legacy loops
const WEEKEND = ['saturday','sunday'];
const MEALS = ['breakfast','lunch','dinner'];
const MEAL_LABEL = {breakfast:'Breakfast',lunch:'Lunch',dinner:'Dinner'};
// ── What's New version (change this + modal content to trigger a new popup) ──
const CURRENT_UPDATE_VERSION = '2026-04-09-v4';

const CATS = ['Produce','Protein','Grains & Breads','Dairy / Dairy-Free','Pantry & Seasonings'];
const CAT_ICON = {'Produce':'🥬','Protein':'🍗','Grains & Breads':'🌾','Dairy / Dairy-Free':'🥛','Pantry & Seasonings':'🧂'};

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
  {id:'sr1', libraryId:'lb13', type:'goto', onMenu:false, name:'Overnight Oatmeal', servings:1,
   notes:'Add 1 cup oats and 1 cup milk to each jar. Stir well.\nAdd mixed berries.\nSeal jars.\nRefrigerate overnight. Grab and go — no reheating needed.\n(Optional) Add other ingredients like banana, protein powder, or chia seeds.',
   ingredients:[
     {name:'Oats',         qty:'1 cup', category:'Grains & Breads'},
     {name:'Milk',         qty:'1 cup', category:'Dairy / Dairy-Free'},
     {name:'Mixed Berries',qty:'½ cup', category:'Produce'},
   ]},
  {id:'sr2', libraryId:'lb15', type:'goto', onMenu:false, name:'Spaghetti', servings:1,
   notes:'Boil salted water and cook spaghetti until al dente. Drain and set aside.\nPour marinara sauce into a separate pot. Simmer for 5 minutes.\nToss with pasta.\nOptional – Top with parmesan and serve with warm bread.\nTip – Freeze leftover sauce for a future no-effort dinner. Use the "Freezer" tab to log it.',
   ingredients:[
     {name:'Spaghetti',      qty:'3 oz', category:'Grains & Breads'},
     {name:'Marinara Sauce', qty:'½ cup', category:'Pantry & Seasonings'},
     {name:'(Optional) Parmesan',     qty:'1 TBSP', category:'Dairy / Dairy-Free'},
   ]},
  {id:'sr3', libraryId:'lb21', type:'goto', onMenu:false, name:'Chicken & Bean Burrito', servings:1,
   notes:'Cook rice according to package instructions.\nSeason chicken with seasonings. Cook in a pan with oil until done, then shred or chop.\nWarm drained black beans in a small pot with a pinch of seasonings.\nWarm a tortilla in a pan or microwave. Layer rice, chicken, beans, cheese, and salsa.\nFold and wrap tightly. Heat all sides in the same pan with oil or butter – until browned.\nEat immediately or wrap in foil for later.\nTips – Increase serving size to batch cook, and freeze for your busiest weeknights.',
   ingredients:[
     {name:'Large Tortilla',  qty:'1',       category:'Grains & Breads'},
     {name:'Chicken Breast',  qty:'4 oz',    category:'Protein'},
     {name:'Black Beans',     qty:'¼ can',   category:'Protein'},
     {name:'Rice',            qty:'⅓ cup',   category:'Grains & Breads'},
     {name:'Shredded Cheese', qty:'2 TBSP',  category:'Dairy / Dairy-Free'},
     {name:'Salsa',           qty:'2 TBSP',  category:'Pantry & Seasonings'},
     {name:'Cumin',           qty:'½ tsp',   category:'Pantry & Seasonings'},
     {name:'Paprika',         qty:'½ tsp',   category:'Pantry & Seasonings'},
     {name:'Garlic Powder',   qty:'½ tsp',   category:'Pantry & Seasonings'},
     {name:'Salt & Pepper',   qty:'to taste',category:'Pantry & Seasonings'},
     {name:'Oil',             qty:'1 tsp',   category:'Pantry & Seasonings'},
   ]},
  // ── V4 onboarding demo recipes (single-serving, easy-wins energy) ──
  {id:'sr4', libraryId:'lb_sr4', type:'goto', onMenu:false, name:'PB&J Upgrade', servings:1,
   notes:'Toast bread lightly.\nSpread peanut butter on one slice.\nSpread jelly on the other.\nAdd banana slices on top of the peanut butter.\nDrizzle honey over the banana.\nClose it up, cut in half.',
   ingredients:[
     {name:'Bread',          qty:'2 slices', category:'Grains & Breads'},
     {name:'Peanut Butter',  qty:'2 TBSP',   category:'Pantry & Seasonings'},
     {name:'Jelly',          qty:'1 TBSP',   category:'Pantry & Seasonings'},
     {name:'Banana',         qty:'1',         category:'Produce'},
     {name:'Honey',          qty:'1 tsp',     category:'Pantry & Seasonings'},
   ]},
  {id:'sr5', libraryId:'lb_sr5', type:'goto', onMenu:false, name:'Quesadilla', servings:1,
   notes:'Heat a pan over medium heat.\nPlace tortilla in pan, sprinkle cheese on one half.\nFold tortilla in half, press gently.\nCook 2 minutes per side until golden and cheese is melted.\nSlice into wedges.\nServe with salsa and sour cream.',
   ingredients:[
     {name:'Large Tortilla',  qty:'1',       category:'Grains & Breads'},
     {name:'Shredded Cheese', qty:'¼ cup',   category:'Dairy / Dairy-Free'},
     {name:'Salsa',           qty:'2 TBSP',  category:'Pantry & Seasonings'},
     {name:'Sour Cream',      qty:'1 TBSP',  category:'Dairy / Dairy-Free'},
   ]},
  {id:'sr6', libraryId:'lb_sr6', type:'goto', onMenu:false, name:'Tomato Soup + Grilled Cheese', servings:1,
   notes:'Heat tomato soup in a pot over medium heat.\nButter two slices of bread on one side each.\nPlace one slice butter-side down in a pan. Add cheese, top with second slice butter-side up.\nCook 2-3 minutes per side until golden and cheese melts.\nCut sandwich in half. Serve with soup.',
   ingredients:[
     {name:'Tomato Soup',     qty:'1 can',    category:'Pantry & Seasonings'},
     {name:'Bread',           qty:'2 slices', category:'Grains & Breads'},
     {name:'Butter',          qty:'1 TBSP',   category:'Dairy / Dairy-Free'},
     {name:'Sliced Cheese',   qty:'2 slices', category:'Dairy / Dairy-Free'},
   ]},
];

// ╔═══════════════════════════════════════╗
//   V4 QUICK-START ONBOARDING
// ╚═══════════════════════════════════════╝
// Demo meal plan distribution — maps starter recipe IDs to weekday slots.
// Friday dinner = Eating Out, Wednesday lunch = Leftovers.
const _DEMO_PLAN_MAP = {
  monday:    { breakfast:'sr1', lunch:'sr4', dinner:'sr2' },
  tuesday:   { breakfast:'sr1', lunch:'sr5', dinner:'sr3' },
  wednesday: { breakfast:'sr1', lunch:'_leftovers', dinner:'sr6' },
  thursday:  { breakfast:'sr1', lunch:'sr4', dinner:'sr2' },
  friday:    { breakfast:'sr1', lunch:'sr5', dinner:'_eatingout' },
};

// Generates a fully populated demo meal plan using starter recipes.
// Only runs for brand-new users — aborts if mealPlan already has data.
function generateDemoMealPlan(draft){
  // Use the draft from the quick-start modal to know which slots are ON
  const plan = {};
  DAYS.forEach(d=>{
    plan[d] = {};
    MEALS.forEach(m=>{
      const key = d+'_'+m;
      const demoSlot = _DEMO_PLAN_MAP[d] && _DEMO_PLAN_MAP[d][m];
      if(draft && !draft.cook[key]){
        // User toggled this slot OFF — skip it entirely
        return;
      }
      if(!demoSlot){
        // Weekend slots or unmapped — only fill if user toggled ON
        if(draft && draft.cook[key]){
          // User opted in a weekend slot — assign a rotating recipe
          const rotateIds = ['sr1','sr4','sr5','sr2','sr6','sr3'];
          const idx = (DAYS.indexOf(d)*3 + MEALS.indexOf(m)) % rotateIds.length;
          plan[d][m] = { state:'cook', recipeId:rotateIds[idx], servings:1, note:'' };
        }
        return;
      }
      if(demoSlot === '_leftovers'){
        plan[d][m] = { state:'skipped', skipLabel:'Leftovers', skipDetail:'Heat up yesterday\'s extra', note:'' };
      } else if(demoSlot === '_eatingout'){
        plan[d][m] = { state:'skipped', skipLabel:'Eating Out', skipDetail:'Sushi', note:'' };
      } else {
        plan[d][m] = { state:'cook', recipeId:demoSlot, servings:1, note:'' };
      }
    });
  });
  mealPlan = plan;
  save(K.mealPlan, mealPlan);
}

// Quick-start state
let _isQuickStart = false;
let _quickStartStep = 0; // 0=not started, 1=meal grid, 2+=tooltips

function openQuickStartModal(){
  // Show welcome CTA first, then proceed to obligations
  const w = document.getElementById('qsWelcomeModal');
  if(w) w.classList.add('open');
}
function closeQsWelcome(){
  const w = document.getElementById('qsWelcomeModal');
  if(w) w.classList.remove('open');
}
function qsWelcomeGo(){
  closeQsWelcome();
  _isQuickStart = true;
  _quickStartStep = 1;
  // Pre-fill draft: Mon-Fri B/L/D ON, weekends OFF + 3 demo obligations
  _planDraft = { cook: {}, notes: {} };
  const weekdays = ['monday','tuesday','wednesday','thursday','friday'];
  weekdays.forEach(d=>MEALS.forEach(m=>{
    _planDraft.cook[d+'_'+m] = true;
  }));
  // Demo obligations — shows the user what this feature is for
  _planDraft.notes.tuesday  = 'Working late';
  _planDraft.notes.thursday = 'Early Doctor\'s Appt';
  _planDraft.notes.friday   = 'Date Night';
  // Step 1: show obligations modal (pre-filled)
  _renderPlanModal2();
  const ov = document.getElementById('planModal2');
  if(ov) ov.classList.add('open');
}

function quickStartNextToMeals(){
  // Quick-start Step 1 → Step 2: close obligations, open meal grid
  // Temporarily save and restore _isQuickStart since closePlanModal2 resets it
  const wasQS = _isQuickStart;
  closePlanModal2();
  _isQuickStart = wasQS;
  _renderPlanModal1();
  const ov = document.getElementById('planModal1');
  if(ov) ov.classList.add('open');
}

function quickStartNext(){
  // Quick-start Step 2: user tapped "Next" on the meal grid
  // Auto-fill demo plan + write obligations to weekNotes
  closePlanModal1();
  DAYS.forEach(d=>{
    const obligation = (_planDraft.notes[d]||'').trim();
    if(obligation){
      if(!weekNotes[d]) weekNotes[d] = {am:'', pm:''};
      weekNotes[d].am = obligation;
    }
  });
  save(K.weekNotes, weekNotes);
  generateDemoMealPlan(_planDraft);
  _planDraft = null;
  _isQuickStart = false;
  // Render the now-populated dashboard
  renderAll();
  // Start guided tooltip flow
  _quickStartStep = 2;
  setTimeout(()=> _showQuickStartTooltip(2), 400);
}

// ── Quick-Start Tooltip Flow (Steps 3-5 of onboarding) ────────────────
function _showQuickStartTooltip(step){
  // Remove any previous tooltip
  const prev = document.getElementById('qs-tooltip');
  if(prev) prev.remove();

  if(step === 2){
    // Step 3: Dashboard tooltip — "Your week is planned"
    switchTab('dashboard');
    setTimeout(()=>{
      const tooltip = document.createElement('div');
      tooltip.id = 'qs-tooltip';
      tooltip.className = 'qs-tooltip-overlay';
      tooltip.innerHTML = `
        <div class="qs-tooltip-card">
          <div class="qs-tooltip-title">Your week is planned.</div>
          <div class="qs-tooltip-body">Ready to go. Now let's see the best part.</div>
          <button class="btn btn-primary qs-tooltip-btn" onclick="_qsNext(3)">View Grocery List →</button>
        </div>`;
      document.getElementById('appRoot').appendChild(tooltip);
    }, 200);
  } else if(step === 3){
    // Step 4: Grocery list tooltip
    switchTab('grocerylist');
    setTimeout(()=>{
      const tooltip = document.createElement('div');
      tooltip.id = 'qs-tooltip';
      tooltip.className = 'qs-tooltip-overlay';
      tooltip.innerHTML = `
        <div class="qs-tooltip-card">
          <div class="qs-tooltip-title">Your grocery list builds itself.</div>
          <div class="qs-tooltip-body">Every ingredient from your meals, sorted by category. Change a meal, the list updates.</div>
          <button class="btn btn-primary qs-tooltip-btn" onclick="_qsNext(4)">Got It →</button>
        </div>`;
      document.getElementById('appRoot').appendChild(tooltip);
    }, 200);
  } else if(step === 4){
    // Step 5: Final screen — point at Reset Week
    switchTab('dashboard');
    setTimeout(()=>{
      const tooltip = document.createElement('div');
      tooltip.id = 'qs-tooltip';
      tooltip.className = 'qs-tooltip-overlay qs-final';
      tooltip.innerHTML = `
        <div class="qs-tooltip-card qs-final-card">
          <div class="qs-tooltip-title">Ready to make it yours?</div>
          <div class="qs-tooltip-body">This is a demo plan with sample recipes. When you're ready, tap <strong>Reset Week</strong> below to clear it and start fresh.</div>
          <div class="qs-tooltip-body" style="font-size:12px;color:var(--text-3);margin-top:4px">Tap <strong>Learn More</strong> at the top of your Home tab to understand each section.</div>
          <div class="qs-reset-arrow">↓ Reset Week is at the bottom of the page</div>
          <button class="btn btn-primary qs-tooltip-btn" onclick="_qsFinish()">Start Planning</button>
        </div>`;
      document.getElementById('appRoot').appendChild(tooltip);
      // Scroll to make footer visible
      const footer = document.querySelector('.app-footer');
      if(footer) footer.scrollIntoView({behavior:'smooth', block:'nearest'});
    }, 200);
  }
}

function _qsNext(nextStep){
  const tt = document.getElementById('qs-tooltip');
  if(tt) tt.remove();
  _showQuickStartTooltip(nextStep);
}

function _qsFinish(){
  const tt = document.getElementById('qs-tooltip');
  if(tt) tt.remove();
  _quickStartStep = 0;
  // Mark onboarding complete
  completeOnboarding();
  // Show the Learn More button after quick start
  _showLearnMoreBtn(true);
}

// ╔═══════════════════════════════════════╗
//   LEARN MORE — Sequential Banner Walkthrough
// ╚═══════════════════════════════════════╝
// Activated after quick start completes. Walks through Recipes → Menu → Freezer
// with informational banners. Persisted via onboardingState.learnMoreAvailable.
let _learnMoreActive = false; // true when banners are showing
let _learnMoreStep = 0;       // 1=Recipes, 2=Menu, 3=Freezer

function _showLearnMoreBtn(show){
  const btn = document.getElementById('learnMoreBtn');
  if(btn) btn.style.display = show ? '' : 'none';
  // Persist availability across sessions
  onboardingState.learnMoreAvailable = !!show;
  _persistOnboardingState();
}

function startLearnMore(){
  _learnMoreActive = true;
  _learnMoreStep = 1;
  _showLearnMoreBtn(false); // hide the button once they tap it
  switchTab('recipes');
  _renderLearnMoreBanner();
}

function _renderLearnMoreBanner(){
  // Clear all banner containers first
  ['onboardingBanner-1','onboardingBanner-2','onboardingBanner-6','onboardingBanner-dash','onboardingBanner-5'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.innerHTML = '';
  });
  if(!_learnMoreActive) return;

  function lmBanner(step, title, desc, nextBtn){
    return `<div class="lm-banner">
      <div class="lm-banner-row">
        <div class="lm-banner-left">
          <div class="lm-banner-step">Step ${step} of 3</div>
          <div class="lm-banner-title">${title}</div>
          <div class="lm-banner-desc">${desc}</div>
        </div>
        <div class="lm-banner-right">${nextBtn}</div>
      </div>
    </div>`;
  }

  if(_learnMoreStep === 1){
    const el = document.getElementById('onboardingBanner-1');
    if(el) el.innerHTML = lmBanner(1, 'Your Recipe Library',
      'This is where all your meals live. Paste a URL from any recipe blog, or build your own from scratch. Once a recipe is saved, you can add it to your No-Decision Menu with one click.',
      `<button class="btn btn-primary btn-next" onclick="_learnMoreNext(2)">Next →</button>`);
  } else if(_learnMoreStep === 2){
    const el = document.getElementById('onboardingBanner-2');
    if(el) el.innerHTML = lmBanner(2, 'Your No-Decision Menu',
      'Think of this as your rotation — the meals you actually make on repeat. When you plan your week, you pick from this list. Fewer choices, less thinking.',
      `<button class="btn btn-primary btn-next" onclick="_learnMoreNext(3)">Next →</button>`);
  } else if(_learnMoreStep === 3){
    const el = document.getElementById('onboardingBanner-6');
    if(el) el.innerHTML = lmBanner(3, 'Your Freezer',
      'Log frozen meals here so you never forget what\'s buried in the back. When planning your week, freezer meals show up as options — zero effort dinners on your busiest nights.',
      `<button class="btn btn-primary btn-next" onclick="_learnMoreDone()">Done →</button>`);
  }
}

function _learnMoreNext(step){
  _learnMoreStep = step;
  const tabMap = {1:'recipes', 2:'menu', 3:'freezer'};
  switchTab(tabMap[step] || 'dashboard');
  _renderLearnMoreBanner();
}

function _learnMoreDone(){
  _learnMoreActive = false;
  _learnMoreStep = 0;
  // Persist V4.5 completion
  onboardingState.learnMoreComplete = true;
  _persistOnboardingState();
  // Clear banners
  _renderLearnMoreBanner();
  switchTab('dashboard');
}

// ── RECIPE LIBRARY ─────────────────────────────────────────────────────────
// Curated by Meal Planning OS. These are read-only — users copy them into
// their own No-Decision Menu. libraryId is preserved on the copy so we can detect
// "already added" without a name match.
const LIBRARY_RECIPES = [

  // ── GO-TO MEALS ────────────────────────────────────────────────────────
  {id:'lb13', type:'goto', name:'Overnight Oatmeal', servings:1,
   tags:['Breakfast','Under 15 Min','Under 30 Min','Batch Cook'],
   notes:'Make 5 jars in under 10 minutes.',
   ingredients:[
     {name:'Oats',         qty:'1 cup', category:'Grains & Breads'},
     {name:'Milk',         qty:'1 cup', category:'Dairy / Dairy-Free'},
     {name:'Mixed Berries',qty:'½ cup', category:'Produce'},
   ],
   steps:'Add 1 cup oats and 1 cup milk to each jar. Stir well.\nAdd mixed berries.\nSeal jars.\nRefrigerate overnight. Grab and go — no reheating needed.\n(Optional) Add other ingredients like banana, protein powder, or chia seeds.'},

  {id:'lb14', type:'goto', name:'Tacos', servings:4,
   tags:['Dinner','Under 15 Min','Under 30 Min'],
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
   tags:['Dinner','Under 15 Min','Under 30 Min'],
   notes:'The ultimate reliable weeknight meal.',
   ingredients:[
     {name:'Spaghetti',               qty:'12 oz', category:'Grains & Breads'},
     {name:'Marinara Sauce',          qty:'1 jar',  category:'Pantry & Seasonings'},
     {name:'(Optional) Parmesan',     qty:'¼ cup',  category:'Dairy / Dairy-Free'},
     {name:'(Optional) Italian Bread',qty:'1 Loaf', category:'Grains & Breads'},
   ],
   steps:'Boil salted water and cook spaghetti until al dente. Drain and set aside.\nPour marinara sauce into a separate pot. Simmer for 5 minutes.\nToss with pasta.\nOptional – Top with parmesan and serve with warm bread.\nTip – Freeze leftover sauce for a future no-effort dinner. Use the "Freezer" tab to log it.'},

  {id:'lb16', type:'goto', name:'Green Detox Smoothie', servings:1,
   tags:['Breakfast','Under 15 Min','Under 30 Min'],
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
   tags:['Lunch','Dinner','Batch Cook','Freezer Friendly'],
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
   tags:['Dinner','One Pan','Batch Cook','Freezer Friendly'],
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
   tags:['Breakfast','Lunch','Batch Cook','One Pan'],
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
   tags:['Breakfast','Under 15 Min','Under 30 Min','Freezer Friendly','Batch Cook'],
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
   tags:['Lunch','Dinner','Batch Cook','Under 30 Min','Freezer Friendly'],
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
   tags:['Dinner','Under 30 Min','One Pan'],
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
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));localStorage.setItem('mpos_local_dirty_at',new Date().toISOString());}catch{} scheduleSyncToSupabase();}
function uid(){return Math.random().toString(36).substr(2,9);}

let recipes    = load(K.recipes, null);
let weekNotes  = load(K.weekNotes, {});
let mealPlan   = load(K.mealPlan, {});
let staples    = load(K.staples, DEFAULT_STAPLES);
let flexItems  = load(K.flexItems, DEFAULT_FLEX);
let freezer    = load(K.freezer, []);
let checks     = load(K.checks, {});
let adhocItems = load(K.adhocItems, []);
let categoryItems = load(K.categoryItems, []);

// First visit — seed with 3 starter meals so the app feels alive immediately
if (recipes === null) { recipes = STARTER_RECIPES.map(r=>({...r,ingredients:r.ingredients.map(i=>({...i}))})); save(K.recipes, recipes); }

// ╔═══════════════════════════════════════╗
//   SLOT SCHEMA MIGRATION (non-destructive)
// ╚═══════════════════════════════════════╝
// Slot shape going forward:
//   mealPlan[day][meal] = { state:'cook'|'skipped', recipeId, name, servings, mealType, note, ... }
// Absence of an entry  = unplanned (rendered as "—" / treated like skipped-no-note).
// Old data had entries without a `state` field but always with a recipeId — those are
// all implicitly `state:'cook'`. Weekend days didn't exist in the old schema and default
// to no entries, which is exactly the behavior we want.
// We also carry any legacy day-level AM/PM week notes into per-slot notes so nothing is lost.
function migrateSlotSchema(){
  try {
    let touched = false;
    // Helper: strip poisoned string values ("undefined", "null", "NaN") that may
    // have been stored by earlier template-literal bugs. Returns clean string or ''.
    const _cleanStr = (v) => {
      if(v == null) return '';
      const s = String(v).trim();
      if(!s) return '';
      const lower = s.toLowerCase();
      if(lower === 'undefined' || lower === 'null' || lower === 'nan') return '';
      return s;
    };
    DAYS.forEach(d=>{
      if(mealPlan[d] && typeof mealPlan[d] === 'object'){
        MEALS.forEach(m=>{
          let a = mealPlan[d][m];
          // Drop non-object legacy entries (strings, null, undefined) entirely
          if(a != null && typeof a !== 'object'){
            delete mealPlan[d][m];
            touched = true;
            return;
          }
          if(!a || typeof a !== 'object') return;
          // Sanitize poisoned string fields
          const cleanName = _cleanStr(a.name);
          if(a.name !== cleanName){ a.name = cleanName; touched = true; }
          const cleanNote = _cleanStr(a.note);
          if(a.note !== cleanNote){ a.note = cleanNote; touched = true; }
          // Legacy-shape detection: stamp state
          if(!a.state){
            a.state = 'cook';
            if(typeof a.note !== 'string') a.note = '';
            touched = true;
          }
          // Carry forward legacy meal-type "not cooking" entries into skipped with label
          //   - leftovers → {state:'skipped', note:'Leftovers'}
          //   - eatingout/out/lunchout/takeout → {state:'skipped', note:'Eating out'}
          // But only if there's no recipeId (otherwise it was a cooked recipe tagged leftovers, keep it)
          if(a.state === 'cook' && !a.recipeId && !a.freezerId && a.mealType){
            const mt = String(a.mealType).toLowerCase();
            if(mt === 'leftovers'){
              mealPlan[d][m] = {state:'skipped', recipeId:null, note: a.name && a.name !== 'Leftovers' ? a.name : 'Leftovers'};
              touched = true;
              return;
            }
            if(['eatingout','out','lunchout','takeout'].includes(mt)){
              mealPlan[d][m] = {state:'skipped', recipeId:null, note: a.name && a.name !== 'Eating out' ? a.name : 'Eating out'};
              touched = true;
              return;
            }
            if(mt === 'freezer'){
              // Legacy freezer entry without freezerId — leave as skipped with the name
              mealPlan[d][m] = {state:'skipped', recipeId:null, note: a.name || 'Freezer meal'};
              touched = true;
              return;
            }
          }
          // Catch-all: cook state, no recipeId, no freezerId, has a name → preserve as skipped-with-note
          if(a.state === 'cook' && !a.recipeId && !a.freezerId && a.name){
            mealPlan[d][m] = {state:'skipped', recipeId:null, note: a.name};
            touched = true;
            return;
          }
          // Catch-all: cook state with no recipeId, no freezerId, no name — clear it (would render "Pick one" forever)
          if(a.state === 'cook' && !a.recipeId && !a.freezerId && !a.name){
            delete mealPlan[d][m];
            touched = true;
            return;
          }
        });
      }
    });
    // Legacy AM/PM-to-slot migration removed — obligations now live in weekNotes
    // and render on the dashboard day card, not inside individual meal slots.
    if(touched){
      // Persist the stamped shape but DO NOT touch the legacy weekNotes key (safety net).
      try { localStorage.setItem(K.mealPlan, JSON.stringify(mealPlan)); } catch {}
    }
  } catch(e) { /* migration is best-effort; never block app boot */ }
}
migrateSlotSchema();

// ── Slot helpers ───────────────────────────────────────────────────────────
function getSlot(day,meal){ return (mealPlan[day]&&mealPlan[day][meal])||null; }
function isSlotCook(day,meal){ const s=getSlot(day,meal); return !!(s && s.state==='cook'); }
function isSlotSkipped(day,meal){ const s=getSlot(day,meal); return !s || s.state==='skipped'; }
function setSlotCook(day,meal){
  if(!mealPlan[day]) mealPlan[day]={};
  const existing = mealPlan[day][meal] || {};
  // Event/schedule notes live in `note` and are preserved across state transitions.
  // Legacy data may have a skip reason (Leftovers/Eating out) stored in `note` —
  // detect and drop those so they don't leak into cook assignments.
  let carryNote = existing.note || '';
  if(/^(leftovers?|eating out)$/i.test(carryNote.trim())) carryNote = '';
  mealPlan[day][meal] = Object.assign({}, existing, {state:'cook', note:carryNote});
  // skipLabel / skipDetail belong to skipped state only — drop on cook transition.
  delete mealPlan[day][meal].skipLabel;
  delete mealPlan[day][meal].skipDetail;
  if(!('recipeId' in mealPlan[day][meal])) mealPlan[day][meal].recipeId = null;
}
function setSlotSkipped(day,meal,note){
  if(!mealPlan[day]) mealPlan[day]={};
  mealPlan[day][meal] = {state:'skipped', recipeId:null, note:(note||'').trim()};
}
function clearSlot(day,meal){
  if(mealPlan[day]) delete mealPlan[day][meal];
}
function setSlotNote(day,meal,note){
  if(!mealPlan[day]) mealPlan[day]={};
  if(!mealPlan[day][meal]) mealPlan[day][meal]={state:'skipped', recipeId:null, note:''};
  mealPlan[day][meal].note = String(note||'');
}

// ╔═══════════════════════════════════════╗
//   PLAN-THIS-WEEK — 2-modal flow
// ╚═══════════════════════════════════════╝
// Draft state lives outside mealPlan until the user hits "Done" so Cancel is clean.
let _planDraft = null; // { cook: { 'monday_dinner': true, ... }, notes: { 'monday_dinner': 'text' } }

function openPlanWeekModal1(){
  // Entry point for "Plan This Week" — opens obligations (Step 1) first.
  // Seed the draft from current mealPlan + weekNotes.
  _planDraft = { cook: {}, notes: {} };
  DAYS.forEach(d=>{
    // Seed cook toggles from existing meal plan
    MEALS.forEach(m=>{
      const s = getSlot(d,m);
      if(s && s.state==='cook') _planDraft.cook[d+'_'+m] = true;
    });
    // Seed per-day obligation from weekNotes (am field)
    const wn = weekNotes[d];
    if(wn && wn.am) _planDraft.notes[d] = String(wn.am);
  });
  _renderPlanModal2();
  const ov = document.getElementById('planModal2');
  if(ov) ov.classList.add('open');
}

function _renderPlanModal1(){
  const body = document.getElementById('planModal1Body');
  if(!body) return;

  // Update modal header for quick-start vs normal mode
  const titleEl = document.getElementById('planModal1Title');
  const stepEl  = document.getElementById('planModal1Step');
  const backBtn = document.getElementById('planModal1Back');
  const closeBtn = document.getElementById('planModal1Close');
  const nextBtn = document.getElementById('planModal1Next');
  if(_isQuickStart){
    if(titleEl) titleEl.textContent = 'Plan your week in 60 seconds';
    if(stepEl)  stepEl.textContent = 'Step 2 of 2';
    if(backBtn)   backBtn.style.display = 'none';
    if(closeBtn)  closeBtn.style.display = 'none';
    if(nextBtn) nextBtn.setAttribute('onclick','quickStartNext()');
    if(nextBtn) nextBtn.textContent = 'Next →';
  } else {
    if(titleEl) titleEl.textContent = 'Plan This Week';
    if(stepEl)  stepEl.textContent = 'Step 2 of 2';
    if(backBtn)   backBtn.style.display = '';
    if(closeBtn)  closeBtn.style.display = '';
    if(nextBtn) nextBtn.setAttribute('onclick','planModal1Done()');
    if(nextBtn) nextBtn.textContent = 'Done — View My Week →';
  }

  const countEl_id = 'planModal1Count';
  let html = '';
  if(_isQuickStart){
    html += '<div class="plan-modal-intro">Tap any meal you need to plan.<br><span style="color:var(--text-3);font-size:12px">Skip meals you don\'t need to worry about — like work lunches or dining out.</span></div>';
  } else {
    html += '<div class="plan-modal-intro">Tap the meals you\'re cooking.<br><span style="color:var(--text-3);font-size:12px">Leave the rest — we\'ll handle those.</span></div>';
  }
  // Column header pills
  html += '<div class="plan-grid-wrap"><div class="plan-grid">';
  html += '<div class="plan-grid-corner"></div>';
  MEALS.forEach(m=>{
    html += `<div class="plan-col-head" data-meal="${m}" id="planColHead-${m}">${MEAL_LABEL[m]}</div>`;
  });
  DAYS.forEach(d=>{
    const weekend = (d==='saturday'||d==='sunday');
    html += `<div class="plan-row-head${weekend?' weekend':''}">${DAY_SHORT[d]}</div>`;
    MEALS.forEach(m=>{
      const key = d+'_'+m;
      const on = !!_planDraft.cook[key];
      html += `<button type="button" class="plan-cell${on?' on':''}${weekend?' weekend':''}" data-key="${key}" onclick="_togglePlanCell('${d}','${m}')" aria-pressed="${on}"><span class="plan-cell-check">${on?'✓':''}</span></button>`;
    });
  });
  html += '</div></div>';
  html += `<div class="plan-counter" id="${countEl_id}"></div>`;
  // Hide quick-select buttons during quick start — keep it dead simple
  if(!_isQuickStart){
    html += '<div class="plan-quick-row">';
    html += '<button type="button" class="btn btn-secondary btn-sm" onclick="_planQuickAllDinners()">All weekday dinners</button>';
    html += '<button type="button" class="btn btn-secondary btn-sm" onclick="_planQuickClear()">Clear all</button>';
    html += '</div>';
  }
  body.innerHTML = html;
  _updatePlanCounter();
  _updatePlanColumnHeads();
}

function _updatePlanCounter(){
  const el = document.getElementById('planModal1Count');
  if(!el) return;
  const n = Object.keys(_planDraft.cook).filter(k=>_planDraft.cook[k]).length;
  let msg = 'Tap the meals you\'re cooking';
  if(n===1||n===2) msg = 'Nice start';
  else if(n>=3 && n<=5) msg = 'Looking good';
  else if(n>=6 && n<=10) msg = 'Dialed in';
  else if(n>=11 && n<=14) msg = 'System running';
  else if(n>=15) msg = 'Operator mode';
  el.textContent = `${n} meal${n===1?'':'s'} planned · ${msg}`;
}

function _updatePlanColumnHeads(){
  MEALS.forEach(m=>{
    const head = document.getElementById('planColHead-'+m);
    if(!head) return;
    const anyOn = DAYS.some(d=>_planDraft.cook[d+'_'+m]);
    head.classList.toggle('active', anyOn);
  });
}

function _togglePlanCell(day,meal){
  const key = day+'_'+meal;
  if(_planDraft.cook[key]) delete _planDraft.cook[key];
  else _planDraft.cook[key] = true;
  // Targeted re-render of the cell + counter + col head for perf/feel
  const btn = document.querySelector(`.plan-cell[data-key="${key}"]`);
  if(btn){
    const on = !!_planDraft.cook[key];
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-pressed', on?'true':'false');
    const chk = btn.querySelector('.plan-cell-check');
    if(chk) chk.textContent = on?'✓':'';
  }
  _updatePlanCounter();
  _updatePlanColumnHeads();
}

function _planQuickAllDinners(){
  WEEKDAYS.forEach(d=>{ _planDraft.cook[d+'_dinner'] = true; });
  _renderPlanModal1();
}
function _planQuickClear(){
  _planDraft.cook = {};
  _renderPlanModal1();
}

function closePlanModal1(){
  const ov = document.getElementById('planModal1');
  if(ov) ov.classList.remove('open');
  // If user closes during quick-start (via X button), reset the flag
  // so normal Plan This Week works correctly going forward.
  if(_isQuickStart){
    _isQuickStart = false;
    _quickStartStep = 0;
  }
}

// ── Swapped flow: planModal2 (obligations) = Step 1, planModal1 (meals) = Step 2 ──

function planModal2Next(){
  // Step 1 → Step 2: close obligations, open meal grid
  closePlanModal2();
  _openMealGridModal();
}

function _openMealGridModal(){
  _renderPlanModal1();
  const ov = document.getElementById('planModal1');
  if(ov) ov.classList.add('open');
}

function planModal1Back(){
  // Step 2 → Step 1: go back to obligations
  closePlanModal1();
  _renderPlanModal2();
  const ov = document.getElementById('planModal2');
  if(ov) ov.classList.add('open');
}

function planModal1Done(){
  // Final save — applies both obligations and meal selections
  _savePlanDraft();
  closePlanModal1();
  _planDraft = null;
  renderDashboard();
  renderOnboardingUI();
}

// Legacy alias — kept so old references don't break
function planModal1Next(){ planModal2Next(); }
function openPlanWeekModal2(){ _openMealGridModal(); }

// Per-day rotating placeholder prompts for obligations
const _OBLIGATION_PROMPTS = [
  'e.g. early meeting',
  'e.g. working late',
  'e.g. kids\' practice at 6',
  'e.g. dinner out',
  'e.g. gym at 5:30',
  'e.g. travel day',
  'e.g. family plans',
];

function _renderPlanModal2(){
  const body = document.getElementById('planModal2Body');
  if(!body) return;

  // Update header for quick-start vs normal mode
  const titleEl = document.getElementById('planModal2Title');
  const stepEl  = document.getElementById('planModal2Step');
  const cancelBtn = document.getElementById('planModal2Cancel');
  const closeBtn  = document.getElementById('planModal2Close');
  const nextBtn   = document.getElementById('planModal2Next');
  if(_isQuickStart){
    if(titleEl) titleEl.textContent = 'Plan your week in 60 seconds';
    if(stepEl)  stepEl.textContent = 'Step 1 of 2';
    if(cancelBtn) cancelBtn.style.display = 'none';
    if(closeBtn)  closeBtn.style.display = 'none';
    if(nextBtn) nextBtn.setAttribute('onclick','quickStartNextToMeals()');
  } else {
    if(titleEl) titleEl.textContent = 'Plan This Week';
    if(stepEl)  stepEl.textContent = 'Step 1 of 2';
    if(cancelBtn) cancelBtn.style.display = '';
    if(closeBtn)  closeBtn.style.display = '';
    if(nextBtn) nextBtn.setAttribute('onclick','planModal2Next()');
  }

  let html = '';
  html += '<div class="plan-modal-intro">Any obligations this week? <span style="color:var(--text-3);font-size:12px">(all optional — helps you plan smarter)</span></div>';

  html += '<div class="plan-days-list">';
  DAYS.forEach((d, i)=>{
    const weekend = (d==='saturday'||d==='sunday');
    const noteVal = _planDraft.notes[d] || '';
    const ph = _OBLIGATION_PROMPTS[i % _OBLIGATION_PROMPTS.length];
    html += `<div class="plan-day-group${weekend?' weekend':''}">`;
    html += `<div class="plan-note-row" style="align-items:center">`;
    html += `<div class="plan-day-head" style="min-width:90px;margin:0">${DAY_FULL[d]}</div>`;
    const exClass = (_isQuickStart && noteVal) ? ' qs-example' : '';
    html += `<input type="text" class="plan-note-input${exClass}" data-day="${d}" value="${_esc(noteVal)}" placeholder="${_esc(ph)}" oninput="this.classList.remove('qs-example');_planDraft.notes['${d}']=this.value">`;
    html += `</div></div>`;
  });
  html += '</div>';
  body.innerHTML = html;
}

function _esc(s){
  let v = s == null ? '' : String(s);
  // Strip poisoned string literals from any legacy data
  const lower = v.trim().toLowerCase();
  if(lower === 'undefined' || lower === 'null' || lower === 'nan') v = '';
  return v.replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function closePlanModal2(){
  const ov = document.getElementById('planModal2');
  if(ov) ov.classList.remove('open');
  // If user closes during quick-start (via X button), reset the flag
  if(_isQuickStart){
    _isQuickStart = false;
    _quickStartStep = 0;
  }
}

function planModal2Back(){
  // Step 1 has no "back" — this is a legacy stub.
  closePlanModal2();
}

function planModal2Save(){
  // Legacy alias — final save now lives in planModal1Done() / _savePlanDraft()
  _savePlanDraft();
  closePlanModal2();
  closePlanModal1();
  _planDraft = null;
  renderDashboard();
  renderOnboardingUI();
}

function _savePlanDraft(){
  if(!_planDraft) return;
  // 1. Write per-day obligations into weekNotes
  DAYS.forEach(d=>{
    const obligation = (_planDraft.notes[d]||'').trim();
    if(!weekNotes[d]) weekNotes[d] = {am:'', pm:''};
    weekNotes[d].am = obligation;
  });
  save(K.weekNotes, weekNotes);

  // 2. Apply cook/skip toggles into mealPlan (no per-slot notes from modal anymore)
  DAYS.forEach(d=>MEALS.forEach(m=>{
    const key = d+'_'+m;
    const wantsCook = !!_planDraft.cook[key];
    const existing = getSlot(d,m);
    if(wantsCook){
      // Preserve existing recipe if already assigned.
      setSlotCook(d,m);
      // Preserve any existing note on the slot
      if(existing && existing.note && mealPlan[d] && mealPlan[d][m]){
        mealPlan[d][m].note = existing.note;
      }
    } else {
      // Skipped
      const prevSkipLabel = existing && existing.skipLabel ? existing.skipLabel : '';
      const prevSkipDetail = existing && existing.skipDetail ? existing.skipDetail : '';
      const prevNote = existing && existing.note ? existing.note : '';
      if(prevSkipLabel || prevNote || (existing && existing.state==='skipped')){
        setSlotSkipped(d,m, prevNote);
        // Preserve any existing skipLabel + skipDetail across plan-modal saves.
        if(prevSkipLabel && mealPlan[d] && mealPlan[d][m]){
          mealPlan[d][m].skipLabel = prevSkipLabel;
          if(prevSkipDetail) mealPlan[d][m].skipDetail = prevSkipDetail;
        }
      } else {
        // No note, no prior skipped state → clear the slot entirely
        clearSlot(d,m);
      }
    }
  }));
  save(K.mealPlan, mealPlan);
}

// ╔═══════════════════════════════════════╗
//   ONBOARDING STATE
// ╚═══════════════════════════════════════╝
// version: bumped when we materially change the guide. Users at an older
// version are walked through the new guide exactly once.
const ONBOARDING_VERSION = 4;
// Loaded from localStorage on boot; falls back to defaults for first-time users.
// Also gets overwritten by cloud sync (applyCloudData) when Supabase has a more recent copy.
let onboardingState = load(K.onboarding, { firstRunComplete: false, guideSeen: false, version: ONBOARDING_VERSION });
_migrateOnboardingState();

function isOnboardingComplete() { return onboardingState.firstRunComplete; }
function hasSeenGuide() { return onboardingState.guideSeen === true; }
function _persistOnboardingState(){
  // Single source of truth for onboarding persistence: local first, then cloud via save().
  save(K.onboarding, onboardingState);
}

// Normalizes state after loading from storage or cloud sync. If the user
// hasn't seen the current guide version, reset the completion flags so the
// new walkthrough shows up exactly once.
// V4 GUARD: Existing users with real data (more than starter recipes) skip
// the quick-start and get auto-completed so the modal doesn't interrupt them.
function _migrateOnboardingState(){
  if(!onboardingState || typeof onboardingState !== 'object'){
    onboardingState = { firstRunComplete:false, guideSeen:false, version:ONBOARDING_VERSION };
    return;
  }
  const ver = onboardingState.version || 1;
  if(ver < ONBOARDING_VERSION){
    // V4: If user has more than just starter recipes, they're an existing user
    // — auto-complete onboarding so the quick-start modal doesn't fire.
    const starterIds = new Set(['sr1','sr2','sr3','sr4','sr5','sr6']);
    const hasRealRecipes = recipes.some(r => !starterIds.has(r.id));
    if(hasRealRecipes || (recipes.length > 6)){
      onboardingState.firstRunComplete = true;
      onboardingState.guideSeen = true;
    } else {
      onboardingState.firstRunComplete = false;
      onboardingState.guideSeen = false;
    }
    onboardingState.version = ONBOARDING_VERSION;
  }
}

function detectOnboardingCompletion() {
  // Retired in v2 — completion is now only driven by the "I'm Done" button
  // on Step 4. Left as a no-op to preserve any call sites.
}

// ── Soft Gating ─────────────────────────────────────────────────────────
function checkOnboardingGate(targetTab){
  // Soft gates are now non-blocking — the tab always renders, but we show
  // a helpful nudge if prerequisites aren't met yet.
  const hasRecipes = recipes.length > 0;
  const hasMenuRecipes = recipes.some(r=>r.onMenu);
  const mealCount = DAYS.reduce((n,d)=>n+MEALS.reduce((m2,meal)=>(mealPlan[d]&&mealPlan[d][meal]?1:0)+m2,0),0);

  let msg='', btn='', redirect='';

  if(targetTab==='menu' && !hasRecipes){
    msg='Add recipes first so you have meals to choose from.';
    btn='Go to Recipes'; redirect='recipes';
  } else if(targetTab==='grocerylist' && mealCount<1){
    msg='Plan at least one meal on your Home tab to generate your grocery list.';
    btn='Go Home'; redirect='dashboard';
  }

  const gateEl=document.getElementById('softGate-'+targetTab);
  if(gateEl) gateEl.innerHTML=msg?`<div class="soft-gate">
    <div class="soft-gate-msg">${msg}</div>
    <button class="btn btn-primary btn-sm" onclick="switchTab('${redirect}')">${btn}</button>
  </div>`:'';

  return false; // never block — always let the tab render
}

// ── Onboarding Banners & CTAs ────────────────────────────────────────────
// V4: Old banner system removed. Quick-start modal + tooltips handle onboarding.
// renderOnboardingUI() is kept as a function because renderAll() calls it —
// it now just clears any stale banner HTML and manages the Settings guide toggle.
let _guideMode = false;

function renderOnboardingUI(){
  // Clear all legacy gates
  ['recipes','menu','grocerylist','dashboard'].forEach(id=>{
    const gate=document.getElementById('softGate-'+id);
    if(gate) gate.innerHTML='';
  });
  // Clear legacy banner containers — but only if Learn More banners aren't active
  if(!_learnMoreActive){
    const ALL_BANNER_IDS = ['onboardingBanner-1','onboardingBanner-2','onboardingBanner-3','onboardingBanner-4','onboardingBanner-5','onboardingBanner-6','onboardingBanner-dash'];
    ALL_BANNER_IDS.forEach(id=>{ const el=document.getElementById(id); if(el) el.innerHTML=''; });
  }
  const ALL_CTA_IDS = ['recipesCTA','menuCTA','weekSetupCTA','mealPlanCTA','groceryCTA'];
  ALL_CTA_IDS.forEach(id=>{ const el=document.getElementById(id); if(el) el.innerHTML=''; });

  // V4: Guide row is now "Replay Quick Start" — always visible
  const guideRow=document.getElementById('settingsGuideRow');
  if(guideRow) guideRow.style.display='';

  // V4: Restore Learn More button if it was available (persisted across sessions)
  if(onboardingState.learnMoreAvailable && !_learnMoreActive){
    const btn = document.getElementById('learnMoreBtn');
    if(btn) btn.style.display = '';
  }
}

function completeOnboarding(){
  onboardingState.firstRunComplete=true;
  onboardingState.guideSeen=true;
  onboardingState.version=ONBOARDING_VERSION;
  _guideMode=false;
  _persistOnboardingState(); // local + cloud
  renderOnboardingUI();
  // Dashboard is the home tab once setup is done
  switchTab('dashboard');
}

function toggleSetupGuide(){
  // Legacy — kept as a no-op in case any old call sites remain.
}

function replayQuickStart(){
  if(!confirm('This will clear your current meal plan and grocery list to show the demo again. Your recipes and menu stay. Continue?')) return;
  // Reset week first so the demo plan can be generated fresh
  weekNotes={};
  mealPlan={};
  checks={};
  adhocItems=[];
  save(K.weekNotes,weekNotes);
  save(K.mealPlan,mealPlan);
  save(K.checks,checks);
  save(K.adhocItems,adhocItems);
  // Ensure starter recipes exist (they may have been deleted by a full reset)
  const starterIds = new Set(STARTER_RECIPES.map(r=>r.id));
  const missing = STARTER_RECIPES.filter(sr => !recipes.some(r=>r.id===sr.id));
  if(missing.length){
    missing.forEach(sr => recipes.push({...sr, ingredients:sr.ingredients.map(i=>({...i}))}));
    save(K.recipes, recipes);
  }
  renderAll();
  switchTab('dashboard');
  openQuickStartModal();
}

// ── Reset Logic ─────────────────────────────────────────────────────────
function startFreshWeek(){
  if(!confirm('Start a fresh week? This will clear your Schedule, Meal Plan, and Grocery List. Your recipes and No-Decision Menu will stay.')) return;
  weekNotes={};
  mealPlan={};
  checks={};
  adhocItems=[];
  // Reset starter/demo recipes off the No-Decision Menu
  const starterIds = new Set(STARTER_RECIPES.map(r=>r.id));
  recipes.forEach(r=>{ if(starterIds.has(r.id)) r.onMenu = false; });
  save(K.recipes, recipes);
  save(K.weekNotes,weekNotes);
  save(K.mealPlan,mealPlan);
  save(K.checks,checks);
  save(K.adhocItems,adhocItems);
  renderAll();
  switchTab('dashboard');
}

function resetEverything(){
  if(!confirm('Reset everything? This will clear ALL your data — recipes, menu, meal plan, grocery list, and onboarding progress. This cannot be undone.')) return;
  recipes=[];
  weekNotes={};
  mealPlan={};
  checks={};
  adhocItems=[];
  staples=DEFAULT_STAPLES.map(s=>({...s}));
  flexItems=DEFAULT_FLEX.map(f=>({...f}));
  freezer=[];
  categoryItems=[];
  onboardingState={firstRunComplete:false,guideSeen:false,version:ONBOARDING_VERSION};
  // Re-seed starters
  recipes=STARTER_RECIPES.map(r=>({...r,ingredients:r.ingredients.map(i=>({...i}))}));
  save(K.recipes,recipes); save(K.weekNotes,weekNotes); save(K.mealPlan,mealPlan);
  save(K.checks,checks); save(K.adhocItems,adhocItems); save(K.staples,staples);
  save(K.flexItems,flexItems); save(K.freezer,freezer); save(K.categoryItems,categoryItems);
  save(K.onboarding,onboardingState);
  renderAll();
  switchTab('recipes');
}

// Context tracker for add-from-library (Recipes tab vs Menu tab)
let _addContext = 'recipes'; // 'recipes' = Recipes tab (type:null), 'menu' = Menu tab

// ╔═══════════════════════════════════════╗
//   SHARED PAYLOAD BUILDER
// ╚═══════════════════════════════════════╝
function buildSyncPayload() {
  return {
    user_id:     _currentUser ? _currentUser.id : null,
    recipes:     recipes,
    assignments: mealPlan,
    week_notes:  weekNotes,
    week_start:  localStorage.getItem('mpos_weekstart') || '',
    freezer:     freezer,
    groceries:   { staples, flexItems, checks, adhocItems, categoryItems },
    onboarding:  onboardingState,
    updated_at:  new Date().toISOString()
  };
}

// ╔═══════════════════════════════════════╗
//   INFO TOOLTIPS
// ╚═══════════════════════════════════════╝
const INFO_TIPS = {
  dashboard:   'Your week at a glance. Tap \u0027Plan This Week\u0027 to fill in your meals in about 30 seconds. Tap any recipe name to open cooking instructions.',
  recipes:     'Once a recipe is saved, you can add it to your No-Decision Menu with one click. Your Go-To meals should be recipes you can make half asleep. Experimental meals require more time in the kitchen.',
  menu:        'This is the short list your entire meal plan is built from. Pick 3–5 Go-To meals you can repeat on autopilot and a few Experimental ones when you want variety. The smaller this menu is, the fewer decisions you make every week.',
  weeksetup:   'Add what\u0027s happening each day — busy nights, kids\u0027 activities, dinners out, late meetings. This shows up right in your meal plan so you can see your schedule while you\u0027re deciding what to eat. The more detail you add, the easier it is to assign the right meal to the right night.',
  mealplan:    'Tap any day to pick a meal from your No-Decision Menu. Busy night? Pick a 15-minute Go-To. Free evening? Try something Experimental. The goal is zero decisions at 5 PM — just open the plan and cook.',
  grocerylist: 'Auto-generated from your meal plan — every ingredient, already calculated and sorted by store section. Duplicates are merged and fractions are combined. You can also add your own items for anything outside your recipes — staples, snacks, whatever you need.',
  freezer:     'Your freezer is your secret weapon for busy nights. When you cook extra, log it here and we\u0027ll track it for you. Oldest meals surface first so you always use what needs to go — pull one out instead of cooking from scratch.',
  goto:        'Go-To Meals are your reliable rotation — recipes you could cook on autopilot, even on your most exhausted night. Pick 3–5 meals that are fast, forgiving, and family-approved. These are the backbone of your weekly plan.',
  experimental:'Experimental Meals add variety without chaos. These are recipes you want to try or rotate in occasionally — maybe a new cuisine, a more involved cook, or something seasonal. Keep 1–3 here so you have options without decision overload.',
  groc_staples:'Your recurring essentials — add these to your cart every week. Think pantry basics, breakfast items, and anything you always want on hand.',
  groc_flex:   'Your rescue plan for busy nights. Cheaper and better than last-minute delivery — keep a couple of frozen pizzas, rotisserie chicken, or sandwich fixings ready.',
  groc_adhoc:  'Anything else you need — cleaning supplies, toiletries, or whatever didn\u0027t make the list. A catch-all so nothing gets forgotten at the store.',
};
function infoTipHtml(key){
  const tip=INFO_TIPS[key];
  if(!tip) return '';
  return `<span class="info-tip-wrap"><button class="info-tip-btn" onclick="toggleInfoTip(event,'${key}')" aria-label="More info">\u24d8</button><div class="info-tip-bubble" id="tip-${key}">${tip}</div></span>`;
}
function toggleInfoTip(e,key){
  e.stopPropagation();
  const el=document.getElementById('tip-'+key);
  if(!el) return;
  const wasOpen=el.classList.contains('open');
  // Close all open tips first (and reset any prior nudge so measurements are clean)
  document.querySelectorAll('.info-tip-bubble.open').forEach(b=>{
    b.classList.remove('open');
    b.style.transform='';
  });
  if(!wasOpen){
    el.classList.add('open');
    // Viewport-clamp: after the bubble renders, nudge it horizontally if it
    // would run off either edge. Mobile uses position:fixed (see CSS) so we
    // only need to nudge on tablet/desktop.
    requestAnimationFrame(()=>{
      if(window.innerWidth<=600) return; // mobile handled by CSS
      const rect=el.getBoundingClientRect();
      const pad=12;
      let shift=0;
      if(rect.right>window.innerWidth-pad) shift=(window.innerWidth-pad)-rect.right;
      else if(rect.left<pad) shift=pad-rect.left;
      // Default transform is translateX(-50%) (set in CSS); preserve that and add the nudge.
      el.style.transform=shift?`translateX(calc(-50% + ${shift}px))`:'';
    });
  }
}
// Dismiss any open tooltip on outside click
document.addEventListener('click',()=>{
  document.querySelectorAll('.info-tip-bubble.open').forEach(b=>{
    b.classList.remove('open');
    b.style.transform='';
  });
});

// ╔═══════════════════════════════════════╗
//   NAV
// ╚═══════════════════════════════════════╝
function switchTab(id){
  // Legacy tabs — redirect to Dashboard (Meals + Schedule now live inside the 2-modal flow)
  if(id==='weeksetup' || id==='mealplan'){
    id = 'dashboard';
  }
  // Soft gating for first-time users
  if(!isOnboardingComplete()){
    const gated = checkOnboardingGate(id);
    if(gated) return; // gate message shown, don't switch
  }
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  const sec=document.getElementById(id);
  if(sec) sec.classList.add('active');
  // Mark active nav tab by data attribute (index-free so reordering is safe)
  const activeBtn = document.querySelector(`.nav-tab[data-tab="${id}"]`);
  if(activeBtn) activeBtn.classList.add('active');
  // Set add context for library rendering
  if(id==='dashboard') { renderDashboard(); }
  if(id==='recipes') { _addContext='recipes'; renderLibrary(); renderOnboardingUI(); if(_learnMoreActive) _renderLearnMoreBanner(); }
  if(id==='menu') { _addContext='menu'; renderMealSections(); renderOnboardingUI(); if(_learnMoreActive) _renderLearnMoreBanner(); }
  if(id==='grocerylist') { renderGrocery(); renderOnboardingUI(); }
  if(id==='freezer') { renderFreezer(); if(_learnMoreActive) _renderLearnMoreBanner(); }
  localStorage.setItem('mpos_active_tab', id);
  window.scrollTo(0, 0);
  // FAB visibility follows the dashboard
  if(typeof _updatePlanFab === 'function'){
    const hasPlan = DAYS.some(d=>MEALS.some(m=>!!(mealPlan[d]&&mealPlan[d][m])));
    _updatePlanFab(hasPlan);
  }
}

// ╔═══════════════════════════════════════╗
//   RECIPE LIBRARY
// ╚═══════════════════════════════════════╝
let _libFilter='all';
let _libTagFilter=[]; // multi-select: array of active tag strings (empty = All Tags)
function _toggleLibTag(t){
  const i=_libTagFilter.indexOf(t);
  if(i>=0) _libTagFilter.splice(i,1); else _libTagFilter.push(t);
  renderLibrary();
}
function _clearLibTags(){ _libTagFilter=[]; renderLibrary(); }

function renderLibrary(){
  // ── Meal type filter ─────────────────────────────────────────────────────
  const filterEl=document.getElementById('libFilters');
  const filters=[
    {id:'all',          label:'All'},
    {id:'goto',         label:'⚡ Go-To Meal'},
    {id:'experimental', label:'✨ Experimental'},
    {id:'custom',       label:'✏️ Custom'},
  ];
  // ── Tag filter (derived from library + custom) ───────────────────────────
  const customRecipes=recipes.filter(r=>!r.libraryId);
  const TAG_ORDER=['Breakfast','Lunch','Dinner','Under 15 Min','Under 30 Min','Batch Cook','Freezer Friendly','One Pan'];
  const rawTags=[...new Set(LIBRARY_RECIPES.flatMap(r=>r.tags||[]))];
  if(customRecipes.length>0 && !rawTags.includes('Custom')) rawTags.push('Custom');
  const allTags=TAG_ORDER.filter(t=>rawTags.includes(t)).concat(rawTags.filter(t=>!TAG_ORDER.includes(t)));
  filterEl.innerHTML=`
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">
      ${filters.map(f=>{
        // Hide Custom filter if no custom recipes exist
        if(f.id==='custom' && customRecipes.length===0) return '';
        return `<button class="lib-filter-btn${_libFilter===f.id?' active':''}" onclick="_libFilter='${f.id}';renderLibrary()">${f.label}</button>`;
      }).join('')}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      <button class="lib-filter-btn lib-filter-tag${_libTagFilter.length===0?' active':''}" onclick="_clearLibTags()">All Tags</button>
      ${allTags.map(t=>{const mt=['Breakfast','Lunch','Dinner'].includes(t)?' lib-filter-mealtime':'';const active=_libTagFilter.includes(t)?' active':'';return `<button class="lib-filter-btn lib-filter-tag${mt}${active}" onclick="_toggleLibTag('${t.replace(/'/g,"\\'")}')">${t}</button>`;}).join('')}
    </div>`;

  // ── Recipe grid ─────────────────────────────────────────────────────────
  const grid=document.getElementById('libGrid');
  grid.innerHTML='';

  // Active tag filter (AND semantics). Treat 'Custom' as a special pseudo-tag
  // that means "only custom recipes" — same behavior as before.
  const activeTags=_libTagFilter.filter(t=>t!=='Custom');
  const customOnly=_libTagFilter.includes('Custom');

  // Filter library recipes
  let filteredLib=[];
  if(_libFilter!=='custom' && !customOnly){
    filteredLib=_libFilter==='all'?[...LIBRARY_RECIPES]:LIBRARY_RECIPES.filter(r=>r.type===_libFilter);
    if(activeTags.length>0) filteredLib=filteredLib.filter(r=>activeTags.every(t=>(r.tags||[]).includes(t)));
  }

  // Filter custom recipes
  let filteredCustom=[];
  if(_libFilter==='all'||_libFilter==='custom'){
    filteredCustom=[...customRecipes];
    // Custom recipes don't carry real tags — any non-Custom tag filter excludes them
    if(activeTags.length>0) filteredCustom=[];
  }

  // Tag pill helper
  const tagColorMap={
    'Breakfast':'mealtime','Lunch':'mealtime','Dinner':'mealtime',
    'Under 15 Min':'quick','Under 30 Min':'quick',
    'Batch Cook':'batch','Freezer Friendly':'freezer',
    'One Pan':'onepan','Custom':'custom',
  };

  // Count how many are on the menu per type (for disabling full categories)
  const gotoOnMenu=recipes.filter(r=>r.onMenu&&r.type==='goto').length;
  const expOnMenu=recipes.filter(r=>r.onMenu&&r.type==='experimental').length;
  const gotoFull=gotoOnMenu>=5, expFull=expOnMenu>=5;

  // ── Render custom recipe cards first ────────────────────────────────────
  filteredCustom.forEach(r=>{
    const ingList=(r.ingredients||[]).slice(0,4).map(i=>i.name).join(', ')
      +((r.ingredients||[]).length>4?` +${r.ingredients.length-4} more`:'');
    const srvLabel=r.servings===1?'1 serving':r.servings+' servings per batch';

    const typeLabels={goto:'⚡ Go-To',experimental:'✨ Experimental'};
    const typeName=typeLabels[r.type]||'';
    const typeClass=r.type==='goto'?'lib-type-goto':'lib-type-experimental';

    // Custom tag pills
    const customTags=(r.tags||[]).map(t=>{
      const cls=tagColorMap[t]||'easy';
      return `<span class="lib-tag lib-tag-${cls}">${t}</span>`;
    }).join('');

    let footerAction='';
    if(r.onMenu){
      footerAction=`<span class="lib-badge-added">✓ On Your Menu</span>`;
    } else {
      const isFull=r.type==='goto'?gotoFull:expFull;
      if(isFull){
        footerAction=`<span class="lib-badge-full">Menu full — go to <a href="#" onclick="event.preventDefault();switchTab('menu')">No-Decision Menu</a> to swap</span>`;
      } else {
        footerAction=`<button class="btn btn-primary lib-add-btn" onclick="addToMenu('${r.id}')">+ Add to No-Decision Menu</button>`;
      }
    }

    const card=document.createElement('div');
    card.className='lib-card';
    card.innerHTML=`
      <div class="lib-card-top">
        <div class="lib-card-name">${_esc(r.name)}</div>
        <div><span class="lib-type-tag lib-type-custom" style="margin-right:4px">✏️ Custom</span><span class="lib-type-tag ${typeClass}">${typeName}</span></div>
      </div>
      <div class="lib-card-srv">${srvLabel}</div>
      <div class="lib-tags"><span class="lib-tag lib-tag-custom">Custom</span>${customTags}</div>
      <div class="lib-card-ings">${_esc(ingList)}</div>
      ${r.sourceUrl&&r.sourceUrl.startsWith('http')?`<a href="${r.sourceUrl}" target="_blank" rel="noopener" class="lib-source-link">View original recipe →</a>`:''}
      <div class="lib-card-footer" style="flex-wrap:wrap;gap:6px">
        ${footerAction}
        <div style="display:flex;gap:6px;width:100%">
          <button class="btn btn-secondary btn-sm" onclick="openRecipeModal('${r.id}','${r.type}','recipes')" style="flex:1">Edit</button>
          <button class="btn btn-secondary btn-sm" onclick="deleteRecipe('${r.id}')" style="flex:1;color:var(--red)">Remove</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  // ── Render library recipe cards ─────────────────────────────────────────
  filteredLib.forEach(lr=>{
    const userRecipe=recipes.find(r=>r.libraryId===lr.id);
    const ingList=lr.ingredients.slice(0,4).map(i=>i.name).join(', ')
      +(lr.ingredients.length>4?` +${lr.ingredients.length-4} more`:'');
    const srvLabel=lr.servings===1?'1 serving':''+lr.servings+' servings per batch';

    const typeLabels={goto:'⚡ Go-To Meal',experimental:'✨ Experimental'};
    const typeName=typeLabels[lr.type]||(lr.type.charAt(0).toUpperCase()+lr.type.slice(1));
    const typeClass='lib-type-'+(lr.type==='goto'?'goto':'experimental');

    // Footer: single "Add to No-Decision Menu" for all states
    let footerAction='';
    const isFull=lr.type==='goto'?gotoFull:expFull;
    if(userRecipe && userRecipe.onMenu){
      footerAction=`<span class="lib-badge-added">✓ On Your Menu</span>
        <button class="btn btn-secondary btn-sm" onclick="openRecipeModal('${userRecipe.id}','${userRecipe.type}','recipes')">Edit</button>`;
    } else if(isFull){
      footerAction=`<span class="lib-badge-full">Menu full — go to <a href="#" onclick="event.preventDefault();switchTab('menu')">No-Decision Menu</a> to swap</span>`;
    } else if(userRecipe){
      footerAction=`<button class="btn btn-primary lib-add-btn" onclick="addToMenu('${userRecipe.id}')">+ Add to No-Decision Menu</button>
        <button class="btn btn-secondary btn-sm" onclick="openRecipeModal('${userRecipe.id}','${userRecipe.type}','recipes')">Edit</button>`;
    } else {
      footerAction=`<button class="btn btn-primary lib-add-btn" onclick="addFromLibrary('${lr.id}')">+ Add to No-Decision Menu</button>
        <button class="btn btn-secondary btn-sm" onclick="editFromLibrary('${lr.id}')">Edit</button>`;
    }

    const tagPills=(lr.tags||[]).map(t=>{
      const cls=tagColorMap[t]||'easy';
      return `<span class="lib-tag lib-tag-${cls}">${t}</span>`;
    }).join('');

    const card=document.createElement('div');
    card.className='lib-card';
    card.innerHTML=`
      <div class="lib-card-top">
        <div class="lib-card-name">${_esc(lr.name)}</div>
        <span class="lib-type-tag ${typeClass}">${typeName}</span>
      </div>
      <div class="lib-card-srv">${srvLabel}</div>
      ${tagPills?`<div class="lib-tags">${tagPills}</div>`:''}
      ${lr.notes?`<div class="lib-card-note">${lr.notes}</div>`:''}
      <div class="lib-card-ings">${ingList}</div>
      <div class="lib-card-footer">${footerAction}</div>`;
    grid.appendChild(card);
  });

  // Empty state
  if(filteredLib.length===0 && filteredCustom.length===0){
    grid.innerHTML=`<div style="color:var(--text-3);font-size:13px;padding:20px 0">No recipes in this category yet.</div>`;
  }
}

function addFromLibrary(id, menuType){
  const lr=LIBRARY_RECIPES.find(r=>r.id===id);
  if(!lr) return;
  // Don't add duplicates
  if(recipes.some(r=>r.libraryId===id)) return;
  // Check category limits
  const typeToUse=menuType||lr.type;
  if(recipes.filter(r=>r.onMenu&&r.type===typeToUse).length>=5){
    const catLabel=typeToUse==='goto'?'Go-To':'Experimental';
    alert('Your '+catLabel+' category is full (5/5). Remove one to make room.');
    return;
  }
  const newRecipe={
    id: uid(),
    libraryId: lr.id,
    type: typeToUse,
    onMenu: true,
    name: lr.name,
    servings: lr.servings,
    notes: lr.steps||lr.notes||'',
    ingredients: lr.ingredients.map(i=>({...i})),
  };
  recipes.push(newRecipe);
  save(K.recipes, recipes);
  renderLibrary();
  renderMealSections();
  renderOnboardingUI();
}

// Copy a library recipe into the user's list (not on menu) and open editor
function editFromLibrary(libraryId){
  const lr=LIBRARY_RECIPES.find(r=>r.id===libraryId);
  if(!lr) return;
  // If already copied, just open the existing copy
  let existing=recipes.find(r=>r.libraryId===libraryId);
  if(!existing){
    existing={
      id: uid(),
      libraryId: lr.id,
      type: lr.type,
      onMenu: false,
      name: lr.name,
      servings: lr.servings,
      notes: lr.steps||lr.notes||'',
      ingredients: lr.ingredients.map(i=>({...i})),
    };
    recipes.push(existing);
    save(K.recipes, recipes);
  }
  openRecipeModal(existing.id, existing.type, 'recipes');
}

// Add a saved recipe (custom or library) to the No-Decision Menu
function addToMenu(recipeId){
  const r=recipes.find(x=>x.id===recipeId);
  if(!r) return;
  if(recipes.filter(x=>x.onMenu&&x.type===r.type).length>=5){
    const label=r.type==='goto'?'Go-To':'Experimental';
    alert(label+' category is full (5/5). Remove one to make room.');
    return;
  }
  r.onMenu=true;
  save(K.recipes,recipes);
  renderLibrary();
  renderMealSections();
  renderOnboardingUI();
}

// ╔═══════════════════════════════════════╗
//   STEP 1 — WEEK NOTES
// ╚═══════════════════════════════════════╝
function renderWeek(){
  // Week badge (still used in header)
  const now=new Date(), d=now.getDay();
  const mon=new Date(now); mon.setDate(now.getDate()-(d===0?6:d-1));
  const wb=document.getElementById('weekBadge');
  if(wb) wb.textContent='Week of '+mon.toLocaleDateString('en-US',{month:'short',day:'numeric'});

  const grid=document.getElementById('weekGrid');
  if(!grid) return; // legacy Schedule tab removed — no-op
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
//   DASHBOARD — "final result" of Steps 1-3
//   Pure view over existing in-memory state.
//   No Supabase reads, no Netlify function calls.
// ╚═══════════════════════════════════════╝
function renderDashboard(){
  const body=document.getElementById('dashBody');
  const dateRangeEl=document.getElementById('dashDateRange');
  if(!body) return;

  // Compute Monday of this week and Mon-Sun date labels
  const now=new Date();
  const dow=now.getDay(); // 0=Sun..6=Sat
  const mon=new Date(now); mon.setDate(now.getDate()-(dow===0?6:dow-1));
  mon.setHours(0,0,0,0);
  const dayDates={};
  DAYS.forEach((d,i)=>{
    const dt=new Date(mon); dt.setDate(mon.getDate()+i);
    dayDates[d]=dt;
  });
  if(dateRangeEl){
    const fmt={month:'short',day:'numeric'};
    dateRangeEl.textContent=`${mon.toLocaleDateString('en-US',fmt)} – ${dayDates.sunday.toLocaleDateString('en-US',fmt)}`;
  }

  // "Today" highlights the current day (Mon..Sun)
  const todayIdx = dow===0 ? 6 : dow-1;

  // Count how many cook slots are planned this week
  let cookCount=0, hasAny=false;
  DAYS.forEach(d=>MEALS.forEach(m=>{
    const a = mealPlan[d]&&mealPlan[d][m];
    if(a) hasAny = true;
    if(a && a.state==='cook') cookCount++;
  }));

  // Empty state — nothing planned yet
  if(!hasAny){
    body.innerHTML = `
      <div class="dash-empty">
        <div class="dash-empty-icon">🍽️</div>
        <div class="dash-empty-title">Your week is wide open</div>
        <div class="dash-empty-sub">Tap the button below to plan your week in about 30 seconds.</div>
        <button class="btn btn-primary" onclick="openPlanWeekModal1()">Plan This Week →</button>
      </div>`;
    _updatePlanFab(false);
    return;
  }

  // Build streamlined day-card grid (7 day cards, Sat/Sun de-emphasized)
  const fmtDate = {month:'short',day:'numeric'};
  let html = '<div class="dash-grid">';
  DAYS.forEach((day,i)=>{
    const isToday = i===todayIdx;
    const weekend = (day==='saturday'||day==='sunday');
    const dateStr = dayDates[day].toLocaleDateString('en-US',fmtDate);
    html += `<div class="dash-day-card${isToday?' today':''}${weekend?' weekend':''}">`;
    html += `<div class="dash-day-header"><div><div class="dash-day-name">${DAY_FULL[day]}</div><div class="dash-day-date">${dateStr}</div></div></div>`;
    MEALS.forEach(meal=>{
      const a = mealPlan[day]&&mealPlan[day][meal];
      const state = a && a.state ? a.state : 'skipped';
      // Event/schedule note renders as a sub-line only when the primary label is
      // something else — otherwise we'd double-print the note.
      //   - cook state       → primary is recipe/freezer/custom name; note is a sub
      //   - skipped+skipLbl  → primary is "Leftovers"/"Eating out"; note is a sub
      //   - skipped, no lbl  → note IS the primary (plain event like "kid's soccer")
      const _showNoteSub = a && a.note && (
        state==='cook' ||
        (state==='skipped' && a.skipLabel && String(a.skipLabel).trim())
      );
      const noteHtml = _showNoteSub ? `<div class="dash-meal-sub">${_esc(a.note)}</div>` : '';
      // A skipped slot with a skipLabel, an event note, or a legacy label-as-note is still
      // an intentional plan — treat it visually like a planned meal.
      const hasSkipLabel = (state==='skipped' && a && a.skipLabel && String(a.skipLabel).trim().length>0);
      const hasSkipNote = (state==='skipped' && a && a.note && String(a.note).trim().length>0);
      const isPlanned = (state==='cook') || hasSkipLabel || hasSkipNote;
      const _rowCls = isPlanned ? 'dash-meal-row is-cook' : 'dash-meal-row is-skip';
      const _lblCls = isPlanned ? 'dash-meal-label is-cook' : 'dash-meal-label is-skip';
      html += `<div class="${_rowCls}" onclick="openSlotEditor('${day}','${meal}')" title="Click to edit">`;
      html += `<div class="${_lblCls}">${meal}</div>`;

      if(state==='cook' && a && a.recipeId){
        // Recipe assigned — click on name opens cooking view (instructions + servings)
        const _r = (recipes||[]).find(x=>x.id===a.recipeId);
        const _nm = _r ? _r.name : (a.name||'Meal');
        let _tipBits = [];
        if(_r){
          if(Array.isArray(_r.ingredients) && _r.ingredients.length){
            _tipBits.push('Ingredients:\n' + _r.ingredients.map(i=>{
              if(typeof i==='string') return '• '+i;
              return '• ' + [i.qty,i.unit,i.name].filter(Boolean).join(' ');
            }).join('\n'));
          }
          if(_r.notes && String(_r.notes).trim()){
            _tipBits.push('Instructions:\n' + String(_r.notes).trim());
          } else if(_r.instructions && String(_r.instructions).trim()){
            _tipBits.push('Instructions:\n' + String(_r.instructions).trim());
          }
        }
        const _tip = _tipBits.join('\n\n') || _nm;
        html += `<div class="dash-meal-name cookable" title="${_esc(_tip)}" onclick="event.stopPropagation();openCookingView('${a.recipeId}','${day}','${meal}')">${_esc(_nm)}</div>`;
      } else if(state==='cook' && a && a.freezerId){
        // Freezer pull — row click opens slot editor
        const _nm = a.name || 'Freezer meal';
        html += `<div class="dash-meal-name freezer">❄ ${_esc(_nm)}</div>`;
      } else if(state==='cook' && a && a.name){
        // Custom text entry (no recipe card, no freezer link) — just show the name.
        html += `<div class="dash-meal-name custom">${_esc(a.name)}</div>`;
      } else if(state==='cook'){
        // Cook but no recipe picked — row click opens slot editor
        html += `<div class="dash-meal-name empty-cook">Pick one <span class="dash-slot-dot"></span></div>`;
      } else {
        // Skipped. Primary label priority:
        //   1. skipLabel + optional skipDetail (e.g. "Eating out: Sushi")
        //   2. note (legacy data, or plain skip with just an event note)
        //   3. blank (no info at all → muted placeholder)
        // The event note renders separately as a sub-line via noteHtml below.
        const _skipLbl = a && a.skipLabel ? String(a.skipLabel).trim() : '';
        const _skipDtl = a && a.skipDetail ? String(a.skipDetail).trim() : '';
        const _legacyNote = a && a.note ? String(a.note).trim() : '';
        if(_skipLbl){
          const _primary = _skipDtl ? `${_skipLbl}: ${_skipDtl}` : _skipLbl;
          html += `<div class="dash-meal-name planned-alt">${_esc(_primary)}</div>`;
        } else if(_legacyNote){
          // No skipLabel — fall back to note as the primary (covers legacy "note=Leftovers"
          // data AND plain skips where the only info is an event like "kid's soccer").
          html += `<div class="dash-meal-name planned-alt">${_esc(_legacyNote)}</div>`;
        } else {
          html += `<div class="dash-meal-empty">&nbsp;</div>`;
        }
      }
      html += noteHtml;
      html += '</div>';
    });
    if(isToday) html += '<div class="dash-today-footer">Today</div>';
    // Show per-day obligation from weekNotes (subtle red text at bottom of card)
    const _obl = weekNotes[day] && weekNotes[day].am ? String(weekNotes[day].am).trim() : '';
    if(_obl) html += `<div class="dash-obligation">${_esc(_obl)}</div>`;
    html += '</div>'; // /day-card
  });
  html += '</div>'; // /grid
  body.innerHTML = html;
  _updatePlanFab(true);
}

// ── Floating Action Button ───────────────────────────────────────────────
function _updatePlanFab(hasPlan){
  const fab = document.getElementById('planFab');
  if(!fab) return;
  // Only show on Dashboard
  const dashActive = document.getElementById('dashboard') && document.getElementById('dashboard').classList.contains('active');
  fab.style.display = dashActive ? 'flex' : 'none';
  const label = fab.querySelector('.fab-label');
  const sub = fab.querySelector('.fab-sub');
  if(hasPlan){
    if(label) label.textContent = '↻ Adjust My Week';
    if(sub) sub.textContent = 'Change your mind? Redo it';
  } else {
    if(label) label.textContent = 'Plan This Week →';
    if(sub) sub.textContent = 'Takes about 30 seconds';
  }
}

// ── Slot Editor popover (tap-to-edit on Dashboard) ──────────────────────
let _slotEditCtx = null;
let _slotEditStaged = null; // {kind:'recipe'|'freezer', id, name, servings}
let _slotEditSkipStaged = null; // {label:'Leftovers'|'Eating out', detail:string}
function openSlotEditor(day,meal){
  _slotEditCtx = {day,meal};
  const cur = getSlot(day,meal);
  // Pre-stage an existing assignment so the servings panel reflects the current state
  if(cur && cur.state==='cook' && cur.recipeId){
    const _r = recipes.find(x=>x.id===cur.recipeId);
    _slotEditStaged = {kind:'recipe', id:cur.recipeId, name:(cur.name||(_r&&_r.name)||''), servings:cur.servings||(_r&&_r.servings)||2};
  } else if(cur && cur.state==='cook' && cur.freezerId){
    _slotEditStaged = {kind:'freezer', id:cur.freezerId, name:cur.name||'', servings:cur.servings||2};
  } else {
    _slotEditStaged = null;
  }
  const state = cur && cur.state ? cur.state : 'unplanned';
  const note = cur && cur.note ? cur.note : '';
  const recipeId = cur && cur.recipeId ? cur.recipeId : '';
  const title = `${DAY_FULL[day]} ${MEAL_LABEL[meal]}`;
  const menuRecipes = recipes.filter(r=>r.onMenu);

  const experimentalRecipes = recipes.filter(r=>!r.onMenu);

  let html = `<div class="slot-editor-title">${title}</div>`;

  // Cook section
  html += '<div class="slot-editor-section"><div class="slot-editor-section-label">Cook this meal:</div>';

  if(menuRecipes.length===0){
    html += '<div class="slot-editor-empty" style="margin-bottom:10px">No recipes on your No-Decision Menu yet. <a href="#" onclick="event.preventDefault();closeSlotEditor();switchTab(\'menu\')">Build your menu →</a></div>';
  } else {
    html += '<div class="slot-editor-recipes">';
    menuRecipes.forEach(r=>{
      const sel = r.id===recipeId ? ' selected' : '';
      const _rn = r.name.replace(/'/g,"\\'");
      html += `<button type="button" class="slot-editor-recipe${sel}" data-rid="${r.id}" onclick="_slotEditorStageRecipe('${r.id}','${_rn}',${r.servings||2})">${_esc(r.name)}</button>`;
    });
    html += '</div>';
  }

  // Experimental subheader + non-menu recipes
  if(experimentalRecipes.length>0){
    html += '<div class="slot-editor-sub-label">or try an experimental meal</div>';
    html += '<div class="slot-editor-recipes experimental">';
    experimentalRecipes.forEach(r=>{
      const sel = r.id===recipeId ? ' selected' : '';
      const _rn = r.name.replace(/'/g,"\\'");
      html += `<button type="button" class="slot-editor-recipe${sel}" data-rid="${r.id}" onclick="_slotEditorStageRecipe('${r.id}','${_rn}',${r.servings||2})">✨ ${_esc(r.name)}</button>`;
    });
    html += '</div>';
  }

  // Freezer option
  if(freezer && freezer.length>0){
    html += '<div class="slot-editor-sub-label">or pull from freezer</div><div class="slot-editor-recipes">';
    freezer.forEach(f=>{
      const sel = cur && cur.freezerId===f.id ? ' selected' : '';
      const _fn = f.name.replace(/'/g,"\\'");
      html += `<button type="button" class="slot-editor-recipe${sel}" data-fid="${f.id}" onclick="_slotEditorStageFreezer('${f.id}','${_fn}',${f.servings||2})">❄ ${_esc(f.name)}</button>`;
    });
    html += '</div>';
  }

  // Staged servings panel — hidden until a recipe or freezer item is picked
  html += '<div id="slotEditorServingsPanel" class="slot-servings-panel" style="display:none"></div>';

  // Quick text entry — plan something without creating a whole recipe card
  // (e.g. "PB&J sandwich", "Cereal", "Mom's lasagna leftovers").
  const _curCustomName = (cur && cur.state==='cook' && !cur.recipeId && !cur.freezerId && cur.name) ? cur.name : '';
  html += '<div class="slot-editor-sub-label">or just type it</div>';
  html += `<div class="slot-editor-custom">
    <input type="text" id="slotEditorCustomInput" placeholder="e.g. PB&amp;J sandwich, cereal, taco night…" value="${_esc(_curCustomName)}" maxlength="80" onkeydown="if(event.key==='Enter'){event.preventDefault();_slotEditorSaveCustom();}">
    <button type="button" class="btn btn-primary btn-sm" onclick="_slotEditorSaveCustom()">Save</button>
  </div>`;

  // Escape hatch — jump to Recipes tab to add something new
  html += `<div class="slot-editor-escape"><a href="#" onclick="event.preventDefault();closeSlotEditor();switchTab('recipes')">Want a full recipe card? Add one →</a></div>`;
  html += '</div>';

  // Not cooking section — pick a reason, optionally add a detail, then save.
  const _curSkipLabel = (cur && cur.state==='skipped' && cur.skipLabel) ? String(cur.skipLabel) : '';
  const _curSkipDetail = (cur && cur.state==='skipped' && cur.skipDetail) ? String(cur.skipDetail) : '';
  if(_curSkipLabel){
    _slotEditSkipStaged = {label:_curSkipLabel, detail:_curSkipDetail};
  } else {
    _slotEditSkipStaged = null;
  }
  const _lftActive = _curSkipLabel==='Leftovers' ? ' active' : '';
  const _eoActive  = _curSkipLabel==='Eating out' ? ' active' : '';
  html += '<div class="slot-editor-section"><div class="slot-editor-section-label">Not cooking?</div>';
  html += '<div class="slot-editor-quick">';
  html += `<button type="button" class="slot-editor-quick-btn${_lftActive}" data-skip="Leftovers" onclick="_slotEditorStageSkip('Leftovers')">Leftovers</button>`;
  html += `<button type="button" class="slot-editor-quick-btn${_eoActive}" data-skip="Eating out" onclick="_slotEditorStageSkip('Eating out')">Eating out</button>`;
  html += '</div>';
  // Detail panel — hidden until a reason is picked. Lets the user specify what
  // e.g. "Sushi" (eating out) or "Thursday's pasta" (leftovers).
  const _skipPanelHidden = _curSkipLabel ? '' : ' style="display:none"';
  html += `<div id="slotEditorSkipPanel" class="slot-skip-panel"${_skipPanelHidden}>
    <input type="text" id="slotEditorSkipDetail" placeholder="Optional — what exactly?" value="${_esc(_curSkipDetail)}" maxlength="80" onkeydown="if(event.key==='Enter'){event.preventDefault();_slotEditorCommitSkip();}">
    <button type="button" class="btn btn-primary btn-sm" onclick="_slotEditorCommitSkip()">Save</button>
  </div>`;
  html += '</div>';

  // Footer — Mark as skipped + Clear this slot side by side
  html += '<div class="slot-editor-footer">';
  html += '<button type="button" class="btn btn-secondary btn-sm" onclick="_slotEditorSkip()">Mark as skipped</button>';
  if(cur){
    html += '<button type="button" class="btn btn-danger btn-sm" onclick="_slotEditorClear()">Clear this slot</button>';
  }
  html += '</div>';

  document.getElementById('slotEditorBody').innerHTML = html;
  document.getElementById('slotEditor').classList.add('open');
  // If we pre-staged an existing assignment, reveal the servings panel + highlight the button
  if(_slotEditStaged){
    _slotEditorUpdateSelection();
    _slotEditorRenderServingsPanel();
  }
}
function closeSlotEditor(){
  const ov = document.getElementById('slotEditor');
  if(ov) ov.classList.remove('open');
  _slotEditCtx = null;
  _slotEditSkipStaged = null;
  _slotEditStaged = null;
}
function _slotEditorStageRecipe(recipeId,name,servings){
  if(!_slotEditCtx) return;
  _slotEditStaged = {kind:'recipe', id:recipeId, name:name||'', servings:parseInt(servings)||2};
  _slotEditorUpdateSelection();
  _slotEditorRenderServingsPanel();
}
function _slotEditorStageFreezer(freezerId,name,servings){
  if(!_slotEditCtx) return;
  // Freezer meals are already portioned — commit directly, no servings step.
  _slotEditStaged = {kind:'freezer', id:freezerId, name:name||'', servings:parseInt(servings)||2};
  _slotEditorCommitStaged();
}
function _slotEditorSaveCustom(){
  if(!_slotEditCtx) return;
  const input = document.getElementById('slotEditorCustomInput');
  const name = (input && input.value || '').trim();
  if(!name) return;
  const {day,meal} = _slotEditCtx;
  if(!mealPlan[day]) mealPlan[day] = {};
  // Custom text entry: cook state, no recipe/freezer link, just a name.
  // Clear any previous skip note since this is a fresh cook assignment.
  mealPlan[day][meal] = {state:'cook', name:name, servings:1, mealType:'custom', recipeId:null, freezerId:null, freezerItem:false, note:''};
  save(K.mealPlan, mealPlan);
  _slotEditStaged = null;
  closeSlotEditor();
  renderDashboard();
  renderOnboardingUI();
}
function _slotEditorUpdateSelection(){
  // visually mark only the currently staged button
  document.querySelectorAll('.slot-editor-recipe').forEach(b=>b.classList.remove('staged'));
  if(!_slotEditStaged) return;
  const attr = _slotEditStaged.kind==='recipe' ? 'rid' : 'fid';
  const el = document.querySelector(`.slot-editor-recipe[data-${attr}="${_slotEditStaged.id}"]`);
  if(el) el.classList.add('staged');
}
function _slotEditorRenderServingsPanel(){
  const panel = document.getElementById('slotEditorServingsPanel');
  if(!panel) return;
  if(!_slotEditStaged){ panel.style.display='none'; panel.innerHTML=''; return; }
  const s = _slotEditStaged;
  panel.style.display='block';
  panel.innerHTML = `
    <div class="slot-servings-title">Cooking: <strong>${_esc(s.name)}</strong></div>
    <div class="slot-servings-row">
      <label for="slotEditServings">Servings</label>
      <button type="button" class="slot-servings-step" onclick="_slotEditorBumpServings(-1)">−</button>
      <input type="number" id="slotEditServings" inputmode="numeric" min="1" max="50" value="${s.servings}" oninput="if(_slotEditStaged){_slotEditStaged.servings=parseInt(this.value)||1;}">
      <button type="button" class="slot-servings-step" onclick="_slotEditorBumpServings(1)">+</button>
    </div>
    <div class="slot-servings-hint">💡 Your grocery list scales automatically.</div>
    <button type="button" class="btn btn-primary slot-servings-save" onclick="_slotEditorCommitStaged()">Save Meal →</button>
  `;
}
function _slotEditorBumpServings(delta){
  if(!_slotEditStaged) return;
  const next = Math.max(1, Math.min(50, (_slotEditStaged.servings||2)+delta));
  _slotEditStaged.servings = next;
  const el = document.getElementById('slotEditServings');
  if(el) el.value = next;
}
function _slotEditorCommitStaged(){
  if(!_slotEditCtx || !_slotEditStaged) return;
  const {day,meal} = _slotEditCtx;
  const inputEl = document.getElementById('slotEditServings');
  const srv = inputEl ? (parseInt(inputEl.value)||_slotEditStaged.servings||2) : (_slotEditStaged.servings||2);
  // Only preserve notes across cook→cook transitions. If the previous slot was skipped
  // (Leftovers / Eating out / schedule-conflict note), that note belonged to the skip
  // reason and must not carry over to the new cook assignment.
  const _prevSlot = mealPlan[day]&&mealPlan[day][meal];
  const prevNote = (_prevSlot && _prevSlot.state==='cook' && _prevSlot.note) ? _prevSlot.note : '';

  if(_slotEditStaged.kind==='recipe'){
    const r = recipes.find(x=>x.id===_slotEditStaged.id);
    if(!r) return;
    // If swapping recipes, clear previous recipe's grocery checks
    const prevRecipeId = mealPlan[day]&&mealPlan[day][meal]&&mealPlan[day][meal].recipeId;
    if(prevRecipeId && prevRecipeId!==r.id){
      const pr = recipes.find(x=>x.id===prevRecipeId);
      if(pr && pr.ingredients){
        pr.ingredients.forEach(ing=>{
          const cat=ing.category||'Pantry & Seasonings';
          const k=(ing.name||'').toLowerCase().trim();
          delete checks[cat+'|'+k];
        });
        save(K.checks,checks);
      }
    }
    setSlotCook(day,meal);
    mealPlan[day][meal].recipeId = r.id;
    mealPlan[day][meal].name = r.name;
    mealPlan[day][meal].servings = srv;
    mealPlan[day][meal].mealType = r.type;
    mealPlan[day][meal].freezerId = null;
    mealPlan[day][meal].freezerItem = false;
    mealPlan[day][meal].note = prevNote;
  } else {
    const f = freezer.find(x=>x.id===_slotEditStaged.id);
    if(!f) return;
    setSlotCook(day,meal);
    mealPlan[day][meal] = {state:'cook', name:f.name, servings:srv, mealType:'freezer', freezerItem:true, freezerId:f.id, recipeId:null, note:prevNote};
  }
  save(K.mealPlan, mealPlan);
  _slotEditStaged = null;
  closeSlotEditor();
  renderDashboard();
  renderOnboardingUI();
}
function _slotEditorSkip(){
  if(!_slotEditCtx) return;
  const {day,meal} = _slotEditCtx;
  // Preserve event note, drop any skipLabel. This is a plain skip, not leftovers/eating out.
  const existing = mealPlan[day]&&mealPlan[day][meal];
  let eventNote = existing && existing.note ? String(existing.note).trim() : '';
  if(/^(leftovers?|eating out)$/i.test(eventNote)) eventNote = '';
  setSlotSkipped(day,meal,eventNote);
  if(mealPlan[day] && mealPlan[day][meal]) delete mealPlan[day][meal].skipLabel;
  save(K.mealPlan, mealPlan);
  closeSlotEditor();
  renderDashboard();
  renderOnboardingUI();
}
function _slotEditorStageSkip(label){
  if(!_slotEditCtx) return;
  // Stage the reason, keep any existing detail the user already typed.
  const existingDetail = _slotEditSkipStaged ? _slotEditSkipStaged.detail : '';
  _slotEditSkipStaged = {label: label, detail: existingDetail};
  // Visually highlight the active reason
  document.querySelectorAll('.slot-editor-quick-btn').forEach(b=>{
    b.classList.toggle('active', b.getAttribute('data-skip')===label);
  });
  // Reveal the detail panel and focus the input
  const panel = document.getElementById('slotEditorSkipPanel');
  if(panel){
    panel.style.display = '';
    const input = document.getElementById('slotEditorSkipDetail');
    if(input){
      setTimeout(()=>{ try { input.focus(); input.select(); } catch(e){} }, 0);
    }
  }
}
function _slotEditorCommitSkip(){
  if(!_slotEditCtx || !_slotEditSkipStaged) return;
  const {day,meal} = _slotEditCtx;
  const input = document.getElementById('slotEditorSkipDetail');
  const detail = input ? (input.value||'').trim() : (_slotEditSkipStaged.detail||'');
  // Preserve any event/schedule note already on this slot. If the previous note
  // was actually a legacy skip label (pre-skipLabel data), drop it.
  const existing = mealPlan[day]&&mealPlan[day][meal];
  let eventNote = existing && existing.note ? String(existing.note).trim() : '';
  if(/^(leftovers?|eating out)$/i.test(eventNote)) eventNote = '';
  if(!mealPlan[day]) mealPlan[day] = {};
  mealPlan[day][meal] = {
    state:'skipped',
    recipeId:null,
    note: eventNote,
    skipLabel: _slotEditSkipStaged.label || '',
    skipDetail: detail
  };
  save(K.mealPlan, mealPlan);
  _slotEditSkipStaged = null;
  closeSlotEditor();
  renderDashboard();
  renderOnboardingUI();
}
function _slotEditorClear(){
  if(!_slotEditCtx) return;
  const {day,meal} = _slotEditCtx;
  clearSlot(day,meal);
  save(K.mealPlan, mealPlan);
  closeSlotEditor();
  renderDashboard();
  renderOnboardingUI();
}

// ╔═══════════════════════════════════════╗
//   STEP 2 — RECIPES
// ╚═══════════════════════════════════════╝
function renderMealSections(){
  const el=document.getElementById('mealSections');
  el.innerHTML='';

  // Clear the old saved-recipes container (no longer used)
  const savedEl=document.getElementById('menuSavedRecipes');
  if(savedEl) savedEl.innerHTML='';

  // ── No-Decision Menu groups ─────────────────────────────────────────────
  const menuRecipes=recipes.filter(r=>r.onMenu);
  if(menuRecipes.length===0){
    el.innerHTML=`<div style="text-align:center;padding:40px 20px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow)">
      <div style="font-size:36px;margin-bottom:12px">🍽️</div>
      <div style="font-size:15px;font-weight:800;margin-bottom:6px">Your No-Decision Menu is empty.</div>
      <div style="font-size:13px;color:var(--text-2);max-width:360px;margin:0 auto 18px;line-height:1.55">Head to the Recipe Library to add meals as Go-To or Experimental — they'll show up here.</div>
      <button class="btn btn-primary" onclick="switchTab('recipes')">Browse Recipes</button>
    </div>`;
    return;
  }

  const MENU_GROUPS=[
    {type:'goto',       icon:'⚡', label:'Go-To Meals (repeat weekly)',       desc:'Reliable recipes you could cook half-asleep'},
    {type:'experimental',icon:'✨',label:'Experimental Meals (optional variety)', desc:'More involved recipes that push you to try something new'},
  ];
  MENU_GROUPS.forEach(({type,icon,label,desc})=>{
    const list=recipes.filter(r=>r.onMenu&&r.type===type);
    const max=5;
    const rem=max-list.length;
    const wrap=document.createElement('div');
    wrap.innerHTML=`
      <div class="meal-section-header">
        <div class="meal-type-label">
          <div class="meal-type-icon">${icon}</div>
          <div>
            <div class="meal-type-title">${label} ${infoTipHtml(type)}</div>
            <div class="meal-slots-count">${list.length}/${max} — ${rem>0?rem+' slot'+(rem>1?'s':'')+' left':'Menu locked in ✓'}</div>
          </div>
        </div>
        ${rem>0?`<button class="btn btn-secondary btn-sm" onclick="openRecipeModal(null,'${type}','menu')">+ Add New Recipe</button>`:''}
      </div>
      <div class="recipes-grid" id="rgrid-${type}"></div>`;
    el.appendChild(wrap);
    const grid=document.getElementById('rgrid-'+type);
    list.forEach(r=>{
      const card=document.createElement('div');
      card.className='recipe-card';
      const ingPreviewRaw=r.ingredients.slice(0,3).map(i=>i.name||'').join(', ')+(r.ingredients.length>3?` +${r.ingredients.length-3} more`:'');
      const tagHtml=r.tags&&r.tags.length>0?`<div class="recipe-card-tags">${r.tags.map(t=>`<span class="recipe-tag">${_esc(t)}</span>`).join('')}</div>`:'';
      card.innerHTML=`
        <div class="recipe-card-name">${_esc(r.name)}</div>
        <div class="recipe-card-servings">${r.servings} serving${r.servings!==1?'s':''} per batch</div>
        ${tagHtml}
        <div class="recipe-card-ings">${_esc(ingPreviewRaw)||'No ingredients yet'}</div>
        <div class="recipe-card-actions">
          <button class="btn btn-secondary btn-sm" onclick="openRecipeModal('${r.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="removeFromMenu('${r.id}')">Remove from Menu</button>
        </div>`;
      grid.appendChild(card);
    });
    if(rem>0){
      const slot=document.createElement('div');
      slot.className='add-recipe-slot';
      slot.onclick=()=>openRecipeModal(null,type,'menu');
      slot.innerHTML=`<div class="plus">+</div><div class="slot-text">Add a ${type==='goto'?'go-to':'experimental'} recipe</div>`;
      grid.appendChild(slot);
    } else {
      const max_el=document.createElement('div');
      max_el.className='max-reached';
      max_el.innerHTML=`<strong>${max}/${max} ✓</strong><span>Locked in — no decisions needed.</span>`;
      grid.appendChild(max_el);
    }
  });
}

// ── Menu management ─────────────────────────────────────────────────────
function removeFromMenu(recipeId){
  const r=recipes.find(x=>x.id===recipeId);
  if(!r) return;
  if(!confirm('Remove "'+r.name+'" from your No-Decision Menu? It will stay in your recipe library.')) return;
  // Also remove from meal plan if assigned
  DAYS.forEach(d=>MEALS.forEach(m=>{if(mealPlan[d]&&mealPlan[d][m]&&mealPlan[d][m].recipeId===recipeId)delete mealPlan[d][m];}));
  r.onMenu=false;
  save(K.recipes,recipes); save(K.mealPlan,mealPlan);
  renderMealSections();
  renderLibrary();
  renderOnboardingUI();
}

const AVAILABLE_TAGS=['Breakfast','Lunch','Dinner','Under 15 Min','Under 30 Min','Batch Cook','Freezer Friendly','One Pan'];
let _editId=null, _editType='goto', _modalContext='menu';
function openRecipeModal(id,type,context){
  _editId=id;
  _modalContext=context||_addContext||'recipes';
  const r=id?recipes.find(x=>x.id===id):null;
  _editType=type||(r?r.type:null);
  document.getElementById('recipeModalTitle').textContent=id?'Edit Recipe':'Add Recipe';
  document.getElementById('r_name').value=r?r.name:'';
  document.getElementById('r_servings').value=r?r.servings:4;
  // Type dropdown — always visible, always required
  const typeGroup=document.getElementById('r_type_group');
  typeGroup.style.display='';
  document.getElementById('r_type').value=r?r.type||'':(_editType||'goto');
  // Tag picker — show only for custom recipes (no libraryId)
  const tagsGroup=document.getElementById('r_tags_group');
  const tagsPicker=document.getElementById('r_tags_picker');
  const isCustom=!r||!r.libraryId;
  if(tagsGroup) tagsGroup.style.display=isCustom?'':'none';
  if(tagsPicker && isCustom){
    const existingTags=r&&r.tags?r.tags:[];
    tagsPicker.innerHTML=AVAILABLE_TAGS.map(t=>{
      const active=existingTags.includes(t)?'active':'';
      return `<button type="button" class="tag-pill ${active}" onclick="this.classList.toggle('active')">${t}</button>`;
    }).join('');
  }
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
  // URL import — reset and show only for new recipes
  const urlGroup=document.getElementById('r_url_group');
  if(urlGroup) urlGroup.style.display=r?'none':'';
  const urlInput=document.getElementById('r_url');
  if(urlInput) urlInput.value='';
  const urlStatus=document.getElementById('r_url_status');
  if(urlStatus){urlStatus.textContent='';urlStatus.className='url-status';}
  _importedSourceUrl=null;
  setTimeout(()=>document.getElementById('r_name').focus(),100);
}
// ── URL Import ────────────────────────────────────────────────────────────
let _importedSourceUrl=null;
async function fetchRecipeFromUrl(){
  const urlInput=document.getElementById('r_url');
  const statusEl=document.getElementById('r_url_status');
  const btn=document.getElementById('r_url_btn');
  const url=(urlInput.value||'').trim();
  if(!url){urlInput.focus();return;}
  // Basic URL validation
  try{new URL(url);}catch(e){statusEl.textContent='Please enter a valid URL.';statusEl.className='url-status url-error';return;}
  btn.disabled=true;btn.textContent='Importing…';
  statusEl.textContent='Fetching recipe…';statusEl.className='url-status';
  _importedSourceUrl=null;
  try{
    const res=await fetch('/.netlify/functions/scrape-recipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url})});
    const data=await res.json();
    if(!res.ok){statusEl.textContent=data.error||'Import failed.';statusEl.className='url-status url-error';return;}
    // Populate modal fields
    if(data.name) document.getElementById('r_name').value=data.name;
    if(data.servings) document.getElementById('r_servings').value=data.servings;
    // Populate steps
    const stepsEl=document.getElementById('stepsRows');
    stepsEl.innerHTML='';
    if(data.steps&&data.steps.length>0) data.steps.forEach(s=>addStepRow(s)); else addStepRow('');
    // Populate ingredients (parse "qty name" from strings)
    document.getElementById('ingRows').innerHTML='';
    if(data.ingredients&&data.ingredients.length>0){
      data.ingredients.forEach(raw=>{
        const parts=parseIngredientString(raw);
        addIngRow(parts);
      });
    } else {addIngRow();}
    _importedSourceUrl=url;
    statusEl.textContent='✓ Imported! Review and edit below.';statusEl.className='url-status url-success';
  }catch(e){
    statusEl.textContent='Could not reach the server. Try again.';statusEl.className='url-status url-error';
  }finally{btn.disabled=false;btn.textContent='Import';}
}
function parseIngredientString(raw){
  // Try to split "1 cup flour" into qty="1 cup" name="flour"
  const m=raw.match(/^([\d\s\/⅛⅙⅕¼⅓⅜½⅝⅔¾⅚⅞.,]+\s*(?:cups?|tbsp|tsp|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|ml|liters?|cloves?|cans?|bunch(?:es)?|pinch(?:es)?|dash(?:es)?|cups?|large|medium|small|whole|stalk|stalks|head|heads)?)\s+(.+)/i);
  const name=m?m[2].trim():raw.trim();
  const qty=m?m[1].trim():'';
  return{qty,name,category:guessCategory(name)};
}
function guessCategory(name){
  const n=name.toLowerCase();
  const produce=/\b(lettuce|spinach|kale|arugula|tomato|onion|garlic|ginger|pepper|jalape|potato|sweet potato|carrot|celery|broccoli|cauliflower|zucchini|squash|cucumber|avocado|mushroom|corn|pea|bean sprout|cabbage|bok choy|eggplant|radish|beet|turnip|parsnip|shallot|scallion|green onion|leek|asparagus|artichoke|okra|chili|lime|lemon|orange|apple|banana|berr|mango|pineapple|peach|pear|grape|melon|strawberr|blueberr|raspberr|blackberr|cherry|plum|fig|kiwi|coconut|pomegranate|cranberr|herb|cilantro|parsley|basil|mint|dill|rosemary|thyme|sage|chive|oregano|tarragon|salad|sprout|fennel|watercress|endive|romaine)\b/;
  const protein=/\b(chicken|beef|steak|pork|turkey|lamb|salmon|tuna|shrimp|prawn|fish|cod|tilapia|halibut|sausage|bacon|ham|ground meat|ground beef|ground turkey|ground pork|meatball|tofu|tempeh|seitan|eggs?|anchov|crab|lobster|scallop|clam|mussel|oyster|squid|bison|venison|duck|chorizo|pepperoni|salami|hot dog|bratwurst)\b/;
  const dairy=/\b(milk|cream|cheese|yogurt|butter|sour cream|cream cheese|whipping cream|half.and.half|mozzarella|parmesan|cheddar|feta|ricotta|gouda|brie|gruyere|provolone|cottage cheese|whey|ghee|oat milk|almond milk|soy milk|coconut milk|coconut cream)\b/;
  const grains=/\b(bread|tortillas?|pita|naan|bun|roll|rice|pasta|noodle|spaghetti|penne|fettuccine|macaroni|linguine|orzo|couscous|quinoa|oats?|flour|cornmeal|polenta|barley|bulgur|farro|millet|cereal|granola|cracker|panko|breadcrumb|wrap|bagel|croissant|english muffin|pizza dough|pie crust|puff pastry|wonton)\b/;
  const pantry=/\b(oil|olive oil|vegetable oil|coconut oil|sesame oil|vinegar|soy sauce|fish sauce|worcestershire|hot sauce|sriracha|ketchup|mustard|mayonnaise|salt|pepper|paprika|cumin|cinnamon|nutmeg|turmeric|chili powder|cayenne|oregano|thyme|bay lea|vanilla|sugar|brown sugar|honey|maple syrup|molasses|cornstarch|baking soda|baking powder|yeast|broth|stock|bouillon|tomato paste|tomato sauce|diced tomato|crushed tomato|canned|salsa|peanut butter|almond butter|tahini|jam|jelly|syrup|cocoa|chocolate|chip|nut|almond|walnut|pecan|cashew|pistachio|peanut|seed|sesame|flax|chia|sunflower|pumpkin seed|raisin|dried|lentil|chickpea|black bean|kidney bean|pinto bean|navy bean|white bean|split pea|spice|seasoning|extract|food coloring|spray|cooking spray|worcester|hoisin|teriyaki|bbq sauce|ranch|dressing|marinade|relish|caper|olive|pickle|anchovy paste|miso|gochujang|sambal|curry paste|coconut aminos|nutritional yeast|protein powder)\b/;
  const freezer=/\b(frozen|ice cream|popsicle|frozen pizza|frozen fruit|frozen vegetable|frozen meal|waffle|frozen fry|tater tot|ice)\b/;
  if(produce.test(n)) return 'Produce';
  if(protein.test(n)) return 'Protein';
  if(dairy.test(n)) return 'Dairy / Dairy-Free';
  if(grains.test(n)) return 'Grains & Breads';
  if(freezer.test(n)) return 'Freezer / Flex';
  if(pantry.test(n)) return 'Pantry & Seasonings';
  return 'Pantry & Seasonings';
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
    <button class="ing-remove" onclick="this.closest('.ing-row').remove()" title="Remove">✕</button>
    <input type="text" class="ing-name" placeholder="e.g. Oats" value="${ing?ing.name:''}">
    <div class="ing-row-bottom">
      <input type="text" placeholder="1 cup" value="${ing?ing.qty:''}">
      <select>${opts}</select>
    </div>`;
  document.getElementById('ingRows').appendChild(row);
}
function saveRecipe(){
  const name=document.getElementById('r_name').value.trim();
  if(!name){document.getElementById('r_name').focus();return;}
  const rawType=document.getElementById('r_type').value;
  const type=rawType||null;
  // Type is required
  if(!type){
    alert('Please select a meal type (Go-To or Experimental).');
    document.getElementById('r_type').focus();
    return;
  }
  // Collect tags from picker (custom recipes only)
  const tagPicker=document.getElementById('r_tags_picker');
  const tags=tagPicker?Array.from(tagPicker.querySelectorAll('.tag-pill.active')).map(b=>b.textContent):[];
  const ings=Array.from(document.querySelectorAll('#ingRows .ing-row')).map(row=>{
    const ins=row.querySelectorAll('input');
    return{name:ins[0].value.trim(),qty:ins[1].value.trim(),category:row.querySelector('select').value};
  }).filter(i=>i.name);
  const notes=Array.from(document.querySelectorAll('#stepsRows .step-row input'))
    .map(i=>i.value.trim()).filter(Boolean).join('\n');
  const data={name,type,servings:parseInt(document.getElementById('r_servings').value)||4,notes,ingredients:ings,tags};
  // Attach source URL if imported from a URL
  if(_importedSourceUrl&&!_editId) data.sourceUrl=_importedSourceUrl;
  _importedSourceUrl=null;
  if(_editId){
    const i=recipes.findIndex(r=>r.id===_editId);
    if(i>-1) recipes[i]={...recipes[i],...data};
  } else {
    // From menu context → add directly to menu; from recipes context → save to library only
    const goesOnMenu=_modalContext==='menu';
    if(goesOnMenu){
      // Check menu limits before adding
      const onMenuCount=recipes.filter(r=>r.onMenu&&r.type===type).length;
      if(onMenuCount>=5){
        alert('Your '+(type==='goto'?'Go-To':'Experimental')+' menu is full (5/5). Remove one to make room.');
        return;
      }
    }
    recipes.push({id:uid(),onMenu:goesOnMenu,...data});
  }
  save(K.recipes,recipes);
  closeModal('recipeModal');
  renderMealSections();
  renderLibrary();
  renderOnboardingUI();
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
  renderLibrary();
  renderOnboardingUI();
}

// ╔═══════════════════════════════════════╗
//   STEP 3 — MEAL PLAN
// ╚═══════════════════════════════════════╝
function renderMealPlan(){
  const tbl=document.getElementById('mealPlanTable');
  if(!tbl) return; // legacy Meals tab removed — no-op
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
    let row=`<td style="${rowStyle};padding:0"><div class="row-label"><div class="row-label-name" style="color:${rowNameColor}">${meal}</div></div></td>`;
    DAYS.forEach(d=>{
      const asgn=mealPlan[d]&&mealPlan[d][meal];
      row+=`<td>`;
      if(asgn){
        const cls=getCellClass(meal,asgn);
        const tag=getCellTag(meal,asgn);
        const _recipe=asgn.recipeId?recipes.find(x=>x.id===asgn.recipeId):null;
        const _hasNotes=_recipe&&_recipe.notes&&_recipe.notes.trim();
        const nameEl=_hasNotes
          ?`<div class="cell-meal-name cell-has-notes" onclick="event.stopPropagation();showCellNotes('${d}','${meal}')">${_esc(asgn.name||'')}</div>`
          :`<div class="cell-meal-name">${_esc(asgn.name||'')}</div>`;
        row+=`<div class="cell-filled ${cls}">
          <button class="cell-remove" onclick="event.stopPropagation();removeCell('${d}','${meal}')">✕</button>
          ${nameEl}
          <div class="cell-servings">${asgn.servings} serving${asgn.servings!==1?'s':''}</div>
          ${tag}
          <button class="cell-edit-btn" onclick="event.stopPropagation();openAssignModal('${d}','${meal}')" title="Edit meal">✎</button>
        </div>`;
      } else {
        row+=`<div class="plan-cell empty" onclick="openAssignModal('${d}','${meal}')"><span class="cell-empty-label">+ Add</span></div>`;
      }
      row+='</td>';
    });
    tr.innerHTML=row; tbody.appendChild(tr);
  });
  tbl.appendChild(tbody);

  // ── Mobile day-stack (hidden on desktop via CSS) ──
  // Same data, different layout: each day is a card with breakfast/lunch/dinner beneath it.
  const mob=document.getElementById('mealPlanMobile');
  if(mob){
    let mh='';
    DAYS.forEach(d=>{
      const n=weekNotes[d]||{};
      let coms='';
      if(n.am) coms+=`<div class="mpm-commitment"><span class="mpm-com-icon">🌅</span><span class="mpm-com-text">${n.am}</span></div>`;
      if(n.pm) coms+=`<div class="mpm-commitment"><span class="mpm-com-icon">🌙</span><span class="mpm-com-text">${n.pm}</span></div>`;
      mh+=`<div class="mpm-day-card">
        <div class="mpm-day-header">
          <div class="mpm-day-name">${DAY_FULL[d]}</div>
          ${coms?`<div class="mpm-commitments">${coms}</div>`:''}
        </div>
        <div class="mpm-meals">`;
      MEALS.forEach(meal=>{
        const asgn=mealPlan[d]&&mealPlan[d][meal];
        const rowColorBg={breakfast:'var(--yellow-light)',lunch:'var(--green-light)',dinner:'var(--accent-light)'}[meal];
        const rowColorAccent={breakfast:'var(--yellow)',lunch:'var(--green)',dinner:'var(--accent)'}[meal];
        mh+=`<div class="mpm-meal-row" style="background:${rowColorBg};border-left:3px solid ${rowColorAccent}">
          <div class="mpm-meal-label" style="color:${rowColorAccent}">${meal}</div>`;
        if(asgn){
          const cls=getCellClass(meal,asgn);
          const tag=getCellTag(meal,asgn);
          const _recipe=asgn.recipeId?recipes.find(x=>x.id===asgn.recipeId):null;
          const _hasNotes=_recipe&&_recipe.notes&&_recipe.notes.trim();
          const mNameEl=_hasNotes
            ?`<div class="mpm-meal-name cell-has-notes" onclick="event.stopPropagation();showCellNotes('${d}','${meal}')">${_esc(asgn.name||'')}</div>`
            :`<div class="mpm-meal-name">${_esc(asgn.name||'')}</div>`;
          mh+=`<div class="mpm-meal-cell ${cls}">
            <button class="cell-remove" onclick="event.stopPropagation();removeCell('${d}','${meal}')">✕</button>
            ${mNameEl}
            <div class="mpm-meal-servings">${asgn.servings} serving${asgn.servings!==1?'s':''}</div>
            ${tag}
            <button class="cell-edit-btn" onclick="event.stopPropagation();openAssignModal('${d}','${meal}')" title="Edit meal">✎</button>
          </div>`;
        } else {
          mh+=`<div class="mpm-meal-cell empty" onclick="openAssignModal('${d}','${meal}')"><span class="mpm-meal-empty-label">+ Add a meal</span></div>`;
        }
        mh+='</div>'; // /meal-row
      });
      mh+='</div></div>'; // /meals /day-card
    });
    mob.innerHTML=mh;
  }
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
    leftovers:'<span class="cell-tag tag-leftovers">Leftovers</span>',
    eatingout:'<span class="cell-tag tag-eatingout">Eating Out</span>',
    // legacy values — map gracefully
    easy:'<span class="cell-tag tag-goto">⚡ Go-To</span>',
    prep:'<span class="cell-tag tag-goto">⚡ Go-To</span>',
    quick:'<span class="cell-tag tag-goto">⚡ Go-To</span>',
    out:'<span class="cell-tag tag-eatingout">Eating Out</span>',
    lunchout:'<span class="cell-tag tag-eatingout">Eating Out</span>',
    takeout:'<span class="cell-tag tag-eatingout">Eating Out</span>',
    fun:'<span class="cell-tag tag-experimental">✨ Experimental</span>',
  };
  return map[t]||'';
}

// Show cooking instructions popover for a filled meal cell
function showCellNotes(day,meal){
  const asgn=mealPlan[day]&&mealPlan[day][meal];
  if(!asgn||!asgn.recipeId) return;
  const r=recipes.find(x=>x.id===asgn.recipeId);
  if(!r||!r.notes) return;
  // Remove any existing popover
  const prev=document.getElementById('cellNotesPopover');
  if(prev) prev.remove();
  const steps=r.notes.split('\n').filter(s=>s.trim());
  const popover=document.createElement('div');
  popover.id='cellNotesPopover';
  popover.className='cell-notes-popover';
  popover.innerHTML=`
    <div class="cell-notes-card">
      <div class="cell-notes-header">
        <div class="cell-notes-title">${_esc(r.name)}</div>
        <button class="cell-notes-close" onclick="document.getElementById('cellNotesPopover').remove()">✕</button>
      </div>
      <ol class="cell-notes-steps">${steps.map(s=>`<li>${_esc(s)}</li>`).join('')}</ol>
    </div>`;
  popover.addEventListener('click',e=>{ if(e.target===popover) popover.remove(); });
  document.getElementById('appRoot').appendChild(popover);
}
function removeCell(d,m){if(mealPlan[d])delete mealPlan[d][m];save(K.mealPlan,mealPlan);renderMealPlan();renderOnboardingUI();}

// ── Cooking View ──────────────────────────────────────────────
let _cookRecipe=null, _cookServings=1;
function openCookingView(recipeId,day,meal){
  const r=recipes.find(x=>x.id===recipeId);
  if(!r) return;
  _cookRecipe=r;
  document.getElementById('cookingModalTitle').textContent=r.name;
  // Default to assigned servings if available, else batch size
  const asgn=(day&&meal&&mealPlan[day])?mealPlan[day][meal]:null;
  _cookServings=(asgn&&asgn.servings)?asgn.servings:(r.servings||1);
  renderCookingBody();
  document.getElementById('cookingModal').classList.add('open');
}
function adjustCookServings(delta){
  _cookServings=Math.max(1,_cookServings+delta);
  renderCookingBody();
}
function renderCookingBody(){
  const r=_cookRecipe; if(!r) return;
  const batchSrv=r.servings||1;
  const scale=_cookServings/batchSrv;
  // Stepper
  const hint=scale===1
    ?'<span class="cook-stepper-hint">Recipe as written</span>'
    :'<span class="cook-stepper-hint">Cooking for more or fewer? Adjust to scale.</span>';
  const stepperHtml=`<div class="cook-stepper">
    <div class="cook-stepper-row">
      <span class="cook-stepper-label">Servings</span>
      <button class="cook-stepper-btn" onclick="adjustCookServings(-1)" ${_cookServings<=1?'disabled':''}>−</button>
      <span class="cook-stepper-val">${_cookServings}</span>
      <button class="cook-stepper-btn" onclick="adjustCookServings(1)">+</button>
    </div>
    ${hint}
  </div>`;
  // Group ingredients by category
  const grouped={};
  r.ingredients.forEach(ing=>{
    const cat=ing.category||'Pantry & Seasonings';
    if(!grouped[cat]) grouped[cat]=[];
    grouped[cat].push(ing);
  });
  let ingHtml='';
  CATS.forEach(cat=>{
    if(!grouped[cat]||grouped[cat].length===0) return;
    ingHtml+=`<div class="cook-ing-group">
      <div class="cook-ing-cat">${CAT_ICON[cat]||'📦'} ${cat}</div>
      ${grouped[cat].map(ing=>{
        const scaledQty=scaleQty(ing.qty,scale);
        return `<div class="cook-ing-row"><span class="cook-ing-qty">${_esc(scaledQty)}</span><span class="cook-ing-name">${_esc(ing.name||'')}</span></div>`;
      }).join('')}
    </div>`;
  });
  const steps=r.notes?r.notes.split('\n').filter(s=>s.trim()):[];
  const stepsHtml=steps.length>0?`<div class="cook-section-title">Steps</div><ol class="cook-steps">${steps.map(s=>`<li>${_esc(s)}</li>`).join('')}</ol>`:'';
  document.getElementById('cookingModalBody').innerHTML=`
    ${stepperHtml}
    ${r.ingredients.length>0?`<div class="cook-section-title">Ingredients</div>${ingHtml}`:''}
    ${stepsHtml}`;
}
function parseFrac(s){
  // Unicode fractions
  const uf={'½':0.5,'⅓':0.333,'⅔':0.667,'¼':0.25,'¾':0.75,'⅛':0.125,'⅜':0.375,'⅝':0.625,'⅞':0.875};
  // Try "1 ½" or just "½"
  const m=s.match(/^(\d+)?\s*([½⅓⅔¼¾⅛⅜⅝⅞])/);
  if(m) return (m[1]?parseInt(m[1]):0)+(uf[m[2]]||0);
  // Try "1/2" style
  const f=s.match(/^(\d+)\s*\/\s*(\d+)/);
  if(f) return parseInt(f[1])/parseInt(f[2]);
  // Try "1 1/2" style
  const mf=s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)/);
  if(mf) return parseInt(mf[1])+parseInt(mf[2])/parseInt(mf[3]);
  return parseFloat(s);
}
function scaleQty(qty,scale){
  if(!qty||scale===1) return qty||'';
  const n=parseFrac(qty);
  if(isNaN(n)) return qty;
  const unit=qty.replace(/^[\d.½¼¾⅓⅔⅛⅜⅝⅞\s\/]+/,'').trim();
  const scaled=n*scale;
  // Clean up: show whole numbers cleanly, round fractions to 1 decimal
  const display=scaled%1===0?String(scaled):scaled.toFixed(1).replace(/\.0$/,'');
  return display+(unit?' '+unit:'');
}

// Assign modal
let _aC={};
function openAssignModal(day,meal){
  _aC={day,meal,name:'',servings:2,mealType:null,recipeId:null,freezerId:null,freezerItem:false};
  const existing=mealPlan[day]&&mealPlan[day][meal];
  if(existing){ _aC={..._aC,...existing}; }
  document.getElementById('assignModalTitle').textContent=DAY_FULL[day]+' — '+meal.charAt(0).toUpperCase()+meal.slice(1);

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
  const catRecipes=isRecipeCat?recipes.filter(r=>r.onMenu&&r.type===_aC.mealType):[];
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
    html+=`<div style="font-size:13px;color:var(--text-3);padding:8px 0">No recipes yet — <a href="#" style="color:var(--accent);text-decoration:none;font-weight:600" onclick="closeModal('assignModal');switchTab('menu')">build your menu</a> or <a href="#" style="color:var(--accent);text-decoration:none;font-weight:600" onclick="closeModal('assignModal');switchTab('recipes')">browse recipes</a> first.</div>`;
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
  html+=`<div class="a-servings-block">
    <label class="a-servings-label" for="a_servings">How many servings?</label>
    <input type="number" id="a_servings" inputmode="numeric" min="1" max="50" value="${existing?existing.servings:2}">
    <div class="a-servings-hint">💡 Bump this up for bigger appetites, leftovers, or feeding the family — your <strong>grocery list quantities scale automatically</strong>.</div>
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
      const catRecipes=recipes.filter(r=>r.onMenu&&r.type===id);
      const picker=document.getElementById('recipePicker');
      if(picker){
        picker.innerHTML=catRecipes.length>0
          ?catRecipes.map(r=>`<div class="recipe-pick-opt${_aC.recipeId===r.id?' sel':''}" data-rid="${r.id}" onclick="pickRecipe('${r.id}','${r.name.replace(/'/g,"\\'")}',${r.servings})"><span class="rpo-name">${r.name}</span><span class="rpo-sub">${r.servings} srv</span></div>`).join('')
          :`<div style="font-size:13px;color:var(--text-3);padding:8px 0">No recipes yet — <a href="#" style="color:var(--accent);text-decoration:none;font-weight:600" onclick="closeModal('assignModal');switchTab('menu')">build your menu</a> or <a href="#" style="color:var(--accent);text-decoration:none;font-weight:600" onclick="closeModal('assignModal');switchTab('recipes')">browse recipes</a> first.</div>`;
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
  // If assigning a different recipe than what was there before, reset its grocery checks
  const prevRecipeId=mealPlan[day][meal]?.recipeId;
  if(_aC.recipeId && _aC.recipeId!==prevRecipeId){
    const r=recipes.find(x=>x.id===_aC.recipeId);
    if(r){
      r.ingredients.forEach(ing=>{
        const cat=ing.category||'Pantry & Seasonings';
        const k=ing.name.toLowerCase().trim();
        delete checks[cat+'|'+k];
      });
      save(K.checks,checks);
    }
  }
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
  renderOnboardingUI();
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
    if(total<=1)  return '≈ 1 small container (6 oz)';
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
  // MILK (cups — gallon context; skip hint for small amounts)
  if(/\bmilk\b/.test(n) && isCup){
    if(total<=2)  return null; // small amounts don't need a hint
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
  // PARMESAN / FETA / CRUMBLED CHEESE → container; SHREDDED CHEESE → bag
  if(/(parmesan|feta|cotija|crumble|grated)/.test(n) && isCup){
    if(total<=1)  return '≈ 1 small container';
    if(total<=2)  return '≈ 1 standard container';
    return '≈ '+Math.ceil(total/2)+' containers';
  }
  if(/(mozzarella|cheddar|cheese|shredded)/.test(n) && isCup){
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

// Whole-item ingredients — things you buy as whole units at the store
// When fractional, round up to nearest whole and return a practical qty + hint
const WHOLE_ITEMS=/\b(onion|avocado|bell pepper|pepper|banana|lemon|lime|apple|pear|orange|potato|sweet potato|tomato|cucumber|zucchini|squash|eggplant|head|bunch|carrot|celery|mango|peach|pineapple|coconut|grapefruit|melon|watermelon|cantaloupe|pomegranate|beet|turnip|parsnip|radish|shallot|jalape|tortilla|loaf|bread)\b/;
function isWholeItem(name, unit){
  // Only applies when there's no measurement unit (bare count)
  if(unit && unit.trim()) return false;
  return WHOLE_ITEMS.test(name.toLowerCase());
}

// Round up fractional whole-item quantities and return {qty, hint}
function resolveWholeItem(name, total, unit){
  if(!isWholeItem(name, unit) || total<=0) return null;
  if(total%1===0) return null; // already whole — no rounding needed
  const rounded=Math.ceil(total);
  return { qty: String(rounded), hint: 'rounded up from '+toFrac(total) };
}

// Master hint function — ingredient lookup first, then unit conversion fallback
function shoppingHint(ingredientName, total, unit){
  const specific=practicalHint(ingredientName, total, unit);
  if(specific) return specific;
  // Whole-item rounding hint (e.g. ⅓ onion → 1 onion)
  const wholeHint=resolveWholeItem(ingredientName, total, unit);
  if(wholeHint) return wholeHint.hint;
  // Generic unit conversions
  const u=(unit||'').toLowerCase().replace(/s$/,'').trim();
  if(['cup','c'].includes(u) && total>=4){
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
      // Remap any legacy categories that no longer exist (e.g. 'Freezer / Flex', 'Snacks / Extras') to Pantry & Seasonings
      const rawCat = ing.category || 'Pantry & Seasonings';
      const cat = CATS.includes(rawCat) ? rawCat : 'Pantry & Seasonings';
      if(!agg[cat]) agg[cat]={};
      const k=ing.name.toLowerCase().trim();
      if(!agg[cat][k]) agg[cat][k]={name:ing.name,qtys:[],rawQty:ing.qty};
      const n=parseFrac(ing.qty);
      // qty is total batch amount — scale by (assigned servings / batch size)
      agg[cat][k].qtys.push(isNaN(n)?null:n*(srv/(r.servings||1)));
    });
  }));

  // Meta — removed recipe count display

  container.innerHTML='';

  // Determine which categories have content (auto-generated OR user-added)
  const catsWithUserItems={};
  categoryItems.forEach(ci=>{ if(!catsWithUserItems[ci.category]) catsWithUserItems[ci.category]=[]; catsWithUserItems[ci.category].push(ci); });
  const hasAnyContent=Object.keys(agg).length>0||categoryItems.length>0;

  // Unified add-item bar (always visible at top)
  const addBar=document.createElement('div');
  addBar.className='grocery-add-bar';
  const mainOptions=CATS.map(c=>`<option value="${_esc(c)}">${CAT_ICON[c]||'📦'} ${_esc(c)}</option>`).join('');
  const extraOptions=`<option value="__staples__">📌 Weekly Staples</option><option value="__flex__">🛟 Flex & Backup</option><option value="__adhoc__">🛍️ Misc</option>`;
  const catOptions=mainOptions+extraOptions;
  addBar.innerHTML=`<input type="text" id="new-grocery-input" placeholder="+ Add item…" onkeydown="if(event.key==='Enter')addGroceryItemUnified()">
    <select id="new-grocery-cat" aria-label="Category">${catOptions}</select>
    <button class="btn btn-primary btn-sm" onclick="addGroceryItemUnified()">Add</button>`;
  container.appendChild(addBar);

  if(!hasAnyContent){
    const empty=document.createElement('div');
    empty.className='grocery-empty';
    empty.innerHTML=`<div class="empty-icon">🛒</div>
      <p>Assign recipes to your meal plan and your list will build itself — sorted by store section, quantities already calculated.</p>`;
    container.appendChild(empty);
  } else {
    CATS.forEach(cat=>{
      const items=agg[cat];
      const userItems=catsWithUserItems[cat]||[];
      if((!items||Object.keys(items).length===0)&&userItems.length===0) return;
      const sec=document.createElement('div');
      sec.className='grocery-category';
      const autoCount=items?Object.keys(items).length:0;
      const totalCount=autoCount+userItems.length;
      let rows='';
      if(items){
        Object.entries(items).forEach(([k,item])=>{
          const ck=cat+'|'+k;
          const done=checks[ck]||false;
          let qty='', hint='';
          const nums=item.qtys.filter(n=>n!==null);
          if(nums.length>0){
            const total=nums.reduce((a,b)=>a+b,0);
            const rawUnit=item.rawQty?item.rawQty.replace(/^[\d.½¼¾⅓⅔⅛⅜⅝⅞\s\/]+/,'').trim():'';
            const unit=rawUnit&&total!==1?pluralUnit(rawUnit,total):rawUnit;
            // Smart rounding for whole-item ingredients (e.g. ⅛ onion → 1)
            const wholeRound=resolveWholeItem(item.name, total, unit);
            qty=wholeRound?wholeRound.qty+(unit?' '+unit:''):toFrac(total)+(unit?' '+unit:'');
            hint=shoppingHint(item.name,total,unit);
          } else if(item.rawQty){ qty=item.rawQty; }
          rows+=`<label class="grocery-item${done?' done':''}">
            <input type="checkbox" ${done?'checked':''} onchange="toggleCheck('${cat}','${k}',this.checked)">
            <span class="grocery-item-name">${_esc(item.name)}</span>
            ${qty?`<span class="grocery-item-qty">${_esc(qty)}${hint?` <span class="hint">(${_esc(hint)})</span>`:''}</span>`:''}
          </label>`;
        });
      }
      // User-added category items
      userItems.forEach(ci=>{
        const ck='__catitem__|'+ci.id;
        const done=checks[ck]||false;
        rows+=`<label class="grocery-item${done?' done':''}">
          <input type="checkbox" ${done?'checked':''} onchange="toggleCheck('__catitem__','${ci.id}',this.checked)">
          <span class="grocery-item-name">${_esc(ci.name)}</span>
          <button class="item-remove" onclick="event.preventDefault();event.stopPropagation();removeCategoryItem('${ci.id}')">✕</button>
        </label>`;
      });
      sec.innerHTML=`<div class="category-header">
        <span class="category-icon">${CAT_ICON[cat]||'📦'}</span>
        <span class="category-name">${_esc(cat)}</span>
        <span class="category-count">${totalCount} item${totalCount!==1?'s':''}</span>
      </div>${rows}`;
      container.appendChild(sec);
    });
  }

  // Unified extra sections: Weekly Staples, Flex & Backup, Misc.
  // Same rounded-card format as the categories above.
  // Flex & Backup ALWAYS renders (even empty) so users learn to use it.
  // Staples and Misc hide when empty.
  const extras = [
    {type:'staples', icon:'📌', title:'Weekly Staples', tipKey:'groc_staples', items:staples,    removeFn:'removeStaple',     alwaysShow:false, emptyHint:''},
    {type:'flex',    icon:'🛟', title:'Flex & Backup',   tipKey:'groc_flex',    items:flexItems,  removeFn:'removeFlexItem',   alwaysShow:true,  emptyHint:'Add backup meals for nights when cooking falls apart — frozen pizza, canned soup, sandwich fixings. Your safety net.'},
    {type:'adhoc',   icon:'🛍️', title:'Misc',            tipKey:'groc_adhoc',   items:adhocItems, removeFn:'removeAdhocItem',  alwaysShow:false, emptyHint:''},
  ];
  extras.forEach(ex=>{
    const isEmpty = !ex.items || ex.items.length===0;
    if(isEmpty && !ex.alwaysShow) return;
    const sec=document.createElement('div');
    sec.className='grocery-category';
    let rows='';
    (ex.items||[]).forEach(item=>{
      const ck='__'+ex.type+'__|'+item.id;
      const done=checks[ck]||false;
      rows+=`<label class="grocery-item${done?' done':''}">
        <input type="checkbox" ${done?'checked':''} onchange="toggleCheck('__${ex.type}__','${item.id}',this.checked)">
        <span class="grocery-item-name">${_esc(item.name)}</span>
        <button class="item-remove" onclick="event.preventDefault();event.stopPropagation();${ex.removeFn}('${item.id}')">✕</button>
      </label>`;
    });
    if(isEmpty && ex.emptyHint){
      rows+=`<div class="grocery-empty-hint">${_esc(ex.emptyHint)}</div>`;
    }
    const count = (ex.items||[]).length;
    sec.innerHTML=`<div class="category-header">
      <span class="category-icon">${ex.icon}</span>
      <span class="category-name">${ex.title}</span>
      <span class="category-count">${count} item${count!==1?'s':''}</span>
      ${infoTipHtml(ex.tipKey)}
    </div>${rows}`;
    container.appendChild(sec);
  });
}

function toggleCheck(cat,k,done){
  const ck=cat+'|'+k; checks[ck]=done; save(K.checks,checks);
  renderGrocery();
}
function addGroceryItemUnified(){
  const el=document.getElementById('new-grocery-input');
  const sel=document.getElementById('new-grocery-cat');
  if(!el||!sel) return;
  const name=el.value.trim(); if(!name) return;
  const cat=sel.value;
  if(cat==='__adhoc__'){
    adhocItems.push({id:uid(),name});
    save(K.adhocItems,adhocItems);
  } else if(cat==='__staples__'){
    staples.push({id:uid(),name});
    save(K.staples,staples);
  } else if(cat==='__flex__'){
    flexItems.push({id:uid(),name});
    save(K.flexItems,flexItems);
  } else {
    categoryItems.push({id:uid(),name,category:cat});
    save(K.categoryItems,categoryItems);
  }
  el.value='';
  renderGrocery();
  setTimeout(()=>{
    const e=document.getElementById('new-grocery-input');
    const s=document.getElementById('new-grocery-cat');
    if(e) e.focus();
    // Preserve the last-used category so user can add several items to the same section quickly
    if(s) s.value=cat;
  },0);
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
function addCategoryItem(category,inputId){
  const el=document.getElementById(inputId); if(!el) return;
  const name=el.value.trim(); if(!name) return;
  categoryItems.push({id:uid(),name,category}); save(K.categoryItems,categoryItems); el.value=''; renderGrocery();
}
function removeCategoryItem(id){ categoryItems=categoryItems.filter(c=>c.id!==id); save(K.categoryItems,categoryItems); renderGrocery(); }

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
        <div class="freezer-name">${_esc(f.name||'')}${i===0?'<span class="fifo-badge">USE FIRST</span>':''}</div>
        <div class="freezer-meta">Made ${fmtDate(f.dateMade)} · ${f.servings} serving${f.servings!==1?'s':''}</div>
        ${f.notes?`<div class="freezer-note">${_esc(f.notes)}</div>`:''}
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
  mealPlan[day][meal]={state:'cook',name:f.name,servings:f.servings,mealType:'freezer',freezerItem:true,freezerId:f.id,recipeId:null,note:''};
  save(K.mealPlan,mealPlan);
  closeModal('fzPlanModal');
  switchTab('dashboard');
}
function removeFreezerItem(id){
  if(!confirm('Remove this meal from your freezer?')) return;
  freezer=freezer.filter(f=>f.id!==id);
  save(K.freezer,freezer);
  renderFreezer();
  // Mobile sync fix: don't trust the 400ms debounce — mobile browsers
  // aggressively cancel in-flight fetches if the tab backgrounds. Fire a
  // keepalive flush immediately, then also kick the normal sync path so
  // mpos_local_dirty_at clears on confirmed success.
  try {
    if (typeof _flushToCloud === 'function') _flushToCloud();
    if (_saveTimer) { clearTimeout(_saveTimer); _saveTimer = null; }
    if (typeof syncToSupabase === 'function') syncToSupabase();
  } catch(e) { /* best-effort; debounced sync is still queued as fallback */ }
}

// ╔═══════════════════════════════════════╗
//   UTILS
// ╚═══════════════════════════════════════╝
function closeModal(id){ document.getElementById(id).classList.remove('open'); }
function openModal(id){ const el = document.getElementById(id); if(el) el.classList.add('open'); }
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
_addContext='recipes'; renderLibrary();
_addContext='menu'; renderMealSections();

// ============================================================
// SUPABASE AUTH + SYNC  (Supabase JS SDK loaded in index.html)
// ============================================================
const SUPABASE_URL = 'https://vgtsxthotnnvknrqyhec.supabase.co';
const SUPABASE_KEY = 'sb_publishable_lq13XvUG9YsoiHrU8p36qg_EXE0vo8f';
const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let _currentUser     = null;
let _saveTimer       = null;
let _recoveryToken   = null; // access token saved from PASSWORD_RECOVERY event
let _accessToken     = null; // current session access token — used for keepalive sync on unload
let _cloudLoadedOk   = false; // DATA GUARD: only allow cloud writes after a successful cloud read
let _cloudUpdatedAt  = null;  // DATA GUARD: timestamp of last successful cloud load
let _applyingCloud   = false; // SYNC GUARD: suppresses write-back during cloud data application
let _syncDeferred    = false; // true when a save happened before cloud was ready
let _cloudRetryTimer = null;  // retry timer for failed cloud loads

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
    const pwField=$('authPassword'); if(pwField) pwField.setAttribute('autocomplete','new-password');
  } else if(state==='signin'){
    if(title) title.textContent='Welcome back';
    if(btn){ btn.textContent='Sign In'; btn.disabled=false; }
    show('authForgotWrap');
    if($('authToggleText')) $('authToggleText').textContent="Don't have an account?";
    if($('authToggleLink')) $('authToggleLink').textContent='Sign up';
    const pwField=$('authPassword'); if(pwField) pwField.setAttribute('autocomplete','current-password');
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
  // Migrate existing recipes: if onMenu field is missing, infer it from type
  // Old model: type=goto/experimental meant on menu, type=null meant saved only
  recipes = recipes.map(r => {
    if (r.onMenu === undefined) {
      changed = true;
      // If recipe had a type (goto/exp), it was on the menu in the old model
      const wasOnMenu = r.type === 'goto' || r.type === 'experimental';
      return {...r, onMenu: wasOnMenu};
    }
    return r;
  });
  if (changed) save(K.recipes, recipes);
}

function showApp(user, skipTabSwitch) {
  _currentUser = user;
  _flushDeferredSync(); // push any saves made before auth was ready
  document.getElementById('landingScreen').style.display = 'none';
  document.getElementById('authScreen').style.display    = 'none';
  document.getElementById('accessGate').style.display    = 'none';
  document.getElementById('appRoot').style.display       = 'block';
  const ue = document.getElementById('userEmail');
  if (ue) ue.textContent = user.email;
  if (skipTabSwitch) return; // loading overlay is visible — don't render stale data yet
  // Restore last active tab (map old IDs to new ones for returning users)
  let savedTab = localStorage.getItem('mpos_active_tab');
  const tabMigration = {step1:'recipes',step2:'menu',step3:'dashboard',step4:'dashboard',library:'recipes',weeksetup:'dashboard',mealplan:'dashboard'};
  if(savedTab && tabMigration[savedTab]) savedTab=tabMigration[savedTab];
  const validTabs = ['dashboard','recipes','menu','grocerylist','freezer'];
  // Returning users with an onboarded account land on the Dashboard;
  // brand-new users still start at Recipes so the guided onboarding flow is preserved.
  const defaultTab = isOnboardingComplete() ? 'dashboard' : 'recipes';
  switchTab(savedTab && validTabs.includes(savedTab) ? savedTab : defaultTab);
}
function hideLoadingOverlay() {
  const ol = document.getElementById('appLoadingOverlay');
  if (ol) ol.style.display = 'none';
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
  const email = document.getElementById('authEmail').value.trim().toLowerCase();
  const btn   = document.getElementById('authBtn');
  const msg   = document.getElementById('authMsg');
  if(!email){
    msg.textContent='Please enter your email address.';
    msg.className='auth-msg error'; return;
  }
  btn.disabled=true; btn.textContent='Sending…';
  try {
    const { error } = await _sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname
    });
    btn.disabled=false; btn.textContent='Send Reset Link';
    if(error){
      console.error('Password reset error:', error);
      msg.textContent=error.message||'Could not send reset email. Please try again.';
      msg.className='auth-msg error';
    } else {
      msg.innerHTML='✓ Reset link sent! Check your inbox and spam folder.<br><span style="font-size:11px;color:var(--text-3);margin-top:4px;display:inline-block">If you don\'t see it within 2 minutes, check your spam/junk folder or try again.</span>';
      msg.className='auth-msg success';
    }
  } catch(e) {
    console.error('Password reset exception:', e);
    btn.disabled=false; btn.textContent='Send Reset Link';
    msg.textContent='Something went wrong. Please try again.';
    msg.className='auth-msg error';
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
  _stopPeriodicSync();
  try { await _sb.auth.signOut(); } catch(e) { /* proceed even if this fails */ }
  // Clear cached data so next login starts fresh from cloud
  Object.values(K).forEach(k => localStorage.removeItem(k));
  localStorage.removeItem('mpos_weekstart');
  localStorage.removeItem('mpos_active_tab');
  _currentUser = null;
  _cloudLoadedOk = false;
  _syncDeferred = false;
  _syncRetries = 0;
  localStorage.removeItem('mpos_local_dirty_at');
  // Force full navigation — more reliable than reload() in iOS standalone/PWA mode
  window.location.href = window.location.origin + window.location.pathname;
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
    .from('user_data').select('*').eq('user_id', userId).maybeSingle();
  if (error) { console.error('Cloud load failed:', error.message); return { _loadFailed: true }; }
  // Successful query (even if no row exists) — safe to allow writes
  _cloudLoadedOk = true;
  if (data && data.updated_at) _cloudUpdatedAt = data.updated_at;
  // Flush any saves that were queued while cloud was unavailable
  _flushDeferredSync();
  return data || null;
}

function scheduleSyncToSupabase() {
  if (_applyingCloud) return;
  // If user/cloud isn't ready yet, mark deferred — will flush when ready
  if (!_currentUser || !_cloudLoadedOk) { _syncDeferred = true; return; }
  clearTimeout(_saveTimer);
  _updateSyncIndicator('saving');
  _saveTimer = setTimeout(syncToSupabase, 400);
}

// ── Sync status indicator ────────────────────────────────────
// Green = synced, orange = saving, red = error
function _updateSyncIndicator(state) {
  const el = document.getElementById('syncIndicator');
  if (!el) return;
  const colors = { synced: '#4caf50', saving: '#ff9800', error: '#f44336' };
  const titles = { synced: 'All changes saved', saving: 'Saving…', error: 'Sync issue — retrying' };
  el.style.background = colors[state] || colors.synced;
  el.title = titles[state] || '';
}

// Called once cloud is ready — pushes any saves that happened before auth/cloud load completed
function _flushDeferredSync() {
  if (_syncDeferred && _currentUser && _cloudLoadedOk) {
    _syncDeferred = false;
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(syncToSupabase, 200);
  }
}

let _syncRetries = 0;
async function syncToSupabase() {
  if (!_currentUser) return;
  // DATA GUARD: never write to cloud unless we successfully loaded first
  if (!_cloudLoadedOk) { console.warn('Cloud sync blocked — cloud data not loaded yet'); return; }
  const payload = buildSyncPayload();
  const { error: syncErr } = await _sb.from('user_data').upsert(payload, { onConflict: 'user_id' });
  if (syncErr) {
    console.error('Cloud sync failed:', syncErr.message);
    _updateSyncIndicator('error');
    // Auto-retry up to 3 times with backoff — don't silently lose data
    if (_syncRetries < 3) {
      _syncRetries++;
      clearTimeout(_saveTimer);
      _saveTimer = setTimeout(syncToSupabase, 2000 * _syncRetries);
    }
  } else {
    _syncRetries = 0;
    // Only update the cloud timestamp AFTER a confirmed successful upsert.
    // This ensures _pullFromCloud won't skip a pull if the previous sync failed.
    _cloudUpdatedAt = payload.updated_at;
    try { localStorage.removeItem('mpos_local_dirty_at'); } catch(e) {}
    _updateSyncIndicator('synced');
  }
}

async function migrateIfNeeded(userId) {
  const cloud = await loadFromSupabase(userId);
  if (cloud && !cloud._loadFailed) return cloud;
  if (cloud && cloud._loadFailed) return null; // don't migrate on failed load
  const localRecipes = localStorage.getItem('mpos_recipes_v2');
  if (!localRecipes) return null;
  await syncToSupabase();
  return null;
}

function applyCloudData(data) {
  if (!data || data._loadFailed) return;

  // ── Race-condition guard ──────────────────────────────────
  // If local data was modified AFTER the cloud's updated_at, the keepalive
  // flush on unload hasn't reached Supabase yet.  Preserve the newer local
  // state and push it to the cloud instead of overwriting it.
  try {
    const localDirty = localStorage.getItem('mpos_local_dirty_at');
    if (localDirty && data.updated_at) {
      const localTs = new Date(localDirty).getTime();
      const cloudTs = new Date(data.updated_at).getTime();
      if (localTs > cloudTs) {
        console.info('Local data is newer than cloud — skipping cloud overwrite, will push local → cloud');
        // Do NOT clear mpos_local_dirty_at here — only syncToSupabase clears it
        // on confirmed success. This keeps the protection active if re-sync also fails.
        scheduleSyncToSupabase();
        return;
      }
    }
  } catch(e) { /* proceed with normal apply on any parse error */ }

  _applyingCloud = true; // suppress cloud write-back while applying pulled data
  try {
    if (Array.isArray(data.recipes))              { recipes   = data.recipes;    save(K.recipes,   recipes); }
    if (data.assignments !== null &&
        typeof data.assignments === 'object')     { mealPlan  = data.assignments; save(K.mealPlan,  mealPlan); }
    if (data.week_notes !== undefined)            { weekNotes = data.week_notes;  save(K.weekNotes, weekNotes); }
    if (Array.isArray(data.freezer))              { freezer   = data.freezer;     save(K.freezer,   freezer); }
    if (data.groceries) {
      if (data.groceries.staples)    { staples     = data.groceries.staples;     save(K.staples,     staples); }
      if (data.groceries.flexItems)  { flexItems   = data.groceries.flexItems;   save(K.flexItems,   flexItems); }
      if (data.groceries.checks)     { checks      = data.groceries.checks;      save(K.checks,      checks); }
      if (data.groceries.adhocItems) { adhocItems  = data.groceries.adhocItems;  save(K.adhocItems,  adhocItems); }
      if (data.groceries.categoryItems) { categoryItems = data.groceries.categoryItems; save(K.categoryItems, categoryItems); }
    }
    if (data.onboarding && typeof data.onboarding === 'object') {
      onboardingState = data.onboarding;
    }
    _migrateOnboardingState();
    // Mirror cloud onboarding state to localStorage so offline reloads don't lose it.
    save(K.onboarding, onboardingState);
    // Re-run slot-schema migration after cloud pull: legacy cloud data
    // (plan entries without a .state field) must be stamped as 'cook' so
    // they render on the dashboard instead of collapsing to "N/A".
    try { migrateSlotSchema(); } catch(e) {}
  } finally {
    _applyingCloud = false;
    // Clear the dirty flag that save() set during cloud application.
    // This data came FROM the cloud — it doesn't need to be synced back.
    try { localStorage.removeItem('mpos_local_dirty_at'); } catch(e) {}
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
  _addContext='recipes';
  renderLibrary();
  _addContext='menu';
  renderMealSections();
  renderWeek(); renderMealPlan();
  renderGrocery(); renderFreezer();
  if(document.getElementById('dashboard')) renderDashboard();
  renderOnboardingUI();
  // Inject info tooltips into section headers
  Object.keys(INFO_TIPS).forEach(key=>{
    const el=document.getElementById('infoTip-'+key);
    if(el && !el.hasChildNodes()) el.innerHTML=infoTipHtml(key);
  });
}

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
  _accessToken = session.access_token || null; // store for keepalive sync on unload
  const params = new URLSearchParams(window.location.search);

  // Clean up URL immediately so refreshing doesn't re-trigger polling
  if (params.get('payment') === 'success') {
    window.history.replaceState({}, '', window.location.pathname);
    // Webhook may not have fired yet — poll up to 6s
    let tries = 0;
    while (tries < 6) {
      const access = await checkAndClaimAccess(user.id);
      if (access) { showApp(user, true); await loadAndRender(user.id); return; }
      await new Promise(r => setTimeout(r, 1000));
      tries++;
    }
    // Webhook took too long — show access gate; user can refresh to retry
    showAccessGate(user);
    return;
  }

  const access = await checkAndClaimAccess(user.id);
  if (!access) { showAccessGate(user); return; }

  showApp(user, true);  // show appRoot with loading overlay, skip rendering stale data
  await loadAndRender(user.id);
}

async function loadAndRender(userId) {
  await migrateIfNeeded(userId);
  const cloud = await loadFromSupabase(userId);
  applyCloudData(cloud);
  normalizeRecipeTypes();
  // Defensive: new user with no recipes yet — seed starters and sync
  // ONLY do this if cloud was successfully queried (not on failed load)
  if (recipes.length === 0 && _cloudLoadedOk) {
    recipes = STARTER_RECIPES.map(r=>({...r,ingredients:r.ingredients.map(i=>({...i}))}));
    save(K.recipes, recipes);
  }
  // Ensure onboarding state matches the current guide version; users on an
  // older version get reset so they see the new walkthrough exactly once.
  _migrateOnboardingState();

  // ── Cloud load failure recovery ────────────────────────────
  // If the initial cloud load failed (network hiccup), schedule retries so
  // _cloudLoadedOk can eventually become true and unblock syncing.
  if (!_cloudLoadedOk && !_cloudRetryTimer) {
    let _retryCount = 0;
    const maxRetries = 5;
    _cloudRetryTimer = setInterval(async () => {
      _retryCount++;
      console.info('Retrying cloud load (attempt ' + _retryCount + '/' + maxRetries + ')...');
      const retryCloud = await loadFromSupabase(userId);
      if (_cloudLoadedOk) {
        // Success — apply cloud data and stop retrying
        clearInterval(_cloudRetryTimer);
        _cloudRetryTimer = null;
        applyCloudData(retryCloud);
        renderAll();
        _updateSyncIndicator('synced');
        console.info('Cloud load retry succeeded');
      } else if (_retryCount >= maxRetries) {
        clearInterval(_cloudRetryTimer);
        _cloudRetryTimer = null;
        // Last resort: allow writes even without a cloud read so data isn't permanently orphaned
        _cloudLoadedOk = true;
        _flushDeferredSync();
        _updateSyncIndicator('error');
        console.warn('Cloud load retries exhausted — enabling writes to prevent data loss');
      }
    }, 5000); // retry every 5 seconds
  }

  // Cloud data is ready — hide loading overlay, start background sync, render
  hideLoadingOverlay();
  _startPeriodicSync();
  let savedTab = localStorage.getItem('mpos_active_tab');
  const tabMigration = {step1:'recipes',step2:'menu',step3:'dashboard',step4:'dashboard',library:'recipes',weeksetup:'dashboard',mealplan:'dashboard'};
  if(savedTab && tabMigration[savedTab]) savedTab=tabMigration[savedTab];
  const validTabs = ['dashboard','recipes','menu','grocerylist','freezer'];
  // V4: Everyone starts on Dashboard (quick-start fires from there for new users)
  const defaultTab = 'dashboard';
  switchTab(savedTab && validTabs.includes(savedTab) ? savedTab : defaultTab);
  renderAll();

  // V4 Quick Start: trigger for new users who haven't completed onboarding
  // and have no existing meal plan data (guard against re-triggering)
  const hasExistingPlan = DAYS.some(d => MEALS.some(m => mealPlan[d] && mealPlan[d][m]));
  if(!isOnboardingComplete() && !hasExistingPlan){
    // Skip What's New for brand-new users — quick start is their intro
    openQuickStartModal();
  } else {
    checkWhatsNew(cloud);
  }
}

// ── What's New modal ─────────────────────────────────────────
function checkWhatsNew(cloud) {
  const seen = cloud && cloud.last_seen_update_version;
  if (seen === CURRENT_UPDATE_VERSION) return;
  const modal = document.getElementById('whatsNewModal');
  if (modal) modal.classList.add('open');
}
async function dismissWhatsNew() {
  const modal = document.getElementById('whatsNewModal');
  if (modal) modal.classList.remove('open');
  if (!_currentUser) return;
  try {
    await _sb.from('user_data').update({ last_seen_update_version: CURRENT_UPDATE_VERSION }).eq('user_id', _currentUser.id);
  } catch(e) { /* best-effort — next login will retry */ }
}

// ── Previous Updates toggle ──────────────────────────────────
function togglePrevUpdates() {
  const body = document.getElementById('prevUpdatesBody');
  const arrow = document.getElementById('prevUpdatesArrow');
  if (!body) return;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  if (arrow) arrow.style.transform = open ? '' : 'rotate(90deg)';
}

// ── Account Settings ─────────────────────────────────────────
function openAccountSettings() {
  document.getElementById('acctNewEmail').value = '';
  document.getElementById('acctNewPass').value = '';
  document.getElementById('acctConfirmPass').value = '';
  const msg = document.getElementById('acctMsg');
  msg.textContent = '';
  msg.className = 'acct-msg';
  document.getElementById('accountSettingsModal').classList.add('open');
}
async function updateEmail() {
  const msg = document.getElementById('acctMsg');
  const newEmail = document.getElementById('acctNewEmail').value.trim();
  if (!newEmail) { msg.textContent = 'Please enter a new email address.'; msg.className = 'acct-msg acct-error'; return; }
  msg.textContent = 'Updating…'; msg.className = 'acct-msg';
  try {
    const { error } = await _sb.auth.updateUser({ email: newEmail });
    if (error) { msg.textContent = error.message; msg.className = 'acct-msg acct-error'; return; }
    msg.textContent = 'Confirmation email sent! Check both your old and new inboxes.';
    msg.className = 'acct-msg acct-success';
    document.getElementById('acctNewEmail').value = '';
  } catch(e) { msg.textContent = 'Something went wrong. Try again.'; msg.className = 'acct-msg acct-error'; }
}
async function updatePassword() {
  const msg = document.getElementById('acctMsg');
  const pass = document.getElementById('acctNewPass').value;
  const confirm = document.getElementById('acctConfirmPass').value;
  if (!pass || pass.length < 6) { msg.textContent = 'Password must be at least 6 characters.'; msg.className = 'acct-msg acct-error'; return; }
  if (pass !== confirm) { msg.textContent = 'Passwords do not match.'; msg.className = 'acct-msg acct-error'; return; }
  msg.textContent = 'Updating…'; msg.className = 'acct-msg';
  try {
    const { error } = await _sb.auth.updateUser({ password: pass });
    if (error) { msg.textContent = error.message; msg.className = 'acct-msg acct-error'; return; }
    msg.textContent = 'Password updated successfully!';
    msg.className = 'acct-msg acct-success';
    document.getElementById('acctNewPass').value = '';
    document.getElementById('acctConfirmPass').value = '';
  } catch(e) { msg.textContent = 'Something went wrong. Try again.'; msg.className = 'acct-msg acct-error'; }
}

// ── Flush pending cloud save on tab close ────────────────────
// Uses fetch with keepalive:true so the request survives page unload.
// 'pagehide' is reliable on mobile Safari; 'beforeunload' covers desktop.
function _flushToCloud() {
  clearTimeout(_saveTimer);
  _saveTimer = null;
  if (!_currentUser || !_accessToken || !_cloudLoadedOk) return;
  try {
    const payload = JSON.stringify(buildSyncPayload());
    // Note: we intentionally do NOT clear mpos_local_dirty_at here.
    // The keepalive fetch is fire-and-forget — we can't know if it succeeds.
    // If it does succeed, the next loadFromSupabase will return data with a
    // newer updated_at than our local dirty timestamp, so applyCloudData
    // will proceed normally.  If it fails, the dirty flag ensures we preserve
    // the local data on reload instead of overwriting it with stale cloud data.
    fetch(`${SUPABASE_URL}/rest/v1/user_data`, {
      method:    'POST',
      keepalive: true,
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${_accessToken}`,
        'Prefer':        'resolution=merge-duplicates,return=minimal'
      },
      body: payload
    });
  } catch(e) { /* best-effort — regular debounced sync handles normal saves */ }
}
window.addEventListener('beforeunload', _flushToCloud);
window.addEventListener('pagehide',     _flushToCloud);

// ── Sync on visibility change ────────────────────────────────
// When tab goes hidden (mobile: screen lock, app switch): flush pending save NOW.
// When tab becomes visible again: pull fresh data from cloud (for cross-device sync).
document.addEventListener('visibilitychange', async () => {
  if (!_currentUser) return;
  if (document.visibilityState === 'hidden') {
    // Tab is being hidden — flush any pending debounced save immediately
    if (_saveTimer) {
      clearTimeout(_saveTimer);
      _saveTimer = null;
      await syncToSupabase();
    }
  } else if (document.visibilityState === 'visible') {
    _pullFromCloud();
  }
});

// ── Periodic cloud pull — catches cross-device edits even if tab stays in foreground ──
let _pullTimer = null;
async function _pullFromCloud() {
  if (!_currentUser || _applyingCloud) return;
  // Don't pull if there are pending local saves — let them sync first
  if (_saveTimer) return;
  const localDirty = localStorage.getItem('mpos_local_dirty_at');
  if (localDirty) return; // local changes haven't been confirmed in cloud yet
  const cloud = await loadFromSupabase(_currentUser.id);
  if (!cloud || !cloud.updated_at) return;
  // Only re-render if cloud data is actually newer than what we last loaded
  // Use Date comparison — Supabase and JS may use different ISO 8601 formats
  // (e.g. "Z" vs "+00:00") which would cause string === to always fail
  if (_cloudUpdatedAt &&
      new Date(cloud.updated_at).getTime() === new Date(_cloudUpdatedAt).getTime()) return;
  applyCloudData(cloud);
  renderAll();
}
function _startPeriodicSync() {
  if (_pullTimer) clearInterval(_pullTimer);
  _pullTimer = setInterval(_pullFromCloud, 30000); // every 30 seconds
}
function _stopPeriodicSync() {
  if (_pullTimer) { clearInterval(_pullTimer); _pullTimer = null; }
}

// ── Start ────────────────────────────────────────────────────
initAuth();
