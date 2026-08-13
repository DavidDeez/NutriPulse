// State Management
const STATE = {
    userProfile: JSON.parse(localStorage.getItem('nutripulse_user_profile')) || null,
    meals: JSON.parse(localStorage.getItem('nutripulse_meals')) || [],
    water: parseInt(localStorage.getItem('nutripulse_water')) || 0,
    apiKey: localStorage.getItem('nutripulse_apikey') || '',
    selectedModel: localStorage.getItem('nutripulse_model') || 'accounts/fireworks/models/deepseek-v4-pro',
    targets: JSON.parse(localStorage.getItem('nutripulse_targets')) || {
        calories: 2000,
        protein: 130,
        carbs: 220,
        fat: 65
    },
    weeklyHistory: JSON.parse(localStorage.getItem('nutripulse_weekly_history')) || null,
    chatHistory: JSON.parse(localStorage.getItem('nutripulse_chat')) || [
        { role: 'assistant', content: "Hi! I'm your NutriPulse Coach. I can help analyze meals, adjust recipes, suggest healthy alternatives, or plan your goals. Ask me anything!" }
    ],
    searchFilter: ''
};

// Force upgrade broken cached models to DeepSeek v4
if (STATE.selectedModel.includes('llama') || STATE.selectedModel.includes('qwen2p5')) {
    STATE.selectedModel = 'accounts/fireworks/models/deepseek-v4-pro';
    localStorage.setItem('nutripulse_model', STATE.selectedModel);
}

// Mock Database for offline mode/fallbacks
const MOCK_MEALS_DATABASE = [
    { keywords: ['egg', 'scrambled', 'omelet', 'breakfast'], name: 'Scrambled Eggs with Toast', calories: 340, protein: 18, carbs: 22, fat: 16, tags: ['High-Protein', 'Quick'] },
    { keywords: ['salad', 'chicken', 'caesar'], name: 'Grilled Chicken Caesar Salad', calories: 420, protein: 32, carbs: 12, fat: 26, tags: ['Low-Carb', 'High-Protein'] },
    { keywords: ['salmon', 'fish', 'rice', 'broccoli'], name: 'Baked Salmon with Quinoa & Broccoli', calories: 580, protein: 42, carbs: 45, fat: 22, tags: ['Heart-Healthy', 'Omega-3'] },
    { keywords: ['shake', 'protein', 'smoothie', 'banana'], name: 'Whey Protein Banana Smoothie', calories: 290, protein: 26, carbs: 35, fat: 3, tags: ['High-Protein', 'Post-Workout'] },
    { keywords: ['avocado', 'toast'], name: 'Avocado Sourdough Toast', calories: 310, protein: 8, carbs: 15, fat: 15, tags: ['Vegan', 'Healthy Fats'] },
    { keywords: ['oatmeal', 'oats', 'berry', 'berries'], name: 'Mixed Berry Oatmeal with Almonds', calories: 320, protein: 10, carbs: 52, fat: 9, tags: ['High-Fiber', 'Vegan'] },
    { keywords: ['pasta', 'spaghetti', 'tomato'], name: 'Whole Wheat Pasta Marinara', calories: 450, protein: 14, carbs: 78, fat: 8, tags: ['High-Carb', 'Vegetarian'] },
    { keywords: ['burger', 'beef'], name: 'Classic Beef Burger with Sweet Potato Fries', calories: 750, protein: 38, carbs: 68, fat: 32, tags: ['Bulking'] }
];

const MOCK_COACH_RESPONSES = [
    "To hit your protein goals efficiently, consider adding egg whites, tofu, or lean poultry to your meals today.",
    "Staying hydrated is essential for athletic recovery. Try drinking 500ml before your next meal.",
    "Consistent logs are key. Try keeping track of condiment portions like oil and dressing as well.",
    "If you're training later, complex carbs like sweet potato or oatmeal will keep your energy levels steady.",
    "Make sure to load up on leafy greens. They add bulk and micronutrients without overflowing your daily budget."
];

