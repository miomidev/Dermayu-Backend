"""
DERMAYU - CNN AI Inference Service (FastAPI)
Microservice untuk validasi foto banjir menggunakan model CNN Keras (.h5)
Sesuai kontrak PRD Bab 9.3: POST /v1/predict
"""

import os
import time
import io
from fastapi import FastAPI, File, UploadFile, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np

# Config
INTERNAL_API_KEY = os.getenv("AI_INTERNAL_KEY", "internal_ai_secret_key_dermayu")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model_banjir_indramayu.h5")
MODEL_VERSION = "cnn-flood-indramayu-0.1.0"

app = FastAPI(
    title="DERMAYU AI Flood Classifier",
    description="Microservice validasi foto banjir Indramayu berbasis CNN",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model if available
model = None
try:
    if os.path.exists(MODEL_PATH):
        import tensorflow as tf
        model = tf.keras.models.load_model(MODEL_PATH)
        print(f"✅ Model CNN berhasil dimuat dari: {MODEL_PATH}")
    else:
        print(f"ℹ️ Model file belum ditemukan di {MODEL_PATH}. Berjalan dalam mode evaluasi/mock.")
except Exception as e:
    print(f"⚠️ Gagal memuat TensorFlow model: {e}. Menggunakan mode simulasi inferensi.")

def preprocess_image(image_bytes: bytes, target_size=(224, 224)):
    """Preprocess image for CNN inference"""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize(target_size)
    img_array = np.array(image, dtype=np.float32) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.get("/")
def health_check():
    return {
        "service": "DERMAYU AI Classifier",
        "status": "ready",
        "model_loaded": model is not None,
        "model_path": MODEL_PATH,
        "model_version": MODEL_VERSION,
    }

@app.post("/v1/predict")
async def predict_flood(
    file: UploadFile = File(...),
    authorization: str = Header(None),
):
    # Verify internal API key
    expected_token = f"Bearer {INTERNAL_API_KEY}"
    if not authorization or authorization != expected_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kunci autentikasi internal tidak valid",
        )

    start_time = time.time()
    contents = await file.read()

    try:
        if model is not None:
            # Real CNN inference
            input_data = preprocess_image(contents)
            pred = model.predict(input_data)
            
            # Binary classification (probability of flood)
            flood_prob = float(pred[0][0])
            non_flood_prob = 1.0 - flood_prob
        else:
            # Fallback/Simulation mode (when .h5 hasn't been copied from Colab yet)
            # Default simulated inference
            flood_prob = 0.88
            non_flood_prob = 0.12

        label = "flood" if flood_prob >= 0.50 else "non_flood"
        confidence = round(flood_prob if label == "flood" else non_flood_prob, 4)
        elapsed_ms = int((time.time() - start_time) * 1000)

        return {
            "label": label,
            "confidence": confidence,
            "probabilities": {
                "flood": round(flood_prob, 4),
                "non_flood": round(non_flood_prob, 4),
            },
            "model_version": MODEL_VERSION,
            "inference_ms": elapsed_ms,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Gagal memproses gambar: {str(e)}",
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
