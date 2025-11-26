import os
import yaml

def create_yolo_structure(base_path):
    dirs = [
        'data/images/train',
        'data/images/val',
        'data/labels/train',
        'data/labels/val'
    ]
    
    for d in dirs:
        os.makedirs(os.path.join(base_path, d), exist_ok=True)
        print(f"Created directory: {os.path.join(base_path, d)}")

    # Create dataset.yaml
    data_yaml = {
        'path': os.path.abspath(os.path.join(base_path, 'data')),
        'train': 'images/train',
        'val': 'images/val',
        'names': {
            0: 'eye'
        }
    }
    
    yaml_path = os.path.join(base_path, 'dataset.yaml')
    with open(yaml_path, 'w') as f:
        yaml.dump(data_yaml, f)
    
    print(f"Created dataset.yaml at {yaml_path}")
    print("\nIMPORTANT: Please place your training images in 'data/images/train' and validation images in 'data/images/val'.")
    print("Corresponding YOLO format labels (txt files) should go in 'data/labels/train' and 'data/labels/val'.")
    print("Label format: <class_id> <x_center> <y_center> <width> <height> (normalized 0-1)")

if __name__ == "__main__":
    create_yolo_structure('.')