// DOM Elements
const elements = {
    authWrapper: document.getElementById('auth-wrapper'),
    appContainer: document.getElementById('app-container'),
    signupForm: document.getElementById('signup-form'),
    signupName: document.getElementById('signup-name'),
    signupAge: document.getElementById('signup-age'),
    signupWeight: document.getElementById('signup-weight'),
    signupHeight: document.getElementById('signup-height'),
    signupGoal: document.getElementById('signup-goal'),
    logoutBtn: document.getElementById('logout-btn'),

    sideUserName: document.getElementById('side-user-name'),
    sideUserGoal: document.getElementById('side-user-goal'),
    sideUserBmi: document.getElementById('side-user-bmi'),
    sideUserWeight: document.getElementById('side-user-weight'),

    calorieRingVal: document.getElementById('calorie-ring-val'),
    currentCalories: document.getElementById('current-calories'),
    targetCalories: document.getElementById('target-calories'),
    caloriePercentage: document.getElementById('calorie-percentage'),
    
    legProtein: document.getElementById('leg-protein'),
    legCarbs: document.getElementById('leg-carbs'),
    legFat: document.getElementById('leg-fat'),
    
    waterText: document.getElementById('water-text'),
    waterFluid: document.getElementById('water-fluid'),
    addWater250: document.getElementById('add-water-250'),
    addWater500: document.getElementById('add-water-500'),
    resetWater: document.getElementById('reset-water'),
    
    tabText: document.getElementById('tab-text'),
    tabImage: document.getElementById('tab-image'),
    panelText: document.getElementById('panel-text'),
    panelImage: document.getElementById('panel-image'),
    mealDescInput: document.getElementById('meal-description-input'),
    dropzone: document.getElementById('dropzone'),
    fileInput: document.getElementById('file-input'),
    imagePreviewBox: document.getElementById('image-preview-box'),
    imagePreview: document.getElementById('image-preview'),
    removePreview: document.getElementById('remove-preview'),
    analyzeBtn: document.getElementById('analyze-meal-btn'),
    scannerOverlay: document.getElementById('scanner-overlay'),
    
    mealLogsTbody: document.getElementById('meal-logs-tbody'),
    logsEmptyState: document.getElementById('logs-empty-state'),
    clearAllMeals: document.getElementById('clear-all-meals'),
    logSearchInput: document.getElementById('log-search-input'),
    exportReportBtn: document.getElementById('export-report-btn'),
    
    chatMessagesContainer: document.getElementById('chat-messages-container'),
    chatUserInput: document.getElementById('chat-user-input'),
    chatSendBtn: document.getElementById('chat-send-btn'),
    clearChat: document.getElementById('clear-chat'),
    suggestionsBox: document.getElementById('suggestions-box'),
    
    openSettingsBtn: document.getElementById('open-settings-btn'),
    openSettingsNav: document.getElementById('open-settings-nav'),
    closeSettingsModal: document.getElementById('close-settings-modal'),
    settingsModal: document.getElementById('settings-modal'),
    apiKeyInput: document.getElementById('api-key-input'),
    modelSelect: document.getElementById('model-select'),
    profileCalories: document.getElementById('profile-calories'),
    profileProtein: document.getElementById('profile-protein'),
    profileCarbs: document.getElementById('profile-carbs'),
    profileFat: document.getElementById('profile-fat'),
    saveApiSettings: document.getElementById('save-api-settings'),
    resetApiSettings: document.getElementById('reset-api-settings'),
    apiStatusBadge: document.getElementById('api-status-badge')
};

// Initial setup on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

// App Initialization
function initApp() {
    if (STATE.userProfile) {
        // Pre-populate mock weekly history if none exists
        initWeeklyHistory();
        showDashboardView();
    } else {
        showAuthView();
    }
}

function initWeeklyHistory() {
    if (!STATE.weeklyHistory) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const todayIdx = new Date().getDay(); // 0 is Sun, 1 is Mon, etc.
        
        // Reorder days so today is the last element
        const orderedDays = [];
        for (let i = todayIdx + 1; i < todayIdx + 8; i++) {
            orderedDays.push(days[i % 7]);
        }
        
        // Simulated values centered around target
        const target = STATE.targets.calories;
        STATE.weeklyHistory = orderedDays.map((day, idx) => {
            if (idx === 6) {
                // Today will be calculated dynamically from logged meals
                return { day: day, calories: 0, isToday: true };
            }
            const offset = (Math.random() - 0.5) * 400; // variance
            return { day: day, calories: Math.round(target + offset), isToday: false };
        });
        localStorage.setItem('nutripulse_weekly_history', JSON.stringify(STATE.weeklyHistory));
    }
}

function showAuthView() {
    elements.authWrapper.style.display = 'flex';
    elements.appContainer.style.display = 'none';
}

