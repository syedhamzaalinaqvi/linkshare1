// Enhanced add group functionality with image extraction
class GroupSubmissionHandler {
    constructor() {
        this.isExtracting = false;
        this.extractedData = null;
    }

    async extractGroupInfo(whatsappUrl) {
        if (!whatsappUrl || this.isExtracting) return null;

        this.isExtracting = true;
        this.showExtractionProgress('Extracting group information...');

        try {
            const response = await fetch('/api/extract-group-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    link: whatsappUrl
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.extractedData = data.data;
                this.populateFormWithExtractedData();
                this.showExtractionSuccess();
                return data.data;
            } else {
                this.showExtractionError(data.error);
                return null;
            }
        } catch (error) {
            this.showExtractionError(`Network error: ${error.message}`);
            return null;
        } finally {
            this.isExtracting = false;
        }
    }

    populateFormWithExtractedData() {
        if (!this.extractedData) return;

        // Auto-fill title if extracted and field is empty
        const titleField = document.querySelector('#groupTitle, #title, [name="title"]');
        if (titleField && !titleField.value && this.extractedData.title) {
            titleField.value = this.extractedData.title;
        }

        // Auto-fill description if extracted and field is empty
        const descField = document.querySelector('#groupDescription, #description, [name="description"]');
        if (descField && !descField.value && this.extractedData.description) {
            descField.value = this.extractedData.description;
        }

        // Show image preview if extracted
        if (this.extractedData.image) {
            this.showImagePreview(this.extractedData.image);
        }
    }

    showImagePreview(imageData) {
        // Create or update image preview
        let preview = document.getElementById('extractedImagePreview');
        if (!preview) {
            preview = document.createElement('div');
            preview.id = 'extractedImagePreview';
            preview.className = 'extracted-image-preview';
            
            // Find a good place to insert the preview
            const linkField = document.querySelector('#groupLink, #link, [name="link"]');
            if (linkField && linkField.parentNode) {
                linkField.parentNode.insertBefore(preview, linkField.nextSibling);
            }
        }

        preview.innerHTML = `
            <div class="preview-header">
                <i class="fas fa-image" style="color: #25D366;"></i>
                <span>Group Image Extracted</span>
            </div>
            <img src="${imageData}" alt="Extracted group image" class="preview-image">
            <p class="preview-note">This image will be automatically saved with your group.</p>
        `;
    }

    showExtractionProgress(message) {
        this.updateExtractionStatus(message, 'progress');
    }

    showExtractionSuccess() {
        this.updateExtractionStatus('✓ Group information extracted successfully!', 'success');
    }

    showExtractionError(error) {
        this.updateExtractionStatus(`✗ ${error}`, 'error');
    }

    updateExtractionStatus(message, type) {
        let statusDiv = document.getElementById('extractionStatus');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'extractionStatus';
            statusDiv.className = 'extraction-status';
            
            // Find WhatsApp link field and add status below it
            const linkField = document.querySelector('#groupLink, #link, [name="link"]');
            if (linkField && linkField.parentNode) {
                linkField.parentNode.insertBefore(statusDiv, linkField.nextSibling);
            }
        }

        statusDiv.className = `extraction-status ${type}`;
        statusDiv.innerHTML = type === 'progress' ? 
            `<i class="fas fa-spinner fa-spin"></i> ${message}` : 
            message;

