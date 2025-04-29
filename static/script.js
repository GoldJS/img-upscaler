document.addEventListener('DOMContentLoaded', function() {
    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Check for saved preference or system preference
    if (localStorage.getItem('darkMode') === 'enabled' || 
        (localStorage.getItem('darkMode') !== 'disabled' && prefersDarkScheme.matches)) {
        document.body.classList.add('dark-mode');
    }

    // Toggle function
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
    });
    // DOM Elements
    const uploadBox = document.getElementById('upload-box');
    const fileInput = document.getElementById('file-input');
    const upscaleBtn = document.getElementById('upscale-btn');
    const originalImage = document.getElementById('original-image');
    const upscaledImage = document.getElementById('upscaled-image');
    const resultsSection = document.getElementById('results');
    const comparisonContainer = document.getElementById('comparison-container');
    const divider = document.getElementById('divider');
    const downloadBtn = document.getElementById('download-btn');
    const researchBtn = document.getElementById('research-btn');
    const researchModal = document.getElementById('research-modal');
    
    // Metrics elements
    const techniqueMetric = document.getElementById('technique-metric');
    const modelMetric = document.getElementById('model-metric');
    const timeMetric = document.getElementById('time-metric');
    const resolutionMetric = document.getElementById('resolution-metric');
    
    let currentFile = null;
    let isDragging = false;

    // Add this with your other modal functions
    function initHelpModal() {
        const helpBtn = document.getElementById('help-btn');
        const helpModal = document.getElementById('help-modal');
        const closeBtn = helpModal.querySelector('.close-btn');

        if (!helpBtn || !helpModal) return;

        const toggleHelpModal = (e) => {
            e.preventDefault();
            helpModal.classList.toggle('active');
            document.body.style.overflow = helpModal.classList.contains('active') ? 'hidden' : '';
        };

        helpBtn.addEventListener('click', toggleHelpModal);
        closeBtn.addEventListener('click', toggleHelpModal);
        
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                toggleHelpModal(e);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && helpModal.classList.contains('active')) {
                toggleHelpModal(e);
            }
        });
    }

    // Call this in your initEventListeners()
    initHelpModal();
    
    // Call this in your initEventListeners()
    initHelpModal();
    
    // Initialize event listeners
    function initEventListeners() {
        // Drag and Drop Handlers
        uploadBox.addEventListener('dragover', handleDragOver);
        uploadBox.addEventListener('dragleave', handleDragLeave);
        uploadBox.addEventListener('drop', handleDrop);
        
        // File Selection Handlers
        uploadBox.addEventListener('click', triggerFileInput);
        fileInput.addEventListener('change', handleFileInputChange);

        // Upscale Mode Change Handler
        const modeSelector = document.getElementById('mode');
        modeSelector.addEventListener('change', updateScaleOptions);
        
        // Upscale Button Handler
        upscaleBtn.addEventListener('click', upscaleImage);
        
        // Download Button Handler
        downloadBtn.addEventListener('click', downloadImage);
        
        // Research Button Handler
        researchBtn.addEventListener('click', toggleResearchModal);
        
        // Close Modal Handler
        document.querySelector('.close-btn').addEventListener('click', toggleResearchModal);
        
        // Close modal when clicking outside
        window.addEventListener('click', handleOutsideClick);
    }

    // Update Scale Options Function
    function updateScaleOptions() {
        const mode = document.getElementById('mode').value;
        const scaleDropdown = document.getElementById('scale');
        scaleDropdown.innerHTML = ''; // Clear existing options

        // Add options based on the selected mode
        if (mode === 'CPU') {
            scaleDropdown.innerHTML += '<option value="2">2× (RRDBNet)</option>';
            scaleDropdown.innerHTML += '<option value="4">4× (GAN-enhanced)</option>';
        } else if (mode === 'GPU') {
            scaleDropdown.innerHTML += '<option value="2">2× (RRDBNet)</option>';
            scaleDropdown.innerHTML += '<option value="4">4× (GAN-enhanced)</option>';
            scaleDropdown.innerHTML += '<option value="6">6× (Enhanced)</option>';
            scaleDropdown.innerHTML += '<option value="8">8× (4K Enhancement)</option>';
        }
    }
    
    // Initialize comparison slider
    function initComparisonSlider() {
        divider.addEventListener('mousedown', startDrag);
        divider.addEventListener('touchstart', startDrag);
    }

    // Drag and Drop Functions
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.add('dragover');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.remove('dragover');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    }

    // File Selection Functions
    function triggerFileInput() {
        fileInput.click();
    }

    function handleFileInputChange() {
        if (fileInput.files.length) {
            handleFileSelection(fileInput.files[0]);
        }
    }

    function handleFileSelection(file) {
        // Validate file type
        if (!file.type.match('image.*')) {
            showNotification('Please select an image file (JPEG, PNG, etc.)', 'error');
            return;
        }
        
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            showNotification('File size exceeds 10MB limit', 'error');
            return;
        }
        
        currentFile = file;
        updateUploadBox(file);
        
        // Display preview
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage.src = e.target.result;
            resultsSection.classList.remove('hidden');
            comparisonContainer.classList.add('hidden');
            
            // Enable upscale button
            upscaleBtn.disabled = false;
            
            // Reset metrics and download button
            resetMetrics();
            downloadBtn.disabled = true;
        };
        reader.readAsDataURL(file);
    }

    function updateUploadBox(file) {
        uploadBox.innerHTML = `
            <div class="file-display">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                    <polyline points="16 5 22 5 22 11"></polyline>
                    <line x1="15" y1="9" x2="22" y2="2"></line>
                </svg>
                <strong>${file.name}</strong>
                <span>${(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <p class="file-size-limit">Click to change file</p>
            <input type="file" id="file-input" accept="image/*">
        `;
        
        // Reattach event listeners
        document.getElementById('file-input').addEventListener('change', handleFileInputChange);
        uploadBox.addEventListener('click', triggerFileInput);
    }

    // Comparison Slider Functions
    function startDrag(e) {
        e.preventDefault();
        isDragging = true;
        document.body.style.cursor = 'ew-resize';
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    }

    function drag(e) {
        if (!isDragging) return;
        
        const container = document.querySelector('.comparison-wrapper');
        const containerRect = container.getBoundingClientRect();
        let posX = (e.clientX || e.touches[0].clientX) - containerRect.left;
        posX = Math.max(0, Math.min(posX, containerRect.width));
        
        const percentage = (posX / containerRect.width) * 100;
        divider.style.left = `${percentage}%`;
        upscaledImage.style.clipPath = `inset(0 0 0 ${percentage}%)`;
    }

    function stopDrag() {
        isDragging = false;
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
    }

    // Upscale Function
    function upscaleImage() {
        if (!currentFile) return;
        
        const scale = document.getElementById('scale').value;
        const mode = document.getElementById('mode').value;
        const force_cpu = mode === 'CPU';
        
        // Show loading state
        upscaleBtn.classList.add('processing');
        upscaleBtn.disabled = true;
        
        // Prepare form data
        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('scale', scale);
        formData.append ('force_cpu', force_cpu);
        
        // Send to server
        fetch('/upscale', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { 
                    throw new Error(err.error || 'Server error') 
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Display upscaled image
            upscaledImage.src = data.url;
            comparisonContainer.classList.remove('hidden');
            initComparisonSlider();
            
            // Update metrics
            techniqueMetric.textContent = data.metrics.technique;
            modelMetric.textContent = data.metrics.model_architecture;
            timeMetric.textContent = `${data.metrics.processing_time}s`;
            resolutionMetric.textContent = `${data.metrics.input_resolution} → ${data.metrics.output_resolution}`;
            
            // Enable download button
            downloadBtn.disabled = false;
            downloadBtn.setAttribute('data-url', data.url);
            downloadBtn.setAttribute('data-filename', `upscaled_${scale}x_${currentFile.name.split('.')[0]}.png`);
            
            showNotification('Image upscaled successfully!', 'success');
        })
        .catch(error => {
            showNotification('Error during upscaling: ' + error.message, 'error');
            console.error('Error:', error);
        })
        .finally(() => {
            upscaleBtn.classList.remove('processing');
            upscaleBtn.disabled = false;
        });
    }

    // Download Function
    function downloadImage() {
        const url = downloadBtn.getAttribute('data-url');
        const filename = downloadBtn.getAttribute('data-filename');
        
        if (!url) return;
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Modal Functions
    function toggleResearchModal(e) {
        e.preventDefault();
        const modal = document.getElementById('research-modal');
        const scrollY = window.scrollY || window.pageYOffset;

        document.body.classList.toggle('modal-open');
        modal.classList.toggle('active');
        
        // Toggle body overflow and position to prevent scrolling
        if (modal.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = '$(scrollY)px';
            document.body.style.width = '100%';
        } else {
            const scrollY = parseInt(document.body.style.top || '0');
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            window.scrollTo(0, Math.abs(scrollY));
        }
    }

    function handleOutsideClick(e) {
        if (e.target === document.getElementById('research-modal')) {
            toggleResearchModal(e);
        }
    }

    // Initialize Modal Event Listeners
    function initModal() {
        const researchBtn = document.getElementById('research-btn');
        const closeBtn = document.querySelector('.close-btn');
        const modal = document.getElementById('research-modal');
        
        if (researchBtn && closeBtn && modal) {
            researchBtn.addEventListener('click', toggleResearchModal);
            closeBtn.addEventListener('click', toggleResearchModal);
            window.addEventListener('click', handleOutsideClick);
            
            // ESC key to close modal
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    toggleResearchModal(e);
                }
            });
        }
    }

    // Call this in your initEventListeners function
    initModal();

    // Helper Functions
    function resetMetrics() {
        techniqueMetric.textContent = '-';
        modelMetric.textContent = '-';
        timeMetric.textContent = '-';
        resolutionMetric.textContent = '-';
    }

    function showNotification(message, type = 'error') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : '⚠️';
        
        notification.innerHTML = `
            <span>${icon}</span>
            <span>${message}</span>
            <span class="notification-close">&times;</span>
        `;
        
        container.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        });
    }

    // Initialize everything
    initEventListeners();
});
