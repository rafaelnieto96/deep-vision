import os
import base64
import traceback
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure Gemini API
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    print("ERROR: Missing GOOGLE_API_KEY environment variable")

client = genai.Client(api_key=GOOGLE_API_KEY)
MODEL_NAME = "gemini-2.0-flash-exp"

# Validate settings
VALID_STYLES = [
    'photorealistic', 'illustration', 'oil-painting', 'watercolor', 
    'pixel-art', 'abstract', 'anime', 'comic-book', 'minimalist', 
    'surrealism', 'pop-art', '3d-rendering', 'cyberpunk', 'fantasy', 'noir'
]
VALID_ASPECT_RATIOS = ['1:1', '3:4', '4:3', '9:16', '16:9']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_image():
    try:
        # Get and validate request data
        data = request.json
        if not data:
            return jsonify({'error': 'Invalid request: No JSON data provided'}), 400

        prompt = data.get('prompt', '').strip()
        negative_prompt = data.get('negative_prompt', '').strip()
        style = data.get('style', 'photorealistic').strip()
        aspect_ratio = data.get('aspect_ratio', '1:1').strip()
        creativity = data.get('creativity', 5)

        # Validate input values
        if not prompt:
            return jsonify({'error': 'Prompt cannot be empty'}), 400

        if style not in VALID_STYLES:
            style = 'photorealistic'

        if aspect_ratio not in VALID_ASPECT_RATIOS:
            aspect_ratio = '1:1'

        try:
            creativity = int(creativity)
            if creativity < 1 or creativity > 10:
                creativity = 5
        except (ValueError, TypeError):
            creativity = 5

        # Construct the image prompt
        full_prompt = f"Generate an image of {prompt} in {style} style with aspect ratio {aspect_ratio}"
        if negative_prompt:
            full_prompt += f". Avoid: {negative_prompt}"

        try:
            # Simplified Gemini API call (without problematic generation_config)
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["Text", "Image"]
                ),
            )
            
            # Process response from Gemini
            if response.parts:
                for part in response.parts:
                    if hasattr(part, 'image') and part.image:
                        image_data = part.image.data
                        img_str = base64.b64encode(image_data).decode('utf-8')
                        return jsonify({'image_url': f"data:image/png;base64,{img_str}"})
                
                # Return raw response structure when no image is found
                return jsonify({'error': f'No image in response: {str(response)}'}), 500
            else:
                # Return raw response structure
                return jsonify({'error': f'Empty response: {str(response)}'}), 500
            
        except Exception as model_error:
            # Return the raw API error without custom formatting
            return jsonify({'error': str(model_error)}), 500

    except Exception as e:
        # Only return the raw exception for other errors
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)