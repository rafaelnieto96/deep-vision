document.addEventListener('DOMContentLoaded', function () {
    const promptInput = document.getElementById('prompt');
    const negativePromptInput = document.getElementById('negative-prompt');
    const styleInput = document.getElementById('style');
    const styleSelectorHeader = document.querySelector('#style-selector .style-selector-header');
    const styleOptions = document.querySelectorAll('#style-selector .style-option');
    const aspectRatioInput = document.getElementById('aspect-ratio');
    const ratioSelectorHeader = document.getElementById('ratio-selector-header');
    const ratioOptions = document.querySelectorAll('#ratio-selector .ratio-option');
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

    // Functions to handle loading state
    function setLoadingState(isLoading) {
        generateBtn.disabled = isLoading;
        if (isLoading) {
            loadingSpinner.classList.remove('hidden');
            generateBtn.classList.add('disabled');
            placeholder.innerHTML = `
                <i class="fas fa-cog fa-spin"></i>
                <p>Generating your image, please wait...</p>
                <p class="small-text">(This may take 5-10 seconds)</p>
            `;
            placeholder.classList.add('loading');
            placeholder.classList.remove('hidden');
            generatedImage.classList.add('hidden');
            downloadBtn.classList.add('hidden');
        } else {
            loadingSpinner.classList.add('hidden');
            generateBtn.classList.remove('disabled');
            placeholder.classList.remove('loading');
        }
    }

    function handleError(errorMessage) {
        console.error("Error:", errorMessage);
        placeholder.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>Error: ${errorMessage}</p>
        `;
        placeholder.classList.add('error');
        placeholder.classList.remove('hidden');
        generatedImage.classList.add('hidden');
        downloadBtn.classList.add('hidden');
        setLoadingState(false);
    }

    // Generate image
    generateBtn.addEventListener('click', async function () {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            handleError('Please describe what you want to see');
            return;
        }

        // Set loading state
        setLoadingState(true);

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
                // Set up image loading handlers
                generatedImage.onload = function () {
                    // Imagen cargada correctamente
                    placeholder.classList.add('hidden');
                    generatedImage.classList.remove('hidden');
                    downloadBtn.classList.remove('hidden');
                    setLoadingState(false);

                    // Ajustar el tamaño según el aspecto de la imagen real
                    const imgAspect = this.naturalWidth / this.naturalHeight;

                    if (imgAspect < 0.8) { // Imagen vertical
                        generatedImage.style.maxHeight = "95%";
                        generatedImage.style.maxWidth = "auto";
                    } else if (imgAspect > 1.2) { // Imagen horizontal
                        generatedImage.style.maxWidth = "95%";
                        generatedImage.style.maxHeight = "auto";
                    } else { // Imagen cuadrada
                        generatedImage.style.maxWidth = "95%";
                        generatedImage.style.maxHeight = "95%";
                    }
                };

                generatedImage.onerror = function () {
                    // Image failed to load
                    handleError('Could not load the generated image');
                };

                // Set the image source to trigger loading
                generatedImage.src = data.image_url;
            } else {
                throw new Error(data.error || 'Failed to generate image');
            }
        } catch (error) {
            handleError(error.message);
        }
    });

    // Download image
    downloadBtn.addEventListener('click', function () {
        if (generatedImage.complete && generatedImage.naturalHeight !== 0) {
            const link = document.createElement('a');
            link.href = generatedImage.src;
            link.download = 'deep-vision-generated-image.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('Please wait for the image to load completely before downloading.');
        }
    });
});