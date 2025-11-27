from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys
import uuid
import cv2

# Add ml_pipeline to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from ml_pipeline.feature_extraction import EyeAnalyzer
from backend.firebase_utils import init_firebase, save_result, get_results

app = Flask(__name__)
CORS(app)

# Initialize
db = init_firebase()
# Initialize Analyzer (will use fallback if no model trained yet)
analyzer = EyeAnalyzer(os.path.join(os.path.dirname(__file__), '../ml_pipeline/runs/detect/eye_model/weights/best.pt'))

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/api/analyze', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    try:
        # Run analysis
        result = analyzer.analyze_image(filepath)
        
        # Draw bounding boxes
        img = cv2.imread(filepath)
        for feature in result['features']:
            bbox = feature['bbox']
            x1, y1, x2, y2 = int(bbox[0]), int(bbox[1]), int(bbox[2]), int(bbox[3])
            # Draw rectangle (Green, thickness 2)
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            # Add label
            label = f"Eye: {int(feature['confidence']*100)}%"
            cv2.putText(img, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
        marked_filename = f"marked_{filename}"
        marked_filepath = os.path.join(UPLOAD_FOLDER, marked_filename)
        cv2.imwrite(marked_filepath, img)
        
        # Add metadata
        result['filename'] = filename
        result['marked_filename'] = marked_filename
        
        # Save to DB
        doc_id = save_result(db, result)
        result['id'] = doc_id
        
        return jsonify(result)
    except Exception as e:
        print(f"Error analyzing image: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/results', methods=['GET'])
def list_results():
    results = get_results(db)
    return jsonify(results)

@app.route('/api/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