function showDashboardView() {
    elements.authWrapper.style.display = 'none';
    elements.appContainer.style.display = 'flex';

    // Populate Sidebar profile data
    elements.sideUserName.textContent = STATE.userProfile.name;
    elements.sideUserGoal.textContent = `Goal: ${STATE.userProfile.goal === 'lose' ? 'Weight Loss' : STATE.userProfile.goal === 'gain' ? 'Build Muscle' : 'Maintain'}`;
    elements.sideUserWeight.textContent = `${STATE.userProfile.weight} kg`;
    
    // BMI Math
    const heightM = STATE.userProfile.height / 100;
    const bmi = STATE.userProfile.weight / (heightM * heightM);
    elements.sideUserBmi.textContent = bmi.toFixed(1);

    // Load configs
    elements.apiKeyInput.value = STATE.apiKey;
    elements.modelSelect.value = STATE.selectedModel;
    elements.profileCalories.value = STATE.targets.calories;
    elements.profileProtein.value = STATE.targets.protein;
    elements.profileCarbs.value = STATE.targets.carbs;
    elements.profileFat.value = STATE.targets.fat;
    
    updateAPIStatusUI();
    renderDashboard();
    renderMealLogs();
    renderChatMessages();
}

// Calculate targets based on BMR (Harris-Benedict formula)
function calculateOptimalTargets(profile) {
    const bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
    let targetCals = Math.round(bmr * 1.35); // Sedentary/light multiplier

    if (profile.goal === 'lose') {
        targetCals = Math.round(targetCals - 450);
    } else if (profile.goal === 'gain') {
        targetCals = Math.round(targetCals + 350);
    }
    
    targetCals = Math.max(1200, targetCals); // Safety minimum

    // Macro distributions
    let protein = 1.8 * profile.weight;
    if (profile.goal === 'gain') protein = 2.2 * profile.weight;
    
    const fat = (targetCals * 0.25) / 9;
    const carbs = (targetCals - (protein * 4) - (fat * 9)) / 4;

    return {
        calories: Math.round(targetCals),
        protein: Math.round(protein),
        carbs: Math.max(50, Math.round(carbs)),
        fat: Math.round(fat)
    };
}

// Update API Connected/Disconnected indicator badge
function updateAPIStatusUI() {
    if (STATE.apiKey) {
        elements.apiStatusBadge.classList.remove('inactive');
        elements.apiStatusBadge.classList.add('active');
        elements.apiStatusBadge.querySelector('.status-text').textContent = 'Fireworks Connected';
    } else {
        elements.apiStatusBadge.classList.remove('active');
        elements.apiStatusBadge.classList.add('inactive');
        elements.apiStatusBadge.querySelector('.status-text').textContent = 'Fireworks Offline';
    }
}

// Render Dashboard values and circular SVG progress ring
function renderDashboard() {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    STATE.meals.forEach(meal => {
        totalCalories += meal.calories;
        totalProtein += meal.protein;
        totalCarbs += meal.carbs;
        totalFat += meal.fat;
    });
    
    elements.currentCalories.textContent = Math.round(totalCalories);
    elements.targetCalories.textContent = STATE.targets.calories;
    
    // Macro labels
    elements.legProtein.textContent = `${Math.round(totalProtein)}g / ${STATE.targets.protein}g`;
    elements.legCarbs.textContent = `${Math.round(totalCarbs)}g / ${STATE.targets.carbs}g`;
    elements.legFat.textContent = `${Math.round(totalFat)}g / ${STATE.targets.fat}g`;
    
    // Percentage & Calorie Ring calculation (R=72, circumference = 2 * PI * R = ~452.3)
    const caloriePct = Math.min(Math.round((totalCalories / STATE.targets.calories) * 100), 999);
    elements.caloriePercentage.textContent = `${caloriePct}%`;
    
    const ringOffset = 452 - (452 * Math.min(caloriePct, 100)) / 100;
    elements.calorieRingVal.style.strokeDashoffset = ringOffset;
    
    if (caloriePct > 100) {
        elements.calorieRingVal.style.stroke = '#ffffff';
        elements.calorieRingVal.style.strokeDasharray = '5, 5';
    } else {
        elements.calorieRingVal.style.stroke = 'var(--primary)';
        elements.calorieRingVal.style.strokeDasharray = 'none';
    }
    
    // Render dynamic macro Canvas breakdown pie chart
    drawMacroChart(totalProtein, totalCarbs, totalFat);

    // Update today's entry in weekly trends history
    if (STATE.weeklyHistory) {
        const todayEntry = STATE.weeklyHistory.find(d => d.isToday);
        if (todayEntry) {
            todayEntry.calories = totalCalories;
        }
        drawTrendChart();
    }

    // Water level updates
    elements.waterText.textContent = `${STATE.water} / 2500 ml`;
    const waterPercentage = Math.min((STATE.water / 2500) * 100, 100);
    elements.waterFluid.style.height = `${waterPercentage}%`;
}

