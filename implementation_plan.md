# Git Deployment & Hosting Plan

The goal is to push the entire Crime Ranking architecture to your GitHub repository (`SIDDk1/Crime_Ranking`) and securely deploy the live environment to the web so you can fully share a live URL during your final year project presentation.

## User Review Required

> [!WARNING]  
> Before pushing the code, I will create strict `.gitignore` files to block massive dependencies (`/node_modules`, `/venv`, `__pycache__`) from congesting your repository. Because your `model.pkl` is safely sized (~675KB) and the `crime_dataset_india.csv` is under 5MB, they will safely sync immediately to GitHub without needing to deal with `git-lfs` complications!

## Proposed Architecture

1. **Git Synchronization**
   - Initialize `.git` in the root workspace.
   - Cleanly isolate environments using tailored `.gitignore` files.
   - Generate a valid `requirements.txt` encoded securely for Linux servers natively.
   - Automatically commit and push natively to `https://github.com/SIDDk1/Crime_Ranking.git`.

2. **Backend Hosting Strategy (Hugging Face Spaces or Render)**
   - Because Python backends requiring heavy OpenCV / Scikit-Learn binaries fail natively on Vercel, the industry standard for this is deploying the backend folder onto Render.com (WebApp) or Hugging Face Spaces (Docker/FastAPI).
   - I will establish CORS natively allowing external connections dynamically.

3. **Frontend Hosting Strategy (Vercel)**
   - Vercel handles React/Vite builds perfectly.
   - I will configure Vercel to explicitly map to your `frontend/` subdirectory so it does not accidentally attempt to build your Python folders!

## Open Questions
- Do you have an active **GitHub Personal Access Token** ready on this computer to successfully authenticate the `git push` command, or are you utilizing GitHub Desktop natively? Let me know so I can securely execute the push natively!
