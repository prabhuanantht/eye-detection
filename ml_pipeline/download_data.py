import requests
import os
import zipfile

URL = "https://www.kaggle.com/api/v1/datasets/download/vietpro/helen-with-68-facial-landmarks"
OUTPUT_FILE = "helen_dataset.zip"

def download_file():
    print(f"Downloading from {URL}...")
    try:
        response = requests.get(URL, stream=True)
        response.raise_for_status()
        
        with open(OUTPUT_FILE, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print("Download complete.")
        
        print("Extracting...")
        with zipfile.ZipFile(OUTPUT_FILE, 'r') as zip_ref:
            zip_ref.extractall("helen_dataset")
        print("Extraction complete.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    download_file()