// Draw minimalist monochrome Macro breakdown canvas pie chart
function drawMacroChart(p, c, f) {
    const canvas = document.getElementById('macro-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const total = p + c + f;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 6;

    if (total === 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 10;
        ctx.stroke();
        return;
    }

    const angles = [
        (p / total) * 2 * Math.PI,
        (c / total) * 2 * Math.PI,
        (f / total) * 2 * Math.PI
    ];

    const colors = [
        '#ffffff', // Protein
        '#a1a1aa', // Carbs
        '#3f3f46'  // Fat
    ];

    let startAngle = -Math.PI / 2;
    for (let i = 0; i < angles.length; i++) {
        if (angles[i] === 0) continue;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + angles[i]);
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = 12;
        ctx.stroke();
        
        startAngle += angles[i];
    }
}

// Draw weekly trends canvas bar chart
function drawTrendChart() {
    const canvas = document.getElementById('trend-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Make canvas responsive to its parent size
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 150;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const data = STATE.weeklyHistory || [];
    if (data.length === 0) return;

    const paddingLeft = 35;
    const paddingRight = 15;
    const paddingTop = 25;
    const paddingBottom = 25;

    const graphWidth = width - paddingLeft - paddingRight;
    const graphHeight = height - paddingTop - paddingBottom;

    // Y-axis scales
    const maxVal = Math.max(3000, ...data.map(d => d.calories));
    
    // Draw Y grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'var(--text-muted)';
    ctx.font = '9px var(--font-outfit)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const gridLines = [0, 1000, 2000, 3000];
    gridLines.forEach(val => {
        if (val > maxVal) return;
        const y = height - paddingBottom - (val / maxVal) * graphHeight;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(width - paddingRight, y);
        ctx.stroke();
        ctx.fillText(val, paddingLeft - 8, y);
    });

    // Draw bars
    const barWidth = Math.min(30, (graphWidth / data.length) * 0.6);
    const spacing = (graphWidth - barWidth * data.length) / (data.length - 1);

    data.forEach((d, idx) => {
        const barHeight = (d.calories / maxVal) * graphHeight;
        const x = paddingLeft + idx * (barWidth + spacing);
        const y = height - paddingBottom - barHeight;

        // Draw bar gradient
        const grad = ctx.createLinearGradient(x, y, x, height - paddingBottom);
        if (d.isToday) {
            // White neon gradient for today
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(1, '#52525b');
        } else {
            // Dark gray gradient for history
            grad.addColorStop(0, '#a1a1aa');
            grad.addColorStop(1, '#18181b');
        }

        ctx.fillStyle = grad;
        
        // Draw round rectangle for bar top
        ctx.beginPath();
        const radius = 4;
        if (barHeight > radius) {
            ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0]);
        } else {
            ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();

        // Draw label
        ctx.fillStyle = d.isToday ? '#ffffff' : 'var(--text-muted)';
        ctx.font = d.isToday ? 'bold 10px var(--font-outfit)' : '10px var(--font-outfit)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(d.day, x + barWidth / 2, height - paddingBottom + 8);

        // Draw calorie value inside bar or above
        if (d.calories > 0) {
            ctx.fillStyle = d.isToday ? '#ffffff' : 'var(--text-muted)';
            ctx.font = 'bold 9px var(--font-outfit)';
            ctx.textAlign = 'center';
            ctx.fillText(Math.round(d.calories), x + barWidth / 2, y - 12);
        }
    });

    // Draw target calorie line
    const targetY = height - paddingBottom - (STATE.targets.calories / maxVal) * graphHeight;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]); // Dotted line
    ctx.beginPath();
    ctx.moveTo(paddingLeft, targetY);
    ctx.lineTo(width - paddingRight, targetY);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Draw Target label
    ctx.fillStyle = '#ffffff';
    ctx.font = '9px var(--font-outfit)';
    ctx.textAlign = 'right';
    ctx.fillText('Target', width - paddingRight, targetY - 6);
}

