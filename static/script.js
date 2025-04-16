document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const promptInput = document.getElementById('prompt');
    const negativePromptInput = document.getElementById('negative-prompt');
    const styleSelect = document.getElementById('style');
    const creativitySlider = document.getElementById('creativity');
    const creativityValue = document.getElementById('creativity-value');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const generatedImage = document.getElementById('generated-image');
    const placeholder = document.querySelector('.placeholder');
    const loadingSpinner = document.querySelector('.loading-spinner');

    // Update creativity value display
    creativitySlider.addEventListener('input', function() {
        creativityValue.textContent = this.value;
    });

    // Generate image
    generateBtn.addEventListener('click', async function() {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            alert('Por favor, describe lo que quieres ver');
            return;
        }

        // Show loading state
        generateBtn.disabled = true;
        loadingSpinner.classList.remove('hidden');
        placeholder.classList.add('hidden');
        generatedImage.classList.add('hidden');
        downloadBtn.classList.add('hidden');

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt,
                    negative_prompt: negativePromptInput.value.trim(),
                    style: styleSelect.value,
                    creativity: parseInt(creativitySlider.value)
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Display generated image
                generatedImage.src = data.image_url;
                generatedImage.classList.remove('hidden');
                downloadBtn.classList.remove('hidden');
            } else {
                throw new Error(data.error || 'Error al generar la imagen');
            }
        } catch (error) {
            alert('Error: ' + error.message);
            placeholder.classList.remove('hidden');
        } finally {
            // Reset loading state
            generateBtn.disabled = false;
            loadingSpinner.classList.add('hidden');
        }
    });

    // Download image
    downloadBtn.addEventListener('click', function() {
        const link = document.createElement('a');
        link.href = generatedImage.src;
        link.download = 'deep-vision-generated-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Add animation to input elements
    const inputElements = document.querySelectorAll('textarea, select, input');
    inputElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-5px)';
        });

        element.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
}); 