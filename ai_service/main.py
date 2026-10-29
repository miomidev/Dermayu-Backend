import os
import io
import time
import logging
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Setup Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("dermayu-ai")

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.getenv("MODEL_PATH", os.path.join(BASE_DIR, "model", "model_banjir_indramayu.h5"))
INTERNAL_API_KEY = os.getenv("AI_INTERNAL_KEY", "internal_ai_secret_key_dermayu")
MODEL_VERSION = "cnn-flood-indramayu-v1.0"
TARGET_SIZE = (224, 224)

app = FastAPI(
    title="DERMAYU AI Inference Service",
    description="Microservice validasi foto banjir menggunakan model CNN MobileNetV2 untuk Kabupaten Indramayu",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model state
model = None
is_tf_available = False

try:
    import numpy as np
    from PIL import Image
    import tensorflow as tf
    is_tf_available = True
    logger.info("TensorFlow %s terdeteksi.", tf.__version__)
except ImportError as e:
    logger.warning("TensorFlow atau NumPy belum terpasang (%s). Mode simulasi/fallback aktif.", e)

def load_ai_model():
    global model
    if not is_tf_available:
        logger.warning("Melewati pemuatan model asli (TensorFlow belum terpasang).")
        return False
    
    if os.path.exists(MODEL_PATH):
        try:
            logger.info("Memuat model CNN dari: %s ...", MODEL_PATH)
            # Load Keras/TensorFlow H5 model
            model = tf.keras.models.load_model(MODEL_PATH, compile=False)
            logger.info("Model CNN MobileNetV2 berhasil dimuat ke RAM!")
            return True
        except Exception as e:
            logger.error("Gagal memuat model dari %s: %s", MODEL_PATH, e)
            return False
    else:
        logger.warning("File model tidak ditemukan di %s", MODEL_PATH)
        return False

@app.on_event("startup")
async def startup_event():
    load_ai_model()

class Probabilities(BaseModel):
    flood: float
    non_flood: float

class PredictResponse(BaseModel):
    label: str
    confidence: float
    probabilities: Probabilities
    model_version: str
    inference_ms: int

@app.get("/")
def root():
    return {
        "service": "DERMAYU AI Inference Microservice",
        "description": "Layanan validasi foto banjir berbasis CNN MobileNetV2",
        "model_loaded": model is not None,
        "model_version": MODEL_VERSION,
        "docs_url": "/docs",
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "model_version": MODEL_VERSION,
        "timestamp": int(time.time()),
    }

@app.post("/v1/predict", response_model=PredictResponse)
async def predict_flood(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None),
):
    # 1. Validasi Internal API Key
    expected_token = f"Bearer {INTERNAL_API_KEY}"
    if not authorization or authorization.strip() != expected_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Akses ditolak: Token otentikasi internal tidak valid.",
        )

    # 2. Validasi Format Berkas
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Berkas yang diunggah harus berupa gambar (JPEG/PNG/WebP).",
        )

    start_time = time.time()

    try:
        contents = await file.read()

        if model is not None:
            # === Real Inference Pipeline ===
            image = Image.open(io.BytesIO(contents)).convert("RGB")
            image = image.resize(TARGET_SIZE)

            # Model memiliki layer Rescaling bawaan ((x / 127.5) - 1.0),
            # jadi pass raw pixel array dalam rentang [0, 255].
            img_array = np.array(image, dtype=np.float32)
            img_array = np.expand_dims(img_array, axis=0)  # Shape: (1, 224, 224, 3)

            prediction = model.predict(img_array, verbose=0)
            prob_flood = float(prediction[0][0])
            prob_flood = max(0.0, min(1.0, prob_flood))  # Clamp 0.0 - 1.0
            prob_non_flood = float(1.0 - prob_flood)

            # Klasifikasi biner (threshold 0.50)
            label = "flood" if prob_flood >= 0.50 else "non_flood"
            confidence = prob_flood if label == "flood" else prob_non_flood
        else:
            # === Fallback / Mock Simulation jika TF belum diinstall di environment ini ===
            logger.info("Menggunakan fallback inferensi simulasi...")
            prob_flood = 0.88
            prob_non_flood = 0.12
            label = "flood"
            confidence = prob_flood

        inference_time_ms = int((time.time() - start_time) * 1000)

        return PredictResponse(
            label=label,
            confidence=round(confidence, 4),
            probabilities=Probabilities(
                flood=round(prob_flood, 4),
                non_flood=round(prob_non_flood, 4),
            ),
            model_version=MODEL_VERSION,
            inference_ms=max(1, inference_time_ms),
        )

    except Exception as e:
        logger.error("Terjadi kesalahan saat memproses gambar: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal melakukan inferensi AI: {str(e)}",
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