// Render Food logs list with search filter
function renderMealLogs() {
    elements.mealLogsTbody.innerHTML = '';
    
    const filteredMeals = STATE.meals.filter(meal => {
        const query = STATE.searchFilter.toLowerCase();
        const matchesName = meal.name.toLowerCase().includes(query);
        const matchesTags = meal.tags && meal.tags.some(tag => tag.toLowerCase().includes(query));
        return matchesName || matchesTags;
    });

    if (filteredMeals.length === 0) {
        elements.logsEmptyState.style.display = 'flex';
        return;
    }
    
    elements.logsEmptyState.style.display = 'none';
    
    filteredMeals.forEach((meal, idx) => {
        const tr = document.createElement('tr');
        
        let tagsHtml = '';
        if (meal.tags && Array.isArray(meal.tags)) {
            meal.tags.forEach(tag => {
                tagsHtml += `<span class="log-tag">${tag}</span>`;
            });
        }
        
        const mainStateIndex = STATE.meals.indexOf(meal);

        tr.innerHTML = `
            <td>
                <span class="log-title">${meal.name}</span>
                <span class="log-time">${meal.time || 'Logged'}</span>
            </td>
            <td><strong>${meal.calories} kcal</strong></td>
            <td>
                <span style="color: var(--text-main)">P: ${meal.protein}g</span> &nbsp;|&nbsp;
                <span style="color: var(--text-muted)">C: ${meal.carbs}g</span> &nbsp;|&nbsp;
                <span style="color: #666">F: ${meal.fat}g</span>
            </td>
            <td>${tagsHtml}</td>
            <td>
                <button class="delete-log-btn" data-index="${mainStateIndex}">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </td>
        `;
        
        elements.mealLogsTbody.appendChild(tr);
    });
    
    document.querySelectorAll('.delete-log-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.getAttribute('data-index'));
            deleteMeal(idx);
        });
    });
}

// Export Daily Journal report in Markdown
function exportReport() {
    if (STATE.meals.length === 0) {
        alert('Your food journal is empty. Log some meals before exporting!');
        return;
    }

    const dateStr = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    let totalCals = 0;
    let totalP = 0;
    let totalC = 0;
    let totalF = 0;
    
    let mealsMd = '';
    STATE.meals.forEach(meal => {
        totalCals += meal.calories;
        totalP += meal.protein;
        totalC += meal.carbs;
        totalF += meal.fat;
        mealsMd += `| ${meal.time || 'Logged'} | ${meal.name} | ${meal.calories} | ${meal.protein}g | ${meal.carbs}g | ${meal.fat}g | ${meal.tags ? meal.tags.join(', ') : '-'} |\n`;
    });

    const reportMd = `# NutriPulse AI Daily Wellness Report
**Date**: ${dateStr}
**User**: ${STATE.userProfile ? STATE.userProfile.name : 'Wellness User'}

---

## Daily Summary
* **Calories Consumed**: ${totalCals} / ${STATE.targets.calories} kcal
* **Protein Intake**: ${totalP} / ${STATE.targets.protein}g
* **Carbohydrates**: ${totalC} / ${STATE.targets.carbs}g
* **Fat Intake**: ${totalF} / ${STATE.targets.fat}g
* **Water Hydration**: ${STATE.water} / 2500 ml

---

## Food Journal Entries
| Time | Meal | Calories (kcal) | Protein | Carbs | Fat | Tags |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${mealsMd}
---
*Generated securely by NutriPulse AI.*
`;

    const blob = new Blob([reportMd], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NutriPulse_Report_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Render Chat Conversation
function renderChatMessages() {
    elements.chatMessagesContainer.innerHTML = '';
    
    STATE.chatHistory.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', `${msg.role}-message`);
        
        let parsedContent = msg.content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^\s*-\s+(.*?)$/gm, '• $1')
            .replace(/\n/g, '<br>');
            
        msgDiv.innerHTML = `<p>${parsedContent}</p>`;
        elements.chatMessagesContainer.appendChild(msgDiv);
    });
    
    elements.chatMessagesContainer.scrollTop = elements.chatMessagesContainer.scrollHeight;
}

// Log Food Helpers
function addMeal(meal) {
    meal.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    STATE.meals.unshift(meal);
    localStorage.setItem('nutripulse_meals', JSON.stringify(STATE.meals));
    renderDashboard();
    renderMealLogs();
}

function deleteMeal(idx) {
    STATE.meals.splice(idx, 1);
    localStorage.setItem('nutripulse_meals', JSON.stringify(STATE.meals));
    renderDashboard();
    renderMealLogs();
}

function clearAllLoggedMeals() {
    if (confirm('Clear entire daily food log?')) {
        STATE.meals = [];
        localStorage.setItem('nutripulse_meals', JSON.stringify(STATE.meals));
        renderDashboard();
        renderMealLogs();
    }
}

