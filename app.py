from flask import Flask, render_template, request, jsonify, send_file
import os
import base64
import io
import traceback
from PIL import Image
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
            
        # Convert creativity (1-10) to temperature (0.0-1.0)
        temperature = (creativity - 1) / 9  # Maps 1->0.0, 10->1.0
            
        # Debug prints for parameters
        print(f"DEBUG - Prompt: {prompt}")
        print(f"DEBUG - Negative prompt: {negative_prompt}")
        print(f"DEBUG - Style: {style}")
        print(f"DEBUG - Aspect ratio: {aspect_ratio}")
        print(f"DEBUG - Creativity: {creativity} (Temperature: {temperature:.2f})")

        # Construct the prompt with style
        full_prompt = f"{prompt} in {style} style"
        if negative_prompt:
            full_prompt += f". Avoid: {negative_prompt}"
            
        print(f"DEBUG - Full prompt being sent to Gemini: {full_prompt}")

        try:
            # Set up image generation config with aspect ratio parameter
            image_generation_config = {
                "aspectRatio": aspect_ratio  # Use the exact parameter name from the API
            }
            
            generation_config = types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE'],
                temperature=temperature,
                image_generation_config=image_generation_config
            )
            
            # Generate image with the aspect ratio parameter
            response = client.models.generate_content(
                model="gemini-2.0-flash-exp-image-generation",
                contents=full_prompt,
                config=generation_config
            )
            
            # Process the response to extract the image
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'text') and part.text:
                    print(f"DEBUG - Generated caption: {part.text}")
                if hasattr(part, 'inline_data') and part.inline_data:
                    mime_type = part.inline_data.mime_type
                    image_data = part.inline_data.data
                    img_str = base64.b64encode(image_data).decode('utf-8')
                    print(f"DEBUG - Successfully generated image with aspect ratio: {aspect_ratio}")
                    return jsonify({'image_url': f"data:{mime_type};base64,{img_str}"})
            
            print("DEBUG - No image data found in the response")
            return jsonify({'error': 'Failed to generate image: No image data was returned'}), 500
        
        except Exception as model_error:
            print(f"ERROR: Model generation failed: {str(model_error)}")
            traceback.print_exc()
            
            # Fallback method if parameter approach fails
            try:
                print("DEBUG - Falling back to including aspect ratio in prompt")
                fallback_prompt = f"{full_prompt} with {aspect_ratio} aspect ratio"
                
                response = client.models.generate_content(
                    model="gemini-2.0-flash-exp-image-generation",
                    contents=fallback_prompt,
                    config=types.GenerateContentConfig(
                        response_modalities=['TEXT', 'IMAGE'],
                        temperature=temperature
                    )
                )
                
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'inline_data') and part.inline_data:
                        mime_type = part.inline_data.mime_type
                        image_data = part.inline_data.data
                        img_str = base64.b64encode(image_data).decode('utf-8')
                        print(f"DEBUG - Successfully generated image using fallback method")
                        return jsonify({'image_url': f"data:{mime_type};base64,{img_str}"})
                
                return jsonify({'error': 'Failed to generate image with fallback method'}), 500
                
            except Exception as fallback_error:
                print(f"ERROR: Fallback generation failed: {str(fallback_error)}")
                if 'quota' in str(model_error).lower() or 'quota' in str(fallback_error).lower():
                    return jsonify({'error': 'API quota exceeded. Please try again later.'}), 429
                return jsonify({'error': f'Image generation failed: {str(model_error)}'}), 500

    except Exception as e:
        print(f"ERROR: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)