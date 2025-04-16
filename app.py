from flask import Flask, render_template, request, jsonify
import os
from dotenv import load_dotenv
import google.generativeai as genai

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
        style = data.get('style', 'fotorrealista')
        creativity = data.get('creativity', 5)

        if not prompt:
            return jsonify({'error': 'El prompt no puede estar vacío'}), 400

        # Construct the full prompt with style and creativity
        full_prompt = f"{prompt} en estilo {style}. Nivel de creatividad: {creativity}/10"
        if negative_prompt:
            full_prompt += f" Evitar: {negative_prompt}"

        # Generate image using Gemini
        model = genai.GenerativeModel('gemini-pro-vision')
        response = model.generate_content(full_prompt)
        
        # Return the generated image URL or data
        return jsonify({'image_url': response.image_url})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 