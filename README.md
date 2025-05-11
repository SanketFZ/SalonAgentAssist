# Agent Assist - Human-in-the-Loop AI System

This is a Next.js application demonstrating a "human-in-the-loop" system for AI agents. It allows AI agents to escalate complex queries to human supervisors, who can then provide answers, which in turn improve the AI's knowledge base.

## Features

*   **Supervisor Dashboard**: View pending requests, provide answers, and see request history.
*   **Knowledge Base**: Automatically updated with supervisor-approved answers.
*   **AI-Powered Assistance**:
    *   Suggests answers to supervisors based on the knowledge base.
    *   Summarizes request context for supervisors.
    *   Improves the formatting of supervisor answers before saving them to the knowledge base.
*   **Simulated Agent Interaction**: Basic simulation of an AI agent receiving calls and either answering or escalating.
*   **Firebase Integration**: Uses Firestore as the database for storing help requests and knowledge base entries.
*   **Genkit Integration**: Leverages Google's Genkit for AI flow management and interaction with generative AI models.

## Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18 or later recommended)
*   [npm](https://www.npmjs.com/) (comes with Node.js) or [yarn](https://yarnpkg.com/)

## Project Setup

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of your project. This file will store your API keys and Firebase configuration. **Do not commit this file to version control.**

    Copy the following into your `.env` file and replace the placeholder values with your actual Firebase project credentials and Google Generative AI API key:

    ```env
    # Firebase Configuration (obtain from your Firebase project settings)
    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
    NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID" # Optional, for Analytics

    # Google Generative AI API Key (obtain from Google AI Studio or Google Cloud Console)
    # This is used by Genkit for AI model interactions.
    GOOGLE_GENAI_API_KEY="YOUR_GOOGLE_GENERATIVE_AI_API_KEY"
    ```

    **How to get Firebase credentials:**
    *   Go to your [Firebase Console](https://console.firebase.google.com/).
    *   Select your project (or create a new one).
    *   Go to Project settings (click the gear icon).
    *   Under the "General" tab, scroll down to "Your apps".
    *   If you don't have a web app, create one.
    *   The Firebase SDK setup and configuration snippet will contain your `apiKey`, `authDomain`, `projectId`, etc.

    **How to get Google Generative AI API Key:**
    *   Visit [Google AI Studio](https://aistudio.google.com/app/apikey) or the Google Cloud Console for your project.
    *   Create or retrieve an API key enabled for the Generative Language API (e.g., Gemini).

4.  **Set up Firebase Firestore:**
    *   In your Firebase project, navigate to "Firestore Database" in the console.
    *   Click "Create database".
    *   Choose "Start in **test mode**" for initial development (for easier access without complex security rules). For production, you'll need to set up proper security rules.
    *   Select a Cloud Firestore location.
    *   The application will automatically create the necessary collections (`helpRequests`, `knowledgeBase`) when data is first written to them. You do not need to create them manually.

## Running the Application Locally

The application consists of two main parts: the Next.js frontend/backend and the Genkit AI flows.

1.  **Start the Next.js Development Server:**
    This server handles the web interface and API routes.
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    By default, this will start the application on `http://localhost:9002`.

2.  **Start the Genkit Development Server (Optional, for flow inspection):**
    If you want to inspect or test your Genkit flows directly using the Genkit Developer UI, run this command in a **separate terminal**:
    ```bash
    npm run genkit:dev
    # or
    # yarn genkit:dev
    ```
    This will typically start the Genkit UI on `http://localhost:4000/flows`. You can view flow traces and test flows here. Note that the Next.js app calls these flows as server actions, so this step is mainly for debugging Genkit flows in isolation.

## Accessing the Application

*   **Landing Page**: Open your browser and navigate to `http://localhost:9002`
*   **Supervisor Dashboard**: `http://localhost:9002/supervisor`
*   **Knowledge Base**: `http://localhost:9002/knowledge-base`

## Simulating Agent Interactions

The project includes a basic simulation for an AI agent receiving calls:
*   The file `src/server/lib/agent-simulation.ts` contains the logic.
*   Currently, `processIncomingCall()` in `agent-simulation.ts` is called when the Next.js server starts (due to imports in `src/server/lib/index.ts`).
*   This simulation will:
    1.  Simulate receiving a call with a random question.
    2.  Check the Firestore `knowledgeBase` for an answer.
    3.  If an answer is found, it simulates responding to the caller.
    4.  If no answer is found, it creates a `helpRequests` entry in Firestore (which appears in the Supervisor Dashboard) and simulates telling the caller they will be escalated.

    You can observe these actions in your server console logs and by checking the Firebase Firestore data.

## Project Structure

*   `src/app/`: Contains Next.js App Router pages and API routes.
    *   `src/app/api/`: API route handlers.
    *   `src/app/(pages)/`: Main application pages (e.g., `supervisor`, `knowledge-base`).
*   `src/components/`: Reusable React components.
    *   `src/components/ui/`: UI components from ShadCN.
    *   `src/components/layout/`: Layout components.
    *   `src/components/supervisor/`: Components specific to the supervisor dashboard.
    *   `src/components/knowledge-base/`: Components specific to the knowledge base view.
*   `src/client/`: Client-side specific code (hooks, utilities).
*   `src/server/`: Server-side specific code.
    *   `src/server/ai/`: Genkit related files.
        *   `src/server/ai/ai-instance.ts`: Genkit AI instance configuration.
        *   `src/server/ai/flows/`: Genkit AI flows (e.g., summarizing text, suggesting answers).
        *   `src/server/ai/dev.ts`: Entry point for `genkit start` (local Genkit dev server).
    *   `src/server/lib/`: Server-side library functions (e.g., database interactions, agent simulation).
    *   `src/server/services/`: Simulated external services (e.g., LiveKit, Twilio).
*   `src/lib/`: Shared utility functions (e.g., `cn` for Tailwind).
*   `src/types/`: TypeScript type definitions.
*   `public/`: Static assets.
*   `tailwind.config.ts`: Tailwind CSS configuration.
*   `next.config.ts`: Next.js configuration.
*   `components.json`: ShadCN UI configuration.

## Key Technologies

*   **Next.js**: React framework for server-side rendering and static site generation.
*   **TypeScript**: Superset of JavaScript for type safety.
*   **Tailwind CSS**: Utility-first CSS framework.
*   **ShadCN UI**: Re-usable UI components.
*   **Firebase (Firestore)**: NoSQL cloud database.
*   **Genkit**: Google's toolkit for building AI-powered applications.
*   **Lucide React**: Icon library.

## Troubleshooting

*   **`GOOGLE_GENAI_API_KEY is not set`**: Ensure you have correctly set `GOOGLE_GENAI_API_KEY` in your `.env` file and that the Next.js server was restarted after adding it.
*   **Firebase Permission Errors**: If you encounter permission errors when interacting with Firestore, ensure your Firestore security rules are correctly set up. For development, "test mode" allows open access. For production, restrict access appropriately.
*   **Port Conflicts**: If `localhost:9002` (Next.js) or `localhost:4000` (Genkit) are in use, modify the `dev` or `genkit:dev` scripts in `package.json` to use different ports (e.g., `next dev -p <new_port>`).
