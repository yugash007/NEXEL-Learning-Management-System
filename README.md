# 🌐 NEXEL: Learning Management System

> **Version:** 1.0  
> **Team Name:** Auralis  
> **Project Type:** Web Application  
> **Theme:** AI-Powered Learning Solutions  
> **Deployed Link:** [NEXEL on Vercel 🚀](https://nexel-learning-management-system-1-mrz4ljgpq.vercel.app/)
> **Link** [NEXEL](https://nexel-learning-management-system-1.vercel.app/)
> **GitHub Repository:** [Source Code](https://github.com/yugash007/NEXEL-Learning-Management-System)  
> **Hackathon:** Synapse 2K25 – Mohan Babu University  

---

## 🧠 About the Project

**NEXEL** is a modern, next-generation **Learning Management System (LMS)** designed to transform education through an engaging, interactive, and futuristic learning experience.  

It bridges the gap between educators and learners by offering a seamless platform where **teachers can create and manage courses**, and **students can learn, collaborate, and track progress** — all in a beautifully designed, user-friendly interface.  

Our goal is to **empower education through innovation**, bringing together technology, design, and interactivity into one integrated system.

---

## 🔒 Security Notice

This project uses environment variables to secure sensitive Firebase configuration. The actual API keys are **NOT** committed to the repository.

### Setting Up Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase configuration values in `.env`

3. For Vercel deployment, add these environment variables in your Vercel project settings:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`

---

## 👥 Team Auralis

| Name | Year | Department |
|------|------|-------------|
| **Devineni Yugash** | II Year | B.Tech – Artificial Intelligence & Machine Learning |
| **Devathi Naga Shamika** | II Year | B.Tech – Artificial Intelligence & Machine Learning |
| **P S Eeshasree** | III Year | B.Tech – Artificial Intelligence & Machine Learning |
| **Matli Divyasree** | III Year | B.Tech – Artificial Intelligence & Machine Learning |

> *“Auralis” signifies the light of innovation — spreading knowledge through technology.*

---

## 🚀 Core Features

### 🎓 For Students
- **Course Discovery:** Explore and enroll in diverse courses with prerequisite checks.  
- **Personal Dashboard:** Track enrolled courses, progress, announcements, and badges.  
- **Interactive Learning:** Access videos, notes, and submit assignments easily.  
- **Performance Reports:** View and download PDF-based grade reports.  
- **Discussion Forums:** Engage with teachers and peers.  
- **Profile Management:** View personal learning stats and achievements.  
- **Gamification:** Celebrate 100% course completion with confetti animations!  

### 🧑‍🏫 For Teachers
- **Course Management:** Create and manage courses with ease.  
- **Content Uploads:** Add modules, videos, and study materials.  
- **Assignments & Grading:** Review submissions and share feedback.  
- **Announcements & Forums:** Interact with students through discussions.  
- **Dashboard Overview:** Monitor and manage all courses centrally.

---

## ⚙️ Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | React (with TypeScript) |
| **Styling** | Tailwind CSS (via CDN) |
| **Routing** | React Router |
| **Database** | Firebase / In-Memory Mock API (demo mode) |
| **PDF Reports** | jsPDF & jsPDF-AutoTable |
| **Design Tool** | Figma (AI-assisted for layout and export) |

> Lightweight, browser-based, and built for performance — no backend setup required.

---

## 💡 Key Highlights

- 🧭 *Completely client-side LMS — no server configuration required*  
- 🧱 *All dependencies imported via CDN (no npm build)*  
- 🕹️ *Modern neo-futuristic design with subtle animations*  
- 📄 *Auto-generated student performance PDFs*  
- 🔐 *Firebase-ready structure for scalability*  

---

## 🧰 How to Run Locally

### Option 1: Using Python HTTP Server
1. Open the project root folder in the terminal.  
2. Run:
   ```bash
   python -m http.server
Open your browser and go to:

arduino
Copy code
http://localhost:8000
The app will load instantly — ready to explore!

Option 2: Using VS Code Live Server
Install the Live Server extension in VS Code.

Right-click on index.html → Select “Open with Live Server.”

The app will automatically open in your browser.

⚠️ Note: The application uses an in-memory mock API, so all stored data resets upon page refresh.

🏁 Future Scope
🔐 Firebase Authentication & Firestore Integration

🤖 AI-based Personalized Course Recommendation System

💬 Real-Time Chat & Notifications

🧠 Learning Analytics Dashboard

☁️ Cloud Deployment (Firebase Hosting / Vercel Pro)

🎨 UI & UX Design
The design philosophy follows neo-futurism — clean, responsive, and immersive:

Elegant glassmorphism with minimal gradients

Subtle transitions for user actions

Consistent typography and spacing

Mobile-friendly layouts

Designed using Figma + AI Plugin for precision and responsiveness.

💬 Team Statement
“Education is not just the transfer of information — it’s the evolution of understanding.
Through NEXEL, we aim to make learning more human, immersive, and intelligent.”
