# NutriPulse AI - Smart Sports Nutrition & Wellness Coach

NutriPulse AI is an advanced, client-side web application designed to help users track their daily calories, manage macronutrients, log water intake, and consult a personal AI sports nutrition coach. It features a premium, minimalist monochrome glassmorphism UI with interactive animations.

## 🚀 Key Features

1. **User Onboarding Profile**: Automatically calculates daily target calories and protein/carbs/fat targets based on weight, height, age, and wellness goals using the Harris-Benedict BMR equation. Calculates and tracks BMI dynamically.
2. **True Multimodal Food Scan**: Drag-and-drop or select food photos to run visual parsing powered by Fireworks AI's **Llama 3.2 Vision** model. The AI scans the photo, estimates the food, portions, and logs precise nutritional values.
3. **Interactive 7-Day Trend Analytics**: Programmatic HTML5 canvas rendering showing calorie intake trends over the last 7 days compared against the user's daily budget ceiling.
4. **AI Sports Nutrition Coach**: Scrollable sidebar chat assistant loaded with context from your daily logs to adapt recipes, plan meals, and provide tailored health advice.
5. **Secure Local Caching**: Your Fireworks API key and profile details are saved strictly in your browser's local memory (`localStorage`). No servers, no tracking, complete privacy.
6. **Data Exporter**: Export your daily wellness summary and logged foods to a clean, formatted Markdown report.

---

## 🛠️ Technology Stack

* **Frontend**: HTML5 (Semantic Structure), Vanilla CSS3 (Glassmorphism, animations, layouts), JavaScript (State management, canvas drawing)
* **AI Engine**: Fireworks AI Chat Completions
  * **Coaching Model**: `accounts/fireworks/models/llama-v3p1-70b-instruct`
  * **Multimodal Scan Model**: `accounts/fireworks/models/llama-v3p2-11b-vision-instruct`
* **Development Server**: Python HTTP Module / Node static server

---

## 💻 Quick Start

### 1. Run the App Locally
Clone the repository and spin up a lightweight development server:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/mlempower.git
cd mlempower

# Spin up a Python HTTP Server
python -m http.server 3000
```
Then, navigate to **http://localhost:3000** in your browser.

### 2. Configure Your Fireworks API Key
1. Click **API Settings** in the sidebar.
2. Paste your Fireworks API Key (`fw_...`) and select your preferred LLM model.
3. Click **Save Configurations** and start tracking!

---

*Built with passion for the **ML Empowerment Build Challenge 2.0**.*
