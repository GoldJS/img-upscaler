import os
import subprocess

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "output"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def upscale_image(input_path, output_path, scale_factor):
    """Calls the appropriate script for upscaling"""
    if scale_factor == 2:
        subprocess.run(["python", "sub.py", input_path, output_path], check=True)
    else:
        subprocess.run(["python", "main.py", input_path, output_path], check=True)

if __name__ == "__main__":
    print("This script is not meant to be run directly.")