// Water log modifications
function updateWater(amt) {
    STATE.water = Math.max(0, STATE.water + amt);
    localStorage.setItem('nutripulse_water', STATE.water.toString());
    renderDashboard();
}

// Fireworks API client query (supports optional image)
async function queryFireworksAPI(systemPrompt, userPrompt, base64Image = null) {
    if (!STATE.apiKey) {
        throw new Error('API Key missing. Enter key in Settings modal.');
    }

    // Determine model payload structure
    let messageContent = userPrompt;
    let modelName = STATE.selectedModel;

    if (base64Image) {
        // Swap to visual model automatically for multimodal request
        modelName = 'accounts/fireworks/models/deepseek-v4-pro';
        messageContent = [
            { type: 'text', text: userPrompt },
            {
                type: 'image_url',
                image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                }
            }
        ];
    }
    
    const response = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${STATE.apiKey}`
        },
        body: JSON.stringify({
            model: modelName,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: messageContent }
            ],
            temperature: 0.2,
            max_tokens: 800
        })
    });
    
    if (!response.ok) {
        const errText = await response.text();
        let hint = '';
        if (response.status === 401) hint = ' — Invalid API key. Double-check your key in Settings.';
        if (response.status === 404) hint = ' — Model not found. Open Settings and switch to DeepSeek v4 Pro.';
        if (response.status === 429) hint = ' — Rate limit hit. Wait a moment and try again.';
        throw new Error(`API Error ${response.status}${hint}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
}

// Scan Meal Event Handler
async function handleMealAnalysis() {
    const isImageTab = elements.tabImage.classList.contains('active');
    let foodText = '';
    let base64Image = null;
    
    if (isImageTab) {
        const file = elements.fileInput.files[0];
        if (!file) {
            alert('Please drop or select a food photo first!');
            return;
        }
        
        // Read file as Base64 data URL
        base64Image = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Return raw base64 data string (excluding prefix details)
                resolve(e.target.result.split(',')[1]);
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });

        foodText = file.name.toLowerCase().replace(/[^a-z\s]/g, ' ');
    } else {
        foodText = elements.mealDescInput.value.trim();
        if (!foodText) {
            alert('Please describe your meal first!');
            return;
        }
    }
    
    elements.scannerOverlay.classList.add('active');
    elements.analyzeBtn.disabled = true;
    
    try {
        let loggedMeal = null;
        
        if (STATE.apiKey) {
            // Live Fireworks LLM parser
            const systemPrompt = `You are a nutrition analyst. Extract the food described, estimate portions, and output ONLY a single, valid JSON block matching this exact JSON schema:
            {
              "name": "General descriptive name of food",
              "calories": 450,
              "protein": 22,
              "carbs": 45,
              "fat": 12,
              "tags": ["Tag1", "Tag2"]
            }
            Do not include any chat commentary or markdown formatting around the JSON, return the raw JSON string directly. Make sure estimations are scientifically realistic based on standard nutrition data.`;
            
            let rawResponse;
            if (base64Image) {
                rawResponse = await queryFireworksAPI(systemPrompt, 'Analyze the food shown in this photo. Estimate calories and macros.', base64Image);
            } else {
                rawResponse = await queryFireworksAPI(systemPrompt, `Analyze this food intake description: "${foodText}"`);
            }

            const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                loggedMeal = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Unable to parse JSON block from AI output.");
            }
        } else {
            // Simulated local offline match
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const matchedMock = MOCK_MEALS_DATABASE.find(item => 
                item.keywords.some(keyword => foodText.includes(keyword))
            );
            
            if (matchedMock) {
                loggedMeal = {
                    name: matchedMock.name,
                    calories: matchedMock.calories,
                    protein: matchedMock.protein,
                    carbs: matchedMock.carbs,
                    fat: matchedMock.fat,
                    tags: [...matchedMock.tags]
                };
            } else {
                const calculatedCalories = Math.round(180 + Math.random() * 450);
                loggedMeal = {
                    name: foodText.length > 35 ? foodText.substring(0, 32) + '...' : foodText,
                    calories: calculatedCalories,
                    protein: Math.round(calculatedCalories * 0.03 + Math.random() * 8),
                    carbs: Math.round(calculatedCalories * 0.08 + Math.random() * 15),
                    fat: Math.round(calculatedCalories * 0.02 + Math.random() * 6),
                    tags: ['Healthy Choice']
                };
            }
        }
        
        if (loggedMeal) {
            addMeal(loggedMeal);
            elements.mealDescInput.value = '';
            clearImagePreview();
        }
        
    } catch (err) {
        console.error(err);
        alert(`Analysis Error: ${err.message}`);
    } finally {
        elements.scannerOverlay.classList.remove('active');
        elements.analyzeBtn.disabled = false;
    }
}

