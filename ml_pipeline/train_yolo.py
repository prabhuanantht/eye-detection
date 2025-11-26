from ultralytics import YOLO
import os

def train_model(data_yaml_path='dataset.yaml', epochs=10, img_size=640):
    # Load a model
    model = YOLO('yolov8n.pt')  # load a pretrained model (recommended for training)

    # Train the model
    print(f"Starting training with {data_yaml_path}...")
    results = model.train(data=data_yaml_path, epochs=epochs, imgsz=img_size, project='runs/detect', name='eye_model')
    
    print("Training complete.")
    print(f"Best model saved to {results.save_dir}/weights/best.pt")
    
    # Export the model
    success = model.export(format='onnx')
    print(f"Model exported to ONNX: {success}")

if __name__ == "__main__":
    if not os.path.exists('dataset.yaml'):
        print("dataset.yaml not found. Please run prepare_data.py first.")
    else:
        train_model()
