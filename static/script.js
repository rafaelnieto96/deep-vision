document.addEventListener('DOMContentLoaded', function () {
    const promptInput = document.getElementById('prompt');
    const negativePromptInput = document.getElementById('negative-prompt');
    const styleInput = document.getElementById('style');
    const styleSelectorHeader = document.querySelector('.style-selector-header');
    const styleOptions = document.querySelectorAll('.style-option');
    const aspectRatioInput = document.getElementById('aspect-ratio');
    const ratioSelectorHeader = document.getElementById('ratio-selector-header');
    const ratioOptions = document.querySelectorAll('#ratio-selector-header + .style-selector-dropdown .style-option');
    const creativitySlider = document.getElementById('creativity');
    const creativityValue = document.getElementById('creativity-value');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const generatedImage = document.getElementById('generated-image');
    const placeholder = document.querySelector('.placeholder');
    const loadingSpinner = document.querySelector('.loading-spinner');

    // Style selector functionality
    styleSelectorHeader.addEventListener('click', function () {
        this.classList.toggle('open');
        this.nextElementSibling.classList.toggle('open');
    });

    // Ratio selector functionality
    ratioSelectorHeader.addEventListener('click', function () {
        this.classList.toggle('open');
        this.nextElementSibling.classList.toggle('open');
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function (event) {
        const styleSelector = event.target.closest('.style-selector');
        document.querySelectorAll('.style-selector-header').forEach(header => {
            if (styleSelector !== header.parentElement) {
                header.classList.remove('open');
                header.nextElementSibling.classList.remove('open');
            }
        });
    });

    // Handle style selection
    styleOptions.forEach(option => {
        option.addEventListener('click', function () {
            // Update active class
            styleOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            // Update header text and hidden input
            const selectedText = this.textContent;
            const selectedValue = this.getAttribute('data-value');

            // Update header content
            styleSelectorHeader.innerHTML = selectedText + '<span class="icon">▼</span>';

            // Update hidden input value
            styleInput.value = selectedValue;

            // Close dropdown
            this.parentElement.classList.remove('open');
            styleSelectorHeader.classList.remove('open');
        });
    });

    // Handle aspect ratio selection
    ratioOptions.forEach(option => {
        option.addEventListener('click', function () {
            // Update active class
            ratioOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            // Update header text and hidden input
            const selectedText = this.textContent;
            const selectedValue = this.getAttribute('data-value');

            // Update header content
            ratioSelectorHeader.innerHTML = selectedText + '<span class="icon">▼</span>';

            // Update hidden input value
            aspectRatioInput.value = selectedValue;

            // Close dropdown
            this.parentElement.classList.remove('open');
            ratioSelectorHeader.classList.remove('open');
        });
    });

    // Update creativity value display
    creativitySlider.addEventListener('input', function () {
        creativityValue.textContent = this.value;
    });

    // Generate image
    generateBtn.addEventListener('click', async function () {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            alert('Please describe what you want to see');
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
                    style: styleInput.value,
                    aspect_ratio: aspectRatioInput.value,
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
                throw new Error(data.error || 'Error generating image');
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
    downloadBtn.addEventListener('click', function () {
        const link = document.createElement('a');
        link.href = generatedImage.src;
        link.download = 'deep-vision-generated-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});