        // Auto-hide success/error messages after 5 seconds
        if (type !== 'progress') {
            setTimeout(() => {
                statusDiv.style.opacity = '0.7';
            }, 5000);
        }
    }

    // Enhanced form submission with extraction
    async handleFormSubmission(formData) {
        const submitBtn = document.querySelector('.submit-btn, [type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : '';
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        }

        try {
            const response = await fetch('/api/submit-group', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            
            if (result.success) {
                this.showSubmissionSuccess(result);
                return true;
            } else {
                this.showSubmissionError(result.error);
                return false;
            }
        } catch (error) {
            this.showSubmissionError(`Network error: ${error.message}`);
            return false;
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }
    }

    showSubmissionSuccess(result) {
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'submission-success';
        successMsg.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <h3>Group Submitted Successfully!</h3>
            <p>Your group has been added to our database.</p>
            ${result.image_url ? '<p><i class="fas fa-image"></i> Group image was automatically saved.</p>' : ''}
            <button onclick="location.href='/'" class="submit-btn">View All Groups</button>
        `;
        
        // Replace form with success message
        const form = document.querySelector('form');
        if (form) {
            form.style.display = 'none';
            form.parentNode.insertBefore(successMsg, form.nextSibling);
        }
    }

    showSubmissionError(error) {
        this.updateExtractionStatus(`Submission failed: ${error}`, 'error');
    }
}

// Initialize the handler
const groupHandler = new GroupSubmissionHandler();

// Auto-extract when link is pasted or changed
document.addEventListener('DOMContentLoaded', function() {
    const linkField = document.querySelector('#groupLink, #link, [name="link"]');
    if (linkField) {
        let extractionTimeout;
        
        linkField.addEventListener('input', function() {
            clearTimeout(extractionTimeout);
            const url = this.value.trim();
            
            // Check if it's a valid WhatsApp URL
            if (url && (url.includes('chat.whatsapp.com') || url.includes('wa.me'))) {
                // Debounce extraction to avoid too many requests
                extractionTimeout = setTimeout(() => {
                    groupHandler.extractGroupInfo(url);
                }, 1000);
            }
        });

        // Also extract on paste
        linkField.addEventListener('paste', function() {
            setTimeout(() => {
                const url = this.value.trim();
                if (url && (url.includes('chat.whatsapp.com') || url.includes('wa.me'))) {
                    groupHandler.extractGroupInfo(url);
                }
            }, 100);
        });
    }

    // Enhance form submission
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const jsonData = {};
            
            // Convert FormData to JSON
            for (let [key, value] of formData.entries()) {
                jsonData[key] = value;
            }
            
            // Add extraction flag
            jsonData.extract_image = true;
            
            const success = await groupHandler.handleFormSubmission(jsonData);
            if (!success) {
                // Form submission failed, keep form visible for retry
                console.log('Form submission failed');
            }
        });
    }
});

// CSS styles for the extraction features
const extractionStyles = `
<style>
.extraction-status {
    margin: 0.5rem 0;
    padding: 0.75rem;
    border-radius: 4px;
    font-size: 0.9rem;
}

.extraction-status.progress {
    background: #e3f2fd;
    color: #1976d2;
    border-left: 4px solid #2196f3;
}

.extraction-status.success {
    background: #e8f5e8;
    color: #2e7d32;
    border-left: 4px solid #4caf50;
}

.extraction-status.error {
    background: #ffebee;
    color: #c62828;
    border-left: 4px solid #f44336;
}

.extracted-image-preview {
    margin: 1rem 0;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border: 2px dashed #25D366;
}

.preview-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #25D366;
}

.preview-image {
    max-width: 200px;
    max-height: 200px;
    border-radius: 8px;
    margin: 0.5rem 0;
    display: block;
}

.preview-note {
    font-size: 0.8rem;
    color: #666;
    margin: 0.5rem 0 0 0;
}

.submission-success {
    text-align: center;
    padding: 2rem;
    background: #e8f5e8;
    border-radius: 12px;
    border: 2px solid #4caf50;
    margin: 2rem 0;
}

.submission-success h3 {
    color: #2e7d32;
    margin-bottom: 1rem;
}

.submission-success i.fa-check-circle {
    font-size: 3rem;
    color: #4caf50;
    margin-bottom: 1rem;
}
</style>
`;

// Inject styles into the page
document.head.insertAdjacentHTML('beforeend', extractionStyles);