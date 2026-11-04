"""
Skrip pengujian inferensi model AI DERMAYU secara mandiri.
Penggunaan:
    python test_predict.py <path_gambar>
Contoh:
    python test_predict.py sample_banjir.jpg
"""

import sys
import os
import time

def test_local_model(image_path: str):
    if not os.path.exists(image_path):
        print(f"❌ Error: File gambar '{image_path}' tidak ditemukan.")
        return

    model_path = os.path.join(os.path.dirname(__file__), "model", "model_banjir_tflearning_fix_sementara.keras")
    if not os.path.exists(model_path):
        print(f"❌ Error: File model '{model_path}' tidak ditemukan.")
        return

    print("==========================================")
    print("🔬 DERMAYU AI - PENGUJIAN MODEL BANJIR CNN")
    print("==========================================")
    print(f"📁 Model : {model_path}")
    print(f"🖼️ Gambar: {image_path}")
    print("⏳ Memuat model ke memori...")

    import numpy as np
    from PIL import Image
    try:
        os.environ.setdefault("KERAS_BACKEND", "torch")
        import keras
    except ImportError:
        import tensorflow as tf
        keras = tf.keras

    t0 = time.time()
    model = keras.models.load_model(model_path, compile=False)
    load_time = time.time() - t0
    print(f"✅ Model berhasil dimuat dalam {load_time:.2f} detik.")

    # Preprocessing
    image = Image.open(image_path).convert("RGB").resize((128, 128))
    img_array = np.expand_dims(np.array(image, dtype=np.float32), axis=0)

    # Predict
    t_pred = time.time()
    pred = model.predict(img_array, verbose=0)
    inference_ms = int((time.time() - t_pred) * 1000)

    raw_prob = float(pred[0][0])
    prob_flood = float(1.0 - raw_prob)
    prob_non_flood = float(raw_prob)
    label = "flood" if prob_flood >= 0.65 else ("review" if prob_flood >= 0.35 else "non_flood")

    print("\n📊 HASIL INFERENSI:")
    print(f" - Prediksi Label       : {'🚨 BANJIR (flood)' if label == 'flood' else '✅ BUKAN BANJIR (non_flood)'}")
    print(f" - Probabilitas Banjir  : {prob_flood * 100:.2f}%")
    print(f" - Probabilitas Bukan   : {prob_non_flood * 100:.2f}%")
    print(f" - Waktu Inferensi      : {inference_ms} ms")
    print("==========================================")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Penggunaan: python test_predict.py <path_ke_file_gambar>")
    else:
        test_local_model(sys.argv[1])

