# Smart Farm Assistant 🌱

A premium, localized, mobile-first farm management application built to help farmers efficiently track their crops, expenses, activities, and harvests.

## ✨ Features
* **Advanced AI NPC**: Your personal "Farmer Mando" AI Assistant powered by Google Gemini, capable of directly reading your farm data and answering questions fluently in both English and Filipino.
* **Premium Glassmorphic UI**: Beautiful, translucent interface elements delivering a highly responsive, high-contrast, modern user experience.
* **Full Localization**: The entire web application fluidly switches between English and Filipino/Tagalog down to the core form labels.
* **Complete Record Keeping**: Quickly log your active crops, calculate running expenses, and estimate harvest returns.

## 🛠️ Technology Stack
* **Frontend**: React (Vite), Tailwind CSS, Framer Motion
* **Backend**: Node.js, Express, MongoDB (Mongoose)
* **Authentication**: JWT, custom encrypted session tokens
* **AI Integration**: `@google/genai` (Gemini 2.5 Flash)

## 🚀 Getting Started

1. Set up your `.env` blocks in the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
2. Start the Backend:
   ```bash
   cd backend
   npm install
   npm start
   ```
3. Start the Frontend Application:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