// Chat Coach response triggers
async function handleCoachChat(messageText = '') {
    const inputMsg = messageText || elements.chatUserInput.value.trim();
    if (!inputMsg) return;
    
    STATE.chatHistory.push({ role: 'user', content: inputMsg });
    elements.chatUserInput.value = '';
    renderChatMessages();
    
    const tempLoaderIdx = STATE.chatHistory.length;
    STATE.chatHistory.push({ role: 'assistant', content: 'Typing...' });
    renderChatMessages();
    
    try {
        let coachResponse = '';
        
        if (STATE.apiKey) {
            const systemPrompt = `You are NutriPulse AI Coach, a supportive, certified sports nutritionist and health guide.
            Keep your answers concise, engaging, and focused on wellness. Offer actionable food substitutions or recipes. Use bullet points for layout where appropriate. Always match user queries scientifically. Current logged food count: ${STATE.meals.length} meals.`;
            
            const context = STATE.chatHistory.slice(0, tempLoaderIdx);
            const rawResponse = await queryFireworksAPI(systemPrompt, JSON.stringify(context.slice(-4).concat({ role: 'user', content: inputMsg })));
            coachResponse = rawResponse;
        } else {
            await new Promise(resolve => setTimeout(resolve, 1200));
            coachResponse = MOCK_COACH_RESPONSES[Math.floor(Math.random() * MOCK_COACH_RESPONSES.length)] + 
                "\n\n*(Note: Enable Fireworks API settings to get real-time personalised answers tailored to your queries.)*";
        }
        
        STATE.chatHistory[tempLoaderIdx] = { role: 'assistant', content: coachResponse };
        localStorage.setItem('nutripulse_chat', JSON.stringify(STATE.chatHistory));
        renderChatMessages();
        
    } catch (err) {
        console.error(err);
        STATE.chatHistory[tempLoaderIdx] = { role: 'assistant', content: `Sorry, I encountered an error connecting to Fireworks: ${err.message}` };
        renderChatMessages();
    }
}

// Image upload preview helpers
function showImagePreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        elements.imagePreview.src = e.target.result;
        elements.imagePreviewBox.style.display = 'block';
    }
    reader.readAsDataURL(file);
}

function clearImagePreview() {
    elements.fileInput.value = '';
    elements.imagePreview.src = '#';
    elements.imagePreviewBox.style.display = 'none';
}

