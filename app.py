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

MODEL_NAME = "models/imagen-3.0-generate-002"

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
            print(f"WARNING: Invalid style '{style}', defaulting to 'photorealistic'")
            style = 'photorealistic'

        if aspect_ratio not in VALID_ASPECT_RATIOS:
            print(f"WARNING: Invalid aspect ratio '{aspect_ratio}', defaulting to '1:1'")
            aspect_ratio = '1:1'

        try:
            creativity = int(creativity)
            if creativity < 1 or creativity > 10:
                print(f"WARNING: Invalid creativity level {creativity}, defaulting to 5")
                creativity = 5
        except (ValueError, TypeError):
            print(f"WARNING: Invalid creativity value '{creativity}', defaulting to 5")
            creativity = 5
            
        # Debug prints for parameters
        print(f"DEBUG - Prompt: {prompt}")
        print(f"DEBUG - Negative prompt: {negative_prompt}")
        print(f"DEBUG - Style: {style}")
        print(f"DEBUG - Aspect ratio: {aspect_ratio}")
        print(f"DEBUG - Creativity: {creativity}")
        print(f"DEBUG - Using model: {MODEL_NAME}")

        # Construct the image prompt
        # Imagen only works with English, so we might need to translate non-English prompts
        # For this example, I'll keep the prompt as is
        full_prompt = f"{prompt} in {style} style"
        if negative_prompt:
            full_prompt += f". Avoid: {negative_prompt}"
            
        print(f"DEBUG - Full prompt being sent to Imagen: {full_prompt}")

        try:
            # Configuración correcta para Imagen
            imagen_config = types.GenerateImagesConfig(
                number_of_images=1,
                aspectRatio=aspect_ratio
            )
            
            # Método correcto con el modelo correcto
            imagen_response = client.models.generate_images(
                model=MODEL_NAME,
                prompt=full_prompt,
                config=imagen_config
            )
            
            # Procesar la respuesta de Imagen
            if imagen_response.generated_images:
                image_data = imagen_response.generated_images[0].image.image_bytes
                img_str = base64.b64encode(image_data).decode('utf-8')
                print(f"DEBUG - Successfully generated image with Imagen")
                return jsonify({'image_url': f"data:image/png;base64,{img_str}"})
            
            print("DEBUG - Imagen model didn't return any images")
            return jsonify({'error': 'Failed to generate image: No image data was returned'}), 500
            
        except Exception as model_error:
            print(f"ERROR: Image generation failed: {str(model_error)}")
            error_message = str(model_error)
            
            if 'not available in your country' in error_message.lower():
                return jsonify({'error': 'Image generation is not available in your region. This is a Google API restriction.'}), 400
            elif 'quota' in error_message.lower():
                return jsonify({'error': 'API quota exceeded. Please try again later.'}), 429
            else:
                return jsonify({'error': f'Image generation failed: {error_message}'}), 500

    except Exception as e:
        print(f"ERROR: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)