> # Code Quality Predictor
> 
> **ML-powered code analysis tool that predicts quality, bug probability, complexity, and maintainability of Python code.**
> 
> ---
> 
> ## 📊 Overview
> 
> Code Quality Predictor is a full-stack machine learning application that analyzes Python code snippets and provides instant, actionable insights. Built with a modern architecture, it combines the power of ML with an intuitive user interface.
> 
> **Live Demo:** [https://penbeam.github.io/code-quality-predictor/](https://penbeam.github.io/code-quality-predictor/)
> 
> **API Endpoint:** [https://code-quality-api.onrender.com](https://code-quality-api.onrender.com)
> 
> ---
> 
> ## 🚀 Key Features
> 
> | Feature | Description |
> |---------|-------------|
> | **Code Quality Score** | 0-100 rating based on best practices and readability |
> | **Bug Probability** | Percentage estimate of potential bugs in the code |
> | **Complexity Analysis** | Structural complexity score (Low/Medium/High) |
> | **Maintainability Index** | How easy the code is to maintain and modify |
> | **Code Metrics** | Lines, functions, classes, and comments count |
> | **Analysis History** | Track all previous analyses with timestamps |
> | **Share Results** | Generate shareable links and QR codes |
> | **PDF Reports** | Export professional analysis reports |
> | **Dark Mode** | Developer-friendly dark theme |
> 
> ---
> 
> ## 🛠️ Technology Stack
> 
> ### Machine Learning
> - **Model:** Random Forest Regressor Ensemble
> - **Accuracy:** 88-90% R² Score
> - **Features:** 12 code quality metrics
> - **Training:** Google Colab (GPU)
> 
> ### Backend
> - **Framework:** FastAPI (Python 3.11)
> - **Database:** SQLite with SQLAlchemy ORM
> - **Deployment:** Render.com
> 
> ### Frontend
> - **Framework:** Vanilla HTML/CSS/JS
> - **Styling:** Mobile-first responsive design
> - **Syntax Highlighting:** Prism.js
> - **QR Code:** QRCode.js
> - **PDF Export:** jsPDF + html2canvas
> - **Deployment:** GitHub Pages
> 
> ### Architecture
> ```
> Google Colab → FastAPI → SQLite → GitHub Pages
>      (Training)  (API)   (Storage)   (UI)
> ```
> 
> ---
> 
> ## 📁 Project Structure
> 
> ```
> code-quality-predictor/
> ├── backend/
> │   ├── app/
> │   │   ├── __init__.py
> │   │   ├── main.py          # FastAPI endpoints
> │   │   ├── database.py      # SQLite setup
> │   │   ├── models.py        # Database schemas
> │   │   ├── schemas.py       # Pydantic validation
> │   │   ├── ml_model.py      # ML model loading
> │   │   └── config.py        # Configuration
> │   ├── models/              # Trained .pkl files
> │   ├── requirements.txt     # Python dependencies
> │   └── .env                 # Environment variables
> ├── docs/                    # Frontend source
> │   ├── index.html
> │   ├── css/
> │   └── js/
> └── README.md
> ```
> 
> ---
> 
> ## 📡 API Endpoints
> 
> | Method | Endpoint | Description |
> |--------|----------|-------------|
> | `GET` | `/` | API information |
> | `GET` | `/health` | Service health check |
> | `POST` | `/predict` | Analyze code quality |
> | `GET` | `/history` | Get analysis history |
> | `GET` | `/docs` | Swagger UI documentation |
> 
> ### Sample Request
> 
> ```bash
> curl -X POST https://code-quality-api.onrender.com/predict \
>   -H "Content-Type: application/json" \
>   -d '{"code": "def add(a, b): return a + b"}'
> ```
> 
> ### Sample Response
> 
> ```json
> {
>   "quality_score": 85.42,
>   "quality_category": "Good",
>   "bug_probability": 12.35,
>   "complexity_score": 0.234,
>   "complexity_category": "Low",
>   "maintainability_index": 88.50,
>   "code_metrics": {
>     "line_count": 1,
>     "function_count": 1,
>     "class_count": 0,
>     "comment_count": 0
>   },
>   "analysis_id": 1
> }
> ```
> 
> ---
> 
> ## 🧪 Model Performance
> 
> | Metric | R² Score | RMSE |
> |--------|----------|------|
> | Quality Score | 0.889 | 3.2 |
> | Bug Probability | 0.888 | 0.08 |
> | Complexity | 0.902 | 0.05 |
> | Maintainability | 0.896 | 4.1 |
> 
> ---
> 
> ## 🔧 Local Development
> 
> ### Prerequisites
> - Python 3.11+
> - pip (Python package manager)
> - Git
> 
> ### Setup Instructions
> 
> **1. Clone the repository**
> ```bash
> git clone https://github.com/penbeam/code-quality-predictor.git
> cd code-quality-predictor
> ```
> 
> **2. Set up the backend**
> ```bash
> cd backend
> pip install -r requirements.txt
> ```
> 
> **3. Add model files**
> 
> Place your trained `.pkl` model files in `backend/models/`:
> - `code_quality_model.pkl`
> - `preprocessor.pkl`
> 
> **4. Configure environment**
> 
> Create `.env` file:
> ```env
> DATABASE_URL=sqlite:///./code_quality.db
> ALLOWED_ORIGINS=http://localhost:8000,http://localhost:5500
> ```
> 
> **5. Run the server**
> ```bash
> uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
> ```
> 
> **6. Open the frontend**
> 
> Open `docs/index.html` in your browser or use Live Server.
> 
> ---
> 
> ## ☁️ Deployment
> 
> ### Backend (Render.com)
> 1. Push code to GitHub
> 2. Connect repository to Render
> 3. Set build command: `pip install -r requirements.txt`
> 4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
> 5. Add environment variables:
>    - `ALLOWED_ORIGINS`: `https://penbeam.github.io`
>    - `DATABASE_URL`: `sqlite:///./code_quality.db`
> 
> ### Frontend (GitHub Pages)
> 1. Enable GitHub Pages in repository settings
> 2. Source: `main` branch → `/docs` folder
> 3. Wait for deployment (2-3 minutes)
> 
> ---
> 
> ## 📈 Future Enhancements
> 
> - [ ] Code quality trends dashboard with charts
> - [ ] Team collaboration and commenting
> - [ ] Slack/Teams integration for alerts
> - [ ] JIRA/Trello ticket creation
> - [ ] Code quality badges for repositories
> - [ ] Support for JavaScript, Java, and other languages
> 
> ---
> 
> ## 📄 License
> 
> This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
> 
> ---
> 
> ## 👤 Author
> 
> **Penbeam** - [GitHub Profile](https://github.com/penbeam)
> 
> ---
> 
> ## 🙏 Acknowledgments
> 
> - [Hugging Face](https://huggingface.co/) - Pre-trained models
> - [Scikit-learn](https://scikit-learn.org/) - ML framework
> - [FastAPI](https://fastapi.tiangolo.com/) - API framework
> - [Render](https://render.com/) - Cloud deployment
> - [GitHub Pages](https://pages.github.com/) - Frontend hosting
> - [Prism.js](https://prismjs.com/) - Syntax highlighting
> 
> ---
> 
> ## 📊 Project Status
> 
> | Category | Status |
> |----------|--------|
> | Backend API | ✅ Live |
> | Frontend UI | ✅ Live |
> | ML Model | ✅ Trained (88-90% accuracy) |
> | Database | ✅ Connected |
> | Deployment | ✅ Complete |
> | Documentation | ✅ Complete |
> 
> ---
> 
> *Built with ❤️ to make code quality analysis accessible to everyone.*
