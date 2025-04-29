# 🖼️ AI Image Upscaler (Offline + GPU Accelerated)

Welcome to the **AI Image Upscaler**, a powerful offline tool for enhancing low-resolution images using AI (CNNs + GANs). This app supports up to **8x upscaling** and runs on your device using GPU acceleration if available. It prioritizes **privacy**, **speed**, and **usability**.

## 🚀 Features
- ✅ **2x, 4x, 6x, 8x upscaling** using RealESRGAN
- 🔐 **Offline** & privacy-friendly (no cloud upload)
- ⚡ **GPU acceleration** with CPU fallback
- 🖱️ **Drag & drop** UI
- 📊 **Comparison slider** and quality metrics
- 🌙 **Dark mode** with preference memory
- 📎 **Supports PNG, JPG, JPEG, WEBP**

## 🧰 Tech Stack

### Backend
- Python 3.8+
- Flask (API server)
- PyTorch + RealESRGAN
- Pillow, NumPy

### Frontend
- HTML + CSS + JavaScript (Vanilla)
- Responsive UI, Dark Mode
- Interactive comparison slider

## 🖥️ Installation

### 🔧 Backend Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/yourusername/ai-image-upscaler.git
   cd ai-image-upscaler
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # on Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Download pretrained models** (RealESRGAN)
   - Place them in a `/models` folder inside the project.
   - Supported models:
     - `RealESRGAN_x2plus.pth`
     - `RealESRGAN_x4plus.pth`

5. **Run the server**
   ```bash
   python app.py
   ```

> ⚠️ **Note on GPU Acceleration**
>
> To use GPU mode, make sure your system:
> - Has an **NVIDIA GPU**
> - Has the **CUDA Toolkit** and **cuDNN** installed
> - Is using a **compatible version of PyTorch** with CUDA support
>
> Otherwise, the app will automatically fall back to CPU mode.
>
> You can check if PyTorch detects CUDA with:
> ```python
> python -c "import torch; print(torch.cuda.is_available())"
> ```

> App will run at `http://127.0.0.1:5000`

## 💻 Frontend Setup

No extra build tools required. Frontend is served via Flask.

#### 🖼 Usage
1. Open your browser and go to `http://localhost:5000`
2. Upload an image (PNG, JPG, JPEG, or WEBP)
3. Choose:
   - **Mode**: CPU or GPU
   - **Scale**: 2x, 4x, 6x, or 8x
4. Click **Upscale**
5. View results with **before/after comparison slider**
6. Click **Download** to save the upscaled image

## 📂 Project Structure

```
├── app.py                  # Flask backend
├── templates/
│   └── index.html          # Frontend HTML
├── static/
│   └── script.js           # Frontend JavaScript
├── uploads/                # Temporary uploaded images
├── outputs/                # Upscaled image output
├── models/                 # Pretrained model weights
├── requirements.txt        # Python dependencies
├── requirements.md         # Project spec requirements
└── README.md
```

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/awesome-feature`
3. Commit your changes: `git commit -m 'Add awesome feature'`
4. Push to the branch: `git push origin feature/awesome-feature`
5. Open a Pull Request

## 🛡️ Privacy & Compliance

This tool is built to be **GDPR-compliant**:
- All processing is done **locally**
- Uploaded and output files are **auto-deleted after 60 minutes**
- No cloud usage, no tracking, no telemetry

## 📜 License

MIT License. Use it freely, contribute, or repurpose with attribution.

## 🙌 Acknowledgements

- [RealESRGAN](https://github.com/xinntao/Real-ESRGAN)
- Open source community ❤️
- University of Bolton — SWE6010 Project

## 📧 Contact

Made with 💻 by Isa
📬 Email: isayusuf0416@gmail.com
