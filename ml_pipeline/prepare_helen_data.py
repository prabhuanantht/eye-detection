import os
import cv2
import numpy as np
import glob
import shutil

# Paths
DATASET_DIR = "helen_dataset" # Extracted folder name
OUTPUT_DIR = "data"
IMAGES_DIR = os.path.join(OUTPUT_DIR, "images")
LABELS_DIR = os.path.join(OUTPUT_DIR, "labels")

# Clean output directory
if os.path.exists(OUTPUT_DIR):
    shutil.rmtree(OUTPUT_DIR)

# Create directories
for split in ['train', 'val']:
    os.makedirs(os.path.join(IMAGES_DIR, split), exist_ok=True)
    os.makedirs(os.path.join(LABELS_DIR, split), exist_ok=True)

def convert_to_yolo(img_width, img_height, x_min, y_min, x_max, y_max):
    # YOLO format: class_id x_center y_center width height (normalized)
    x_center = (x_min + x_max) / 2.0 / img_width
    y_center = (y_min + y_max) / 2.0 / img_height
    width = (x_max - x_min) / img_width
    height = (y_max - y_min) / img_height
    return 0, x_center, y_center, width, height # class 0 for 'eye'

def process_data():
    # Search for .jpg files recursively
    image_files = glob.glob(f"{DATASET_DIR}/**/*.jpg", recursive=True)
    
    print(f"Found {len(image_files)} images.")
    
    processed_count = 0
    for i, img_path in enumerate(image_files):
        # Find corresponding .pts file
        # It could be .pts or .txt, but we saw .pts
        pts_path = os.path.splitext(img_path)[0] + ".pts"
        if not os.path.exists(pts_path):
            # Try .txt just in case
            pts_path = os.path.splitext(img_path)[0] + ".txt"
            if not os.path.exists(pts_path):
                # print(f"No landmarks found for {img_path}")
                continue
            
        # Read image to get dimensions
        img = cv2.imread(img_path)
        if img is None:
            print(f"Could not read image {img_path}")
            continue
        h, w = img.shape[:2]
        
        # Read landmarks
        landmarks = []
        try:
            with open(pts_path, 'r') as f:
                lines = f.readlines()
            
            # Parse .pts format
            # version: 1
            # n_points: 68
            # {
            # x y
            # ...
            # }
            
            start_parsing = False
            for line in lines:
                line = line.strip()
                if line == '{':
                    start_parsing = True
                    continue
                if line == '}':
                    break
                
                if start_parsing:
                    parts = line.split()
                    if len(parts) >= 2:
                        x, y = float(parts[0]), float(parts[1])
                        landmarks.append((x, y))
        except Exception as e:
            print(f"Error parsing {pts_path}: {e}")
            continue
                    
        if len(landmarks) != 68:
            # print(f"Invalid number of landmarks in {pts_path}: {len(landmarks)}")
            continue

        # Extract eye regions
        # Landmarks 37-42 (0-indexed: 36-41) are Left Eye
        # Landmarks 43-48 (0-indexed: 42-47) are Right Eye
        left_eye_pts = landmarks[36:42]
        right_eye_pts = landmarks[42:48]
        
        yolo_labels = []
        
        for pts in [left_eye_pts, right_eye_pts]:
            pts_np = np.array(pts)
            x_min = np.min(pts_np[:, 0])
            y_min = np.min(pts_np[:, 1])
            x_max = np.max(pts_np[:, 0])
            y_max = np.max(pts_np[:, 1])
            
            # Add some padding
            pad_x = (x_max - x_min) * 0.3
            pad_y = (y_max - y_min) * 0.3
            
            x_min = max(0, x_min - pad_x)
            y_min = max(0, y_min - pad_y)
            x_max = min(w, x_max + pad_x)
            y_max = min(h, y_max + pad_y)
            
            cls, xc, yc, bw, bh = convert_to_yolo(w, h, x_min, y_min, x_max, y_max)
            yolo_labels.append(f"{cls} {xc} {yc} {bw} {bh}")
            
        # Split into train/val (80/20)
        split = 'train' if i < len(image_files) * 0.8 else 'val'
        
        # Copy image
        shutil.copy(img_path, os.path.join(IMAGES_DIR, split, os.path.basename(img_path)))
        
        # Write label file
        label_filename = os.path.splitext(os.path.basename(img_path))[0] + ".txt"
        with open(os.path.join(LABELS_DIR, split, label_filename), 'w') as f:
            f.write('\n'.join(yolo_labels))
        
        processed_count += 1
            
    print(f"Data preparation complete. Processed {processed_count} images.")

if __name__ == "__main__":
    process_data()