// Event Listeners setup
function setupEventListeners() {
    // Signup Form Submission
    elements.signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const profile = {
            name: elements.signupName.value.trim(),
            age: parseInt(elements.signupAge.value),
            weight: parseInt(elements.signupWeight.value),
            height: parseInt(elements.signupHeight.value),
            goal: elements.signupGoal.value
        };

        STATE.userProfile = profile;
        localStorage.setItem('nutripulse_user_profile', JSON.stringify(profile));

        // Automatically calculate daily targets
        const recommendedTargets = calculateOptimalTargets(profile);
        STATE.targets = recommendedTargets;
        localStorage.setItem('nutripulse_targets', JSON.stringify(recommendedTargets));

        initWeeklyHistory();
        showDashboardView();
    });

    // Log Out click
    elements.logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to sign out and clear your profile data?')) {
            localStorage.removeItem('nutripulse_user_profile');
            localStorage.removeItem('nutripulse_meals');
            localStorage.removeItem('nutripulse_water');
            localStorage.removeItem('nutripulse_chat');
            localStorage.removeItem('nutripulse_weekly_history');
            
            STATE.userProfile = null;
            STATE.meals = [];
            STATE.water = 0;
            STATE.weeklyHistory = null;
            STATE.chatHistory = [
                { role: 'assistant', content: "Hi! I'm your NutriPulse Coach. I can help analyze meals, adjust recipes, suggest healthy alternatives, or plan your goals. Ask me anything!" }
            ];

            showAuthView();
        }
    });

    // Settings Modal
    elements.openSettingsBtn.addEventListener('click', () => elements.settingsModal.classList.add('active'));
    elements.openSettingsNav.addEventListener('click', (e) => {
        e.preventDefault();
        elements.settingsModal.classList.add('active');
    });
    elements.closeSettingsModal.addEventListener('click', () => elements.settingsModal.classList.remove('active'));
    
    // Save Settings
    elements.saveApiSettings.addEventListener('click', () => {
        STATE.apiKey = elements.apiKeyInput.value.trim();
        STATE.selectedModel = elements.modelSelect.value;
        
        STATE.targets.calories = parseInt(elements.profileCalories.value) || 2000;
        STATE.targets.protein = parseInt(elements.profileProtein.value) || 130;
        STATE.targets.carbs = parseInt(elements.profileCarbs.value) || 220;
        STATE.targets.fat = parseInt(elements.profileFat.value) || 65;
        
        localStorage.setItem('nutripulse_apikey', STATE.apiKey);
        localStorage.setItem('nutripulse_model', STATE.selectedModel);
        localStorage.setItem('nutripulse_targets', JSON.stringify(STATE.targets));
        
        updateAPIStatusUI();
        renderDashboard();
        elements.settingsModal.classList.remove('active');
    });
    
    // Disconnect Key
    elements.resetApiSettings.addEventListener('click', () => {
        elements.apiKeyInput.value = '';
        STATE.apiKey = '';
        localStorage.removeItem('nutripulse_apikey');
        updateAPIStatusUI();
        elements.settingsModal.classList.remove('active');
    });

    // Close modal on click outside content
    window.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) {
            elements.settingsModal.classList.remove('active');
        }
    });

    // Water Log actions
    elements.addWater250.addEventListener('click', () => updateWater(250));
    elements.addWater500.addEventListener('click', () => updateWater(500));
    elements.resetWater.addEventListener('click', () => {
        if (confirm('Reset daily water intake log?')) {
            STATE.water = 0;
            localStorage.setItem('nutripulse_water', '0');
            renderDashboard();
        }
    });

    // Clear meals log
    elements.clearAllMeals.addEventListener('click', clearAllLoggedMeals);

    // Search filter input
    elements.logSearchInput.addEventListener('input', (e) => {
        STATE.searchFilter = e.target.value.trim();
        renderMealLogs();
    });

    // Export report
    elements.exportReportBtn.addEventListener('click', exportReport);

    // Tab switcher
    elements.tabText.addEventListener('click', () => {
        elements.tabText.classList.add('active');
        elements.tabImage.classList.remove('active');
        elements.panelText.classList.add('active');
        elements.panelImage.classList.remove('active');
    });

    elements.tabImage.addEventListener('click', () => {
        elements.tabImage.classList.add('active');
        elements.tabText.classList.remove('active');
        elements.panelImage.classList.add('active');
        elements.panelText.classList.remove('active');
    });

    // Image Upload triggers
    elements.dropzone.addEventListener('click', (e) => {
        if (e.target.id !== 'remove-preview' && !elements.removePreview.contains(e.target)) {
            elements.fileInput.click();
        }
    });
    
    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            showImagePreview(e.target.files[0]);
        }
    });

    elements.removePreview.addEventListener('click', (e) => {
        e.stopPropagation();
        clearImagePreview();
    });

    // Drag-and-Drop
    elements.dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.dropzone.style.borderColor = 'var(--text-main)';
    });

    elements.dropzone.addEventListener('dragleave', () => {
        elements.dropzone.style.borderColor = 'var(--border-color)';
    });

    elements.dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.dropzone.style.borderColor = 'var(--border-color)';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            elements.fileInput.files = e.dataTransfer.files;
            showImagePreview(e.dataTransfer.files[0]);
        }
    });

    // Scan meal action
    elements.analyzeBtn.addEventListener('click', handleMealAnalysis);

    // Coach Chat actions
    elements.chatSendBtn.addEventListener('click', () => handleCoachChat());
    elements.chatUserInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleCoachChat();
        }
    });

    elements.clearChat.addEventListener('click', () => {
        if (confirm('Clear chat conversation history?')) {
            STATE.chatHistory = [
                { role: 'assistant', content: "Hi! I'm your NutriPulse Coach. I can help analyze meals, adjust recipes, suggest healthy alternatives, or plan your goals. Ask me anything!" }
            ];
            localStorage.setItem('nutripulse_chat', JSON.stringify(STATE.chatHistory));
            renderChatMessages();
        }
    });

    // Suggestion chips clicks
    elements.suggestionsBox.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion-chip')) {
            handleCoachChat(e.target.textContent);
        }
    });

    // Handle window resize to redraw trend chart responsively
    window.addEventListener('resize', () => {
        if (STATE.userProfile) drawTrendChart();
    });
}
