import firebase_admin
from firebase_admin import credentials, firestore
import os

def init_firebase():
    if not firebase_admin._apps:
        cred_path = os.path.join(os.path.dirname(__file__), 'serviceAccountKey.json')
        if os.path.exists(cred_path) and os.path.getsize(cred_path) > 100: # Simple check if it's not the dummy one
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            print("Firebase initialized successfully.")
            return firestore.client()
        else:
            print("WARNING: serviceAccountKey.json not found or invalid. Firebase features will be disabled/mocked.")
            return None

def save_result(db, data):
    if db:
        doc_ref = db.collection('eye_analysis').document()
        # Create a copy to avoid modifying the original dictionary with the Sentinel
        data_to_save = data.copy()
        data_to_save['timestamp'] = firestore.SERVER_TIMESTAMP
        doc_ref.set(data_to_save)
        return doc_ref.id
    else:
        print("Mocking save to Firestore:", data)
        return "mock_id_123"

def get_results(db):
    if db:
        docs = db.collection('eye_analysis').order_by('timestamp', direction=firestore.Query.DESCENDING).stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            # Convert timestamp to string if it exists
            if 'timestamp' in data and data['timestamp']:
                # Firestore returns a datetime object (with timezone)
                data['timestamp'] = data['timestamp'].isoformat()
            results.append(data)
        return results
    else:
        return [
            {'id': 'mock_1', 'timestamp': '2023-10-27T10:00:00', 'eye_count': 2, 'symmetry_score': 0.95},
            {'id': 'mock_2', 'timestamp': '2023-10-26T09:30:00', 'eye_count': 1, 'symmetry_score': 0.0}
        ]
