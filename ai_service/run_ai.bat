@echo off
title DERMAYU - AI Inference Microservice (FastAPI + MobileNetV2)
echo ========================================================
echo   DERMAYU - Dering Evakuasi & Respons Masyarakat
echo   AI Inference Service (CNN MobileNetV2 Indramayu)
echo ========================================================
echo.

cd /d "%~dp0"

if exist venv\Scripts\activate.bat (
    echo [INFO] Mengaktifkan virtual environment (venv)...
    call venv\Scripts\activate.bat
) else (
    echo [WARN] Virtual environment tidak ditemukan. Menggunakan Python global...
)

echo [INFO] Menjalankan server FastAPI di http://127.0.0.1:8000 ...
echo [INFO] Tekan CTRL + C untuk menghentikan server.
echo.

python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

pause

