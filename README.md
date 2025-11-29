# Eye Detection Full-Stack App

A complete full-stack application that detects eye regions from face images using a trained YOLOv8 model, extracts features (shape, symmetry, openness, brightness), and presents results through a modern web interface.

## Project Structure

- **`backend/`**: Flask REST API handling image uploads, processing, and Firebase integration.
- **`frontend/`**: React + Vite application for the user interface.
- **`ml_pipeline/`**: Python scripts for YOLOv8 model training and feature extraction logic.

## Prerequisites

Before running the application, ensure you have the following installed:

- **Python 3.8+**
- **Node.js** (v16+ recommended) & **npm** (or pnpm/yarn)
- **Firebase Account** (for Firestore database)

## Installation & Configuration

### 1. Clone the Repository

```bash
git clone <repository-url>
cd eye-detection-app
```

### 2. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Create a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Firebase Configuration**:
    -   Go to your Firebase Console -> Project Settings -> Service Accounts.
    -   Generate a new private key.
    -   Rename the downloaded JSON file to `serviceAccountKey.json`.
    -   Place `serviceAccountKey.json` inside the `backend/` directory.

### 3. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```

2.  Install Node dependencies:
    ```bash
    npm install
    # OR if using pnpm
    pnpm install
    ```

### 4. ML Pipeline Setup (Optional for Running, Required for Training)

If you need to retrain the model or run standalone scripts:

1.  Navigate to the ml_pipeline directory:
    ```bash
    cd ../ml_pipeline
    ```

2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## Execution Guide

### Running the Application

You need to run both the backend and frontend servers simultaneously.

#### Step 1: Start the Backend Server

1.  Open a terminal and navigate to `backend/`:
    ```bash
    cd backend
    ```
2.  Activate your virtual environment (if created).
3.  Run the Flask app:
    ```bash
    python app.py
    ```
    *The server will start at `http://127.0.0.1:5000`.*

#### Step 2: Start the Frontend Development Server

1.  Open a **new** terminal window and navigate to `frontend/`:
    ```bash
    cd frontend
    ```
2.  Start the Vite server:
    ```bash
    npm run dev
    ```
3.  Open the URL shown in the terminal (usually `http://localhost:5173`) in your browser.

### Using the App

1.  **Upload**: Click the upload area or drag & drop a face image (JPG/PNG).
2.  **Analysis**: The app will send the image to the backend.
    -   The backend uses the YOLOv8 model to detect eyes.
    -   Features (openness, symmetry, etc.) are calculated.
    -   Results are stored in Firebase.
3.  **Results**: The analysis results will be displayed on the screen.

## API Endpoints

-   `POST /api/analyze`: Uploads an image for analysis.
    -   **Body**: `multipart/form-data` with key `image`.
-   `GET /api/results`: Retrieves past analysis results from Firebase.
-   `GET /api/uploads/<filename>`: Serves uploaded images.

## Troubleshooting

-   **Firebase Error**: Ensure `serviceAccountKey.json` is valid and in the correct `backend/` folder.
-   **Model Not Found**: The backend expects the trained model at `../ml_pipeline/runs/detect/eye_model/weights/best.pt`. If running for the first time without training, you might need to adjust the path or train a model first.
-   **CORS Issues**: The frontend is configured to proxy `/api` requests to `http://127.0.0.1:5000`. Ensure the backend is running on port 5000.

## Model Limitations

The current eye detection model is trained on the **Helen Dataset**, which primarily consists of high-quality, centered, full-face portraits. As a result, the model has the following known limitations:

1.  **Partial Faces**: The model relies on "face context" (nose, mouth, chin) to confirm the presence of eyes. It may fail to detect eyes in images containing only a part of the face (e.g., top half only).
2.  **Multiple Faces / Crowds**: The model is optimized for single-subject portraits. It may struggle to detect all eyes in group photos or crowd shots where faces are small or scattered.
3.  **Distance**: Eyes in faces that are far away or very small in the frame may not be detected.
4.  **Occlusions**: Heavy occlusion (sunglasses, hair covering eyes) may prevent detection.

**Note**: These limitations are due to the specific nature of the training data. Retraining with a more diverse dataset (like WIDER Face) or using aggressive data augmentation (Mosaic, Random Crop) can improve robustness in these scenarios.
