from ultralytics import YOLO
import cv2
import numpy as np
import os

class EyeAnalyzer:
    def __init__(self, model_path='runs/detect/eye_model/weights/best.pt'):
        # Fallback to yolov8n.pt if custom model doesn't exist yet (for demo purposes)
        if not os.path.exists(model_path):
            print(f"Warning: Model not found at {model_path}. Using 'yolov8n-face.pt' or standard 'yolov8n.pt' as fallback.")
            self.model = YOLO('yolov8n.pt') 
        else:
            self.model = YOLO(model_path)

    def analyze_image(self, image_path):
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Could not load image")

        # Run inference
        results = self.model(img)
        
        features = []
        
        for r in results:
            boxes = r.boxes
            for box in boxes:
                # Bounding box
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                w = x2 - x1
                h = y2 - y1
                
                # Extract eye region
                eye_region = img[int(y1):int(y2), int(x1):int(x2)]
                
                if eye_region.size == 0:
                    continue

                # Feature 1: Openness (Aspect Ratio)
                openness = h / w if w > 0 else 0
                
                # Feature 2: Brightness
                gray_eye = cv2.cvtColor(eye_region, cv2.COLOR_BGR2GRAY)
                brightness = np.mean(gray_eye)
                
                features.append({
                    'bbox': [float(x1), float(y1), float(x2), float(y2)],
                    'openness': float(openness),
                    'brightness': float(brightness),
                    'confidence': float(box.conf[0].cpu().numpy())
                })
        
        # Feature 3: Symmetry (Simple comparison if 2 eyes detected)
        symmetry_score = 1.0
        if len(features) == 2:
            # Sort by x coordinate to distinguish left/right
            features.sort(key=lambda x: x['bbox'][0])
            left = features[0]
            right = features[1]
            
            # Compare sizes
            w_l = left['bbox'][2] - left['bbox'][0]
            h_l = left['bbox'][3] - left['bbox'][1]
            w_r = right['bbox'][2] - right['bbox'][0]
            h_r = right['bbox'][3] - right['bbox'][1]
            
            size_diff = abs((w_l * h_l) - (w_r * h_r)) / ((w_l * h_l) + 1e-6)
            symmetry_score = max(0, 1.0 - size_diff)

        return {
            'eye_count': len(features),
            'features': features,
            'symmetry_score': symmetry_score
        }

if __name__ == "__main__":
    # Test
    analyzer = EyeAnalyzer('yolov8n.pt') # Use standard for test
    # print(analyzer.analyze_image('path/to/test.jpg'))
