from flask import Flask, request, render_template, send_from_directory, jsonify
import os
from PIL import Image
import numpy as np
import torch
from basicsr.archs.rrdbnet_arch import RRDBNet
from realesrgan import RealESRGANer
import time
import uuid
from datetime import datetime, timedelta

app = Flask(__name__)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB limit
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['OUTPUT_FOLDER'] = 'outputs'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'webp'}
app.config['AUTO_CLEANUP_MINUTES'] = 60  # GDPR compliance

# Create directories if they don't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)

# Model paths
MODEL_PATHS = {
    2: 'models/RealESRGAN_x2plus.pth',
    4: 'models/RealESRGAN_x4plus.pth',
    6: 'models/RealESRGAN_x4plus.pth',  # Ensure these models exist
    8: 'models/RealESRGAN_x4plus.pth'   # Ensure these models exist
}

def check_gpu():
    if not torch.cuda.is_available():
        return False
    try:
        # Test if we can actually allocate memory on GPU
        torch.zeros(1).cuda()
        return True
    except Exception as e:
        print(f"GPU allocation error: {e}")
        return False

HAS_WORKING_GPU = check_gpu()

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def load_model(scale):
    """Load the appropriate model with GPU optimization"""
    device = torch.device('cuda' if HAS_WORKING_GPU else 'cpu')
    
    model = RRDBNet(
        num_in_ch=3, 
        num_out_ch=3, 
        num_feat=64, 
        num_block=23, 
        num_grow_ch=32, 
        scale=scale
    )
    
    state_dict = torch.load(MODEL_PATHS[scale], map_location=device)
    
    if 'params_ema' in state_dict:
        state_dict = state_dict['params_ema']
    model.load_state_dict(state_dict, strict=True)
    
    return RealESRGANer(
        scale=scale,
        model_path=MODEL_PATHS[scale],
        model=model,
        tile=0 if scale == 2 else 200,
        tile_pad=10,
        pre_pad=0,
        half=HAS_WORKING_GPU  # Only use half precision if GPU is available
    )

@app.route('/')
def index():
    return render_template('index.html', gpu_available=HAS_WORKING_GPU)

@app.route('/upscale', methods=['POST'])
def upscale_image():
    start_time = time.time()
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    scale = int(request.form.get('scale', 4))
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    # Generate clean output filename
    original_name = os.path.splitext(file.filename)[0]  # Remove extension
    safe_name = "".join([c for c in original_name if c.isalnum() or c in (' ', '-', '_')]).strip()
    output_filename = f"{safe_name}_x{scale}.png"
    output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
    
    # Temporary input path
    file_id = str(uuid.uuid4())
    input_ext = file.filename.rsplit('.', 1)[1].lower()
    input_path = os.path.join(app.config['UPLOAD_FOLDER'], f'{file_id}_input.{input_ext}')
    
    # Save uploaded file
    file.save(input_path)
    
    try:
        img = Image.open(input_path).convert('RGB')
        original_width, original_height = img.size
        
        if scale == 6:
            # First pass: 4x upscale
            upsampler4x = load_model(4)
            img_np = np.array(img)
            with torch.no_grad():
                output_4x, _ = upsampler4x.enhance(img_np, outscale=4)
            img_4x = Image.fromarray(output_4x)

            # Second pass: 2x upscale
            upsampler2x = load_model(2)
            img_np_4x = np.array(img_4x)
            with torch.no_grad():
                output_2x, _ = upsampler2x.enhance(img_np_4x, outscale=2)
            img_final = Image.fromarray(output_2x)

        elif scale == 8:
            # First pass: 4x upscale
            upsampler4x = load_model(4)
            img_np = np.array(img)
            with torch.no_grad():
                output_4x, _ = upsampler4x.enhance(img_np, outscale=4)
            img_4x = Image.fromarray(output_4x)

            # Second pass: another 4x upscale
            img_np_4x = np.array(img_4x)
            with torch.no_grad():
                output_4x_again, _ = upsampler4x.enhance(img_np_4x, outscale=4)
            img_final = Image.fromarray(output_4x_again)

        else:
            # Standard 2x or 4x upscale
            upsampler = load_model(scale)
            img_np = np.array(img)
            with torch.no_grad():
                output, _ = upsampler.enhance(img_np, outscale=scale)
            img_final = Image.fromarray(output)
        
        # Save the final output
        img_final.save(output_path, 'PNG', compress_level=1)
        
        # Calculate metrics
        processing_time = time.time() - start_time
        output_size = os.path.getsize(output_path) / (1024 * 1024)  # in MB
        
        return jsonify({
            'success': True,
            'url': f'/output/{output_filename}',
            'metrics': {
                'processing_time': round(processing_time, 2),
                'input_resolution': f"{original_width}×{original_height}",
                'output_resolution': f"{img_final.width}×{img_final.height}",
                'output_size': f"{output_size:.2f}MB",
                'scale_factor': scale,
                'model_architecture': "RRDBNet (23 blocks)",
                'technique': f"Multi-pass (4x→2x)" if scale == 6 else f"Multi-pass (4x→4x)" if scale == 8 else "Single-pass",
                'device_used': "GPU" if HAS_WORKING_GPU else "CPU"
            }
        })
        
    except Exception as e:
        print(f"Error during upscaling: {str(e)}")  # Log the error for debugging
        if os.path.exists(input_path):
            os.remove(input_path)
        if os.path.exists(output_path):
            os.remove(output_path)
        if HAS_WORKING_GPU:
            torch.cuda.empty_cache()
        return jsonify({'error': str(e)}), 500

@app.route('/output/<filename>')
def serve_output(filename):
    return send_from_directory(app.config['OUTPUT_FOLDER'], filename)

@app.route('/cleanup', methods=['POST'])
def cleanup_files():
    """Auto-delete files older than 1 hour"""
    now = datetime.now()
    for folder in [app.config['UPLOAD_FOLDER'], app.config['OUTPUT_FOLDER']]:
        for filename in os.listdir(folder):
            file_path = os.path.join(folder, filename)
            file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
            if now - file_time > timedelta(minutes=app.config['AUTO_CLEANUP_MINUTES']):
                os.remove(file_path)
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)
