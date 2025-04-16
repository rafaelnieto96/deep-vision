from flask import Flask, render_template, request, jsonify, send_file
import os
import base64
import io
from PIL import Image
from dotenv import load_dotenv
import google.generativeai as genai
from google.generativeai import types

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure Gemini API
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=GOOGLE_API_KEY)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_image():
    try:
        data = request.json
        prompt = data.get('prompt')
        negative_prompt = data.get('negative_prompt', '')
        style = data.get('style', 'photorealistic')
        aspect_ratio = data.get('aspect_ratio', '1:1')
        creativity = data.get('creativity', 5)

        if not prompt:
            return jsonify({'error': 'Prompt cannot be empty'}), 400

        # Construct the full prompt with style and creativity
        full_prompt = f"{prompt} in {style} style. Creativity level: {creativity}/10"
        if negative_prompt:
            full_prompt += f" Avoid: {negative_prompt}"

        # Create Gemini client
        client = genai.Client()

        # Generate image using the free Gemini model
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp-image-generation",
            contents=full_prompt,
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE']
            )
        )
        
        for part in response.candidates[0].content.parts:
            if part.inline_data is not None:
                # Convert inline data to base64 for frontend display
                img_str = base64.b64encode(part.inline_data.data).decode()
                return jsonify({'image_url': f"data:image/png;base64,{img_str}"})
        
        return jsonify({'error': 'Failed to generate image'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)