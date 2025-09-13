// Global variables
let currentSection = 0;
let selectedTemplate = 'modern';
let selectedColor = 'blue';
let uploadedPhoto = null;
let cvData = {
    personal: {},
    experience: [],
    education: [],
    skills: {
        technical: [],
        soft: [],
        languages: []
    }
};

const sections = ['personal', 'experience', 'education', 'skills'];

// Color themes - Enhanced with new unique colors
const colorThemes = {
    blue: { primary: '#2563eb', secondary: '#3b82f6', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    green: { primary: '#10b981', secondary: '#34d399', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
    purple: { primary: '#8b5cf6', secondary: '#a78bfa', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' },
    red: { primary: '#ef4444', secondary: '#f87171', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)' },
    orange: { primary: '#ff9500', secondary: '#ff5722', gradient: 'linear-gradient(135deg, #ff9500 0%, #ff5722 100%)' },
    teal: { primary: '#00bcd4', secondary: '#009688', gradient: 'linear-gradient(135deg, #00bcd4 0%, #009688 100%)' },
    dark: { primary: '#374151', secondary: '#4b5563', gradient: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)' },
    pink: { primary: '#e91e63', secondary: '#f06292', gradient: 'linear-gradient(135deg, #e91e63 0%, #f06292 100%)' },
    gold: { primary: '#ffd700', secondary: '#ffb300', gradient: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)' },
    cyan: { primary: '#00e5ff', secondary: '#18ffff', gradient: 'linear-gradient(135deg, #00e5ff 0%, #18ffff 100%)' },
    indigo: { primary: '#3f51b5', secondary: '#5c6bc0', gradient: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)' },
    lime: { primary: '#8bc34a', secondary: '#9ccc65', gradient: 'linear-gradient(135deg, #8bc34a 0%, #9ccc65 100%)' }
};

// Auto-generated summary template
const autoSummaryTemplate = "I being a dynamic, motivated & action-oriented young professional, present myself with all my devotion, dedication & commitment for the best of your esteemed organization. I cordially assure you, if given a chance I would capitalize my abilities and contribute significantly to your organization's success.";

// Simplified form data collection
function collectFormData() {
    return {
        personal: {
            firstName: document.getElementById('firstName')?.value || '',
            jobTitle: document.getElementById('jobTitle')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            fatherName: document.getElementById('fatherName')?.value || '',
            dateOfBirth: document.getElementById('dateOfBirth')?.value || '',
            religion: document.getElementById('religion')?.value || '',
            nationality: document.getElementById('nationality')?.value || '',
            domicile: document.getElementById('domicile')?.value || '',
            currentAddress: document.getElementById('currentAddress')?.value || ''
        },
        skills: {
            technical: document.getElementById('technicalSkills')?.value.split(',').map(s => s.trim()).filter(s => s) || [],
            soft: document.getElementById('softSkills')?.value.split(',').map(s => s.trim()).filter(s => s) || [],
            languages: document.getElementById('languages')?.value.split(',').map(s => s.trim()).filter(s => s) || []
        },
        experience: [], // Simplified - can be enhanced later
        education: []   // Simplified - can be enhanced later
    };
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Wait for any navigation loader to complete
    setTimeout(() => {
        initializeApp();
    }, 100);
});

function initializeApp() {
    setupEventListeners();
    updateProgressBar();
    updateNavigationButtons();
    applyColorTheme('blue');
    
    // Add initial experience and education items
    cvData.experience.push({});
    cvData.education.push({});
    
    updatePreview();
}

function setupEventListeners() {
    // Color theme selection - compact dots
    const colorDots = document.querySelectorAll('.color-dot');
    colorDots.forEach(dot => {
        dot.addEventListener('click', function() {
            selectColor(this.dataset.theme);
        });
    });

    // Template selection - dropdown
    const templateDropdown = document.getElementById('templateSelect');
    if (templateDropdown) {
        templateDropdown.addEventListener('change', function() {
            selectTemplate(this.value);
        });
    }

    // Photo upload
    const photoInput = document.getElementById('photoInput');
    if (photoInput) {
        photoInput.addEventListener('change', handlePhotoUpload);
    }

    // Auto summary toggle
    const autoSummaryCheckbox = document.getElementById('useAutoSummary');
    if (autoSummaryCheckbox) {
        autoSummaryCheckbox.addEventListener('change', toggleAutoSummary);
    }

    // Form inputs with debouncing
    const formInputs = document.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        input.addEventListener('input', debounce(handleFormChange, 300));
        input.addEventListener('change', handleFormChange);
    });

    // Skills input
    setupSkillsInputs();

    // Navigation buttons
    document.getElementById('prevBtn').addEventListener('click', () => changeSection(-1));
    document.getElementById('nextBtn').addEventListener('click', () => changeSection(1));
    document.getElementById('generateBtn').addEventListener('click', generateCV);
    
    // Control buttons
    document.getElementById('downloadBtn').addEventListener('click', downloadCV);
    document.getElementById('printBtn').addEventListener('click', printCV);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Color theme selection
function selectColor(color) {
    selectedColor = color;
    
    // Update active color dot
    const colorDots = document.querySelectorAll('.color-dot');
    colorDots.forEach(dot => {
        dot.classList.remove('active');
        if (dot.dataset.theme === color) {
            dot.classList.add('active');
        }
    });
    
    // Apply color theme to CSS variables
    applyColorTheme(color);
    updatePreview();
}

function applyColorTheme(color) {
    // Don't change global CSS variables - only affect CV template colors
    const theme = colorThemes[color];
    if (theme) {
        // Apply theme colors only to CV preview
        const cvPreview = document.getElementById('cvPreview');
        if (cvPreview) {
            cvPreview.style.setProperty('--theme-primary', theme.primary);
            cvPreview.style.setProperty('--theme-secondary', theme.secondary);
        }
    }
}

// Template selection
function selectTemplate(template) {
    selectedTemplate = template;
    
    // Update template dropdown
    const templateDropdown = document.getElementById('templateSelect');
    if (templateDropdown) {
        templateDropdown.value = template;
    }
    
    updatePreview();
}

// Photo upload handling
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedPhoto = e.target.result;
            displayPhoto(uploadedPhoto);
            updatePreview();
        };
        reader.readAsDataURL(file);
    }
}

function displayPhoto(photoData) {
    const photoPreview = document.getElementById('photoPreview');
    const uploadBtn = document.querySelector('.photo-btn:not(.remove)');
    const removeBtn = document.querySelector('.photo-btn.remove');
    
    photoPreview.innerHTML = `<img src="${photoData}" alt="Profile Photo">`;
    uploadBtn.innerHTML = '<i class="fas fa-edit"></i> Change Photo';
    removeBtn.style.display = 'flex';
}

function removePhoto() {
    uploadedPhoto = null;
    const photoPreview = document.getElementById('photoPreview');
    const uploadBtn = document.querySelector('.photo-btn:not(.remove)');
    const removeBtn = document.querySelector('.photo-btn.remove');
    
    photoPreview.innerHTML = `
        <i class="fas fa-camera"></i>
        <p>Add Photo (Optional)</p>
    `;
    uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Photo';
    removeBtn.style.display = 'none';
    updatePreview();
}

// Auto summary toggle
function toggleAutoSummary() {
    const checkbox = document.getElementById('useAutoSummary');
    const customGroup = document.getElementById('customSummaryGroup');
    
    if (checkbox.checked) {
        customGroup.style.display = 'none';
        cvData.personal.summary = autoSummaryTemplate;
    } else {
        customGroup.style.display = 'block';
        cvData.personal.summary = '';
    }
    updatePreview();
}

// Section navigation
function changeSection(direction) {
    const newSection = currentSection + direction;
    
    if (newSection < 0 || newSection >= sections.length) {
        return;
    }
    
    // For easier experience, only validate required fields on the last section
    if (direction > 0 && newSection === sections.length - 1 && !validateRequiredFields()) {
        showValidationMessage('Please fill in the required fields (Full Name, Professional Title, Email, Phone, Education).');
        return;
    }
    
    currentSection = newSection;
    updateActiveSection();
    updateProgressBar();
    updateNavigationButtons();
}

function updateActiveSection() {
    const formSections = document.querySelectorAll('.form-section');
    formSections.forEach((section, index) => {
        section.classList.remove('active');
        if (index === currentSection) {
            section.classList.add('active');
        }
    });
}

function updateProgressBar() {
    const progressFill = document.querySelector('.progress-fill');
    const progress = ((currentSection + 1) / sections.length) * 100;
    progressFill.style.width = `${progress}%`;
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const generateBtn = document.getElementById('generateBtn');
    
    prevBtn.style.display = currentSection === 0 ? 'none' : 'flex';
    
    if (currentSection === sections.length - 1) {
        nextBtn.style.display = 'none';
        generateBtn.style.display = 'flex';
    } else {
        nextBtn.style.display = 'flex';
        generateBtn.style.display = 'none';
    }
}

// Form validation - simplified for ease of use
function validateRequiredFields() {
    const requiredFields = [
        { id: 'firstName', name: 'Full Name' },
        { id: 'jobTitle', name: 'Professional Title' },
        { id: 'email', name: 'Email' },
        { id: 'phone', name: 'Phone' }
    ];
    
    for (let field of requiredFields) {
        const input = document.getElementById(field.id);
        if (!input || !input.value.trim()) {
            return false;
        }
    }
    
    // Check if at least one education entry exists
    const educationInputs = document.querySelectorAll('[name*="education"][name*="degree"], [name*="education"][name*="institution"]');
    const hasEducation = Array.from(educationInputs).some(input => input.value.trim());
    
    return hasEducation;
}

function showValidationMessage(message) {
    let existingMessage = document.querySelector('.validation-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'validation-message';
    messageDiv.innerHTML = `
        <div style="background: #fee2e2; border: 1px solid #fecaca; color: #dc2626; padding: 1rem; border-radius: 8px; margin: 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-exclamation-triangle"></i>
            ${message}
        </div>
    `;
    
    const formNavigation = document.querySelector('.form-navigation');
    formNavigation.parentNode.insertBefore(messageDiv, formNavigation);
    
    setTimeout(() => {
        if (messageDiv) {
            messageDiv.remove();
        }
    }, 5000);
}

// Form handling - simplified
function handleFormChange(event) {
    // Update CV data from form
    cvData = collectFormData();
    updatePreview();
    
    // Save to localStorage
    localStorage.setItem('cvMakerData', JSON.stringify(cvData));
}

// Dynamic list management
function addItem(type) {
    const listContainer = document.getElementById(`${type}List`);
    const currentItems = listContainer.querySelectorAll('.list-item');
    const newIndex = currentItems.length;
    
    const newItem = createListItem(type, newIndex);
    listContainer.appendChild(newItem);
    
    cvData[type].push({});
    
    newItem.classList.add('slide-up');
    
    const newInputs = newItem.querySelectorAll('input, textarea, select');
    newInputs.forEach(input => {
        input.addEventListener('input', debounce(handleFormChange, 300));
        input.addEventListener('change', handleFormChange);
    });
}

function removeItem(type, index) {
    const listContainer = document.getElementById(`${type}List`);
    const items = listContainer.querySelectorAll('.list-item');
    
    if (items.length <= 1 && type === 'education') {
        showValidationMessage('At least one education entry is required.');
        return;
    }
    
    items[index].remove();
    cvData[type].splice(index, 1);
    
    reindexListItems(type);
    updatePreview();
}

function createListItem(type, index) {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.setAttribute('data-index', index);
    
    if (type === 'experience') {
        item.innerHTML = createExperienceItemHTML(index);
    } else if (type === 'education') {
        item.innerHTML = createEducationItemHTML(index);
    }
    
    return item;
}

function createExperienceItemHTML(index) {
    return `
        <div class="item-header">
            <h4>Experience #${index + 1}</h4>
            <button type="button" class="remove-btn" onclick="removeItem('experience', ${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label>Job Title</label>
                <input type="text" name="experience[${index}][title]" placeholder="Software Developer">
            </div>
            <div class="form-group">
                <label>Company</label>
                <input type="text" name="experience[${index}][company]" placeholder="Tech Solutions Ltd">
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Duration</label>
                <input type="text" name="experience[${index}][duration]" placeholder="Jan 2022 - Present">
            </div>
            <div class="form-group">
                <label>Location</label>
                <input type="text" name="experience[${index}][location]" placeholder="Islamabad, Pakistan">
            </div>
        </div>

        <div class="form-group">
            <label>Key Responsibilities</label>
            <textarea name="experience[${index}][description]" rows="3" placeholder="• Developed web applications using React and Node.js
• Collaborated with cross-functional teams
• Implemented responsive design principles"></textarea>
        </div>
    `;
}

function createEducationItemHTML(index) {
    return `
        <div class="item-header">
            <h4>Education #${index + 1}</h4>
            <button type="button" class="remove-btn" onclick="removeItem('education', ${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label>Degree/Certificate *</label>
                <input type="text" name="education[${index}][degree]" placeholder="Bachelor of Computer Science" required>
            </div>
            <div class="form-group">
                <label>Institution *</label>
                <input type="text" name="education[${index}][institution]" placeholder="University of Punjab" required>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Duration</label>
                <input type="text" name="education[${index}][duration]" placeholder="2018 - 2022">
            </div>
            <div class="form-group">
                <label>Grade/CGPA</label>
                <input type="text" name="education[${index}][gpa]" placeholder="3.8/4.0 or A Grade">
            </div>
        </div>

        <div class="form-group">
            <label>Location</label>
            <input type="text" name="education[${index}][location]" placeholder="Lahore, Pakistan">
        </div>
    `;
}

function reindexListItems(type) {
    const listContainer = document.getElementById(`${type}List`);
    const items = listContainer.querySelectorAll('.list-item');
    
    items.forEach((item, index) => {
        item.setAttribute('data-index', index);
        
        const inputs = item.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (input.name.includes('[')) {
                input.name = input.name.replace(/\[\d+\]/, `[${index}]`);
            }
        });
        
        const header = item.querySelector('h4');
        header.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} #${index + 1}`;
        
        const removeBtn = item.querySelector('.remove-btn');
        removeBtn.setAttribute('onclick', `removeItem('${type}', ${index})`);
    });
}

// Enhanced Skills management
function setupSkillsInputs() {
    const technicalInput = document.getElementById('technicalSkills');
    const softInput = document.getElementById('softSkills');
    const languagesInput = document.getElementById('languages');
    
    if (technicalInput) {
        technicalInput.addEventListener('input', () => handleSkillsInput('technical'));
        technicalInput.addEventListener('blur', () => processSkills('technical'));
    }
    
    if (softInput) {
        softInput.addEventListener('input', () => handleSkillsInput('soft'));
        softInput.addEventListener('blur', () => processSkills('soft'));
    }
    
    if (languagesInput) {
        languagesInput.addEventListener('input', () => handleSkillsInput('languages'));
        languagesInput.addEventListener('blur', () => processSkills('languages'));
    }
}

function handleSkillsInput(category) {
    // Real-time processing can be added here if needed
}

function processSkills(category) {
    const input = document.getElementById(category === 'technical' ? 'technicalSkills' : 
                                       category === 'soft' ? 'softSkills' : 'languages');
    
    if (input && input.value.trim()) {
        const skills = input.value.split(',').map(skill => skill.trim()).filter(skill => skill);
        cvData.skills[category] = [...new Set(skills)];
        displayAllSkills();
        updatePreview();
    }
}

function displayAllSkills() {
    const allSkillsDisplay = document.getElementById('allSkillsList');
    if (!allSkillsDisplay) return;
    
    allSkillsDisplay.innerHTML = '';
    
    if (cvData.skills.technical && cvData.skills.technical.length > 0) {
        const techSection = document.createElement('div');
        techSection.innerHTML = `
            <h5 style="margin-bottom: 0.5rem; color: var(--primary-color);">Technical Skills</h5>
            <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; margin-bottom: 1rem;">
                ${cvData.skills.technical.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        `;
        allSkillsDisplay.appendChild(techSection);
    }
    
    if (cvData.skills.soft && cvData.skills.soft.length > 0) {
        const softSection = document.createElement('div');
        softSection.innerHTML = `
            <h5 style="margin-bottom: 0.5rem; color: var(--primary-color);">Soft Skills</h5>
            <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; margin-bottom: 1rem;">
                ${cvData.skills.soft.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        `;
        allSkillsDisplay.appendChild(softSection);
    }
    
    if (cvData.skills.languages && cvData.skills.languages.length > 0) {
        const langSection = document.createElement('div');
        langSection.innerHTML = `
            <h5 style="margin-bottom: 0.5rem; color: var(--primary-color);">Languages</h5>
            <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; margin-bottom: 1rem;">
                ${cvData.skills.languages.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        `;
        allSkillsDisplay.appendChild(langSection);
    }
}

// Preview generation
function updatePreview() {
    const previewContainer = document.getElementById('cvPreview');
    
    if (!cvData.personal.firstName && !cvData.personal.jobTitle) {
        previewContainer.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-eye"></i>
                <p>Fill in your basic information to see the preview</p>
            </div>
        `;
        return;
    }
    
    const templateHTML = generateTemplateHTML();
    previewContainer.innerHTML = templateHTML;
}

function generateTemplateHTML() {
    switch (selectedTemplate) {
        case 'modern':
            return generateModernTemplate();
        case 'classic':
            return generateClassicTemplate();
        case 'creative':
            return generateCreativeTemplate();
        case 'minimal':
            return generateMinimalTemplate();
        default:
            return generateModernTemplate();
    }
}

// Modern Template (keeping the same)
function generateModernTemplate() {
    const theme = colorThemes[selectedColor];
    return `
        <div class="cv-template modern" style="--theme-gradient: ${theme.gradient}; --theme-primary: ${theme.primary};">
            <div class="sidebar" style="background: ${theme.gradient};">
                <div class="profile-section">
                    ${uploadedPhoto ? `<img src="${uploadedPhoto}" alt="Profile Photo" class="cv-photo">` : ''}
                    <div class="name">${cvData.personal.firstName || ''}</div>
                    <div class="title">${cvData.personal.jobTitle || ''}</div>
                </div>
                
                ${generatePersonalDetailsSection()}
                ${generateContactSection()}
                ${generateSkillsSection()}
            </div>
            
            <div class="main-content">
                ${generateSummarySection()}
                ${generateExperienceTableSection()}
                ${generateEducationTableSection()}
                ${generateAddressSection()}
            </div>
        </div>
    `;
}

// Classic Template - Traditional Professional Layout
function generateClassicTemplate() {
    const theme = colorThemes[selectedColor];
    return `
        <div class="cv-template classic" style="--theme-primary: ${theme.primary}; --theme-secondary: ${theme.secondary}; padding: 2rem;">
            <div class="classic-header" style="border-bottom: 3px solid ${theme.primary}; padding-bottom: 2rem; margin-bottom: 2rem; text-align: center;">
                ${uploadedPhoto ? `<img src="${uploadedPhoto}" alt="Profile Photo" class="cv-photo" style="margin: 0 auto 1rem; border: 4px solid ${theme.primary};">` : ''}
                <div class="name" style="font-size: 2.5rem; font-weight: 300; color: ${theme.primary}; margin-bottom: 0.5rem;">
                    ${cvData.personal.firstName || ''}
                </div>
                <div class="title" style="font-size: 1.3rem; color: #7f8c8d; font-weight: 400; margin-bottom: 1rem;">
                    ${cvData.personal.jobTitle || ''}
                </div>
                <div class="contact-line" style="color: #555; font-size: 1rem;">
                    ${cvData.personal.email ? `${cvData.personal.email}` : ''}
                    ${cvData.personal.phone && cvData.personal.email ? ` | ${cvData.personal.phone}` : cvData.personal.phone || ''}
                </div>
            </div>
            
            ${generateSummarySection()}
            
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                <div class="main-column">
                    ${generateExperienceTableSection()}
                    ${generateEducationTableSection()}
                </div>
                
                <div class="sidebar-column">
                    ${generatePersonalDetailsBoxSection()}
                    ${generateSkillsBoxSection()}
                    ${generateAddressSection()}
                </div>
            </div>
        </div>
    `;
}

// Creative Template - Modern Artistic Layout
function generateCreativeTemplate() {
    const theme = colorThemes[selectedColor];
    return `
        <div class="cv-template creative" style="background: ${theme.gradient}; --theme-primary: ${theme.primary}; padding: 0;">
            <div class="creative-wrapper" style="background: white; margin: 1.5rem; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
                <div class="creative-header" style="background: ${theme.gradient}; color: white; padding: 2rem; text-align: center; position: relative;">
                    ${uploadedPhoto ? `<img src="${uploadedPhoto}" alt="Profile Photo" class="cv-photo" style="border: 4px solid rgba(255,255,255,0.9); margin-bottom: 1rem;">` : ''}
                    <div class="name" style="font-size: 2.2rem; font-weight: 700; margin-bottom: 0.5rem;">
                        ${cvData.personal.firstName || ''}
                    </div>
                    <div class="title" style="font-size: 1.1rem; opacity: 0.9;">
                        ${cvData.personal.jobTitle || ''}
                    </div>
                    <div class="header-contact" style="margin-top: 1rem; opacity: 0.9;">
                        ${cvData.personal.email ? `<span style="margin-right: 1rem;"><i class="fas fa-envelope"></i> ${cvData.personal.email}</span>` : ''}
                        ${cvData.personal.phone ? `<span><i class="fas fa-phone"></i> ${cvData.personal.phone}</span>` : ''}
                    </div>
                </div>
                
                <div style="padding: 2rem; display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                    <div class="main-content">
                        ${generateSummarySection()}
                        ${generateExperienceCreativeSection()}
                        ${generateEducationCreativeSection()}
                    </div>
                    
                    <div class="creative-sidebar">
                        ${generatePersonalDetailsBoxSection()}
                        ${generateSkillsBoxSection()}
                        ${generateAddressSection()}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Minimal Template - Clean Minimalist Layout
function generateMinimalTemplate() {
    const theme = colorThemes[selectedColor];
    return `
        <div class="cv-template minimal" style="max-width: 800px; margin: 0 auto; padding: 2rem; --theme-primary: ${theme.primary};">
            <div class="minimal-header" style="border-bottom: 1px solid #eee; padding-bottom: 2rem; margin-bottom: 2rem; display: flex; align-items: start; gap: 2rem;">
                ${uploadedPhoto ? `<img src="${uploadedPhoto}" alt="Profile Photo" class="cv-photo" style="border: 2px solid ${theme.primary}; flex-shrink: 0;">` : ''}
                <div class="header-info">
                    <div class="name" style="font-size: 2.8rem; font-weight: 200; color: #1a1a1a; margin-bottom: 0.5rem;">
                        ${cvData.personal.firstName || ''}
                    </div>
                    <div class="title" style="font-size: 1.2rem; color: #666; font-weight: 300; margin-bottom: 1rem;">
                        ${cvData.personal.jobTitle || ''}
                    </div>
                    <div class="minimal-contact" style="color: #666; font-size: 0.9rem;">
                        ${cvData.personal.email ? `${cvData.personal.email}` : ''}
                        ${cvData.personal.phone && cvData.personal.email ? ` • ${cvData.personal.phone}` : cvData.personal.phone || ''}
                    </div>
                </div>
            </div>
            
            ${generateSummarySection()}
            ${generateExperienceMinimalSection()}
            ${generateEducationMinimalSection()}
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
                <div>${generatePersonalDetailsMinimalSection()}</div>
                <div>${generateSkillsMinimalSection()}</div>
            </div>
            
            ${generateAddressSection()}
        </div>
    `;
}

// Helper functions for sections
function generatePersonalDetailsSection() {
    if (!cvData.personal.fatherName && !cvData.personal.dateOfBirth && !cvData.personal.religion && !cvData.personal.gender && !cvData.personal.nationality && !cvData.personal.domicile) {
        return '';
    }
    
    return `
        <div class="personal-section">
            <h3 class="section-title">Personal Details</h3>
            ${cvData.personal.fatherName ? `<div class="contact-item"><i class="fas fa-user"></i> Father: ${cvData.personal.fatherName}</div>` : ''}
            ${cvData.personal.dateOfBirth ? `<div class="contact-item"><i class="fas fa-calendar"></i> DOB: ${formatSimpleDate(cvData.personal.dateOfBirth)}</div>` : ''}
            ${cvData.personal.religion ? `<div class="contact-item"><i class="fas fa-pray"></i> ${cvData.personal.religion}</div>` : ''}
            ${cvData.personal.gender ? `<div class="contact-item"><i class="fas fa-venus-mars"></i> ${cvData.personal.gender}</div>` : ''}
            ${cvData.personal.nationality ? `<div class="contact-item"><i class="fas fa-flag"></i> ${cvData.personal.nationality}</div>` : ''}
            ${cvData.personal.domicile ? `<div class="contact-item"><i class="fas fa-home"></i> ${cvData.personal.domicile}</div>` : ''}
        </div>
    `;
}

function generateContactSection() {
    if (!cvData.personal.email && !cvData.personal.phone) {
        return '';
    }
    
    return `
        <div class="contact-section">
            <h3 class="section-title">Contact</h3>
            ${cvData.personal.email ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${cvData.personal.email}</div>` : ''}
            ${cvData.personal.phone ? `<div class="contact-item"><i class="fas fa-phone"></i> ${cvData.personal.phone}</div>` : ''}
        </div>
    `;
}

function generateSkillsSection() {
    const hasSkills = (cvData.skills.technical && cvData.skills.technical.length > 0) || 
                     (cvData.skills.soft && cvData.skills.soft.length > 0) || 
                     (cvData.skills.languages && cvData.skills.languages.length > 0);
    
    if (!hasSkills) return '';
    
    return `
        <div class="skills-section">
            <h3 class="section-title">Skills & Abilities</h3>
            ${cvData.skills.technical && cvData.skills.technical.length > 0 ? `
                <div style="margin-bottom: 1rem;">
                    <h5 style="font-size: 0.8rem; margin-bottom: 0.5rem; opacity: 0.9;">TECHNICAL</h5>
                    <div class="skills-list">
                        ${cvData.skills.technical.map(skill => `<span class="skill-item" style="background: white; color: var(--theme-primary, #2563eb); border: 1px solid rgba(255,255,255,0.3); font-weight: 500;">${skill}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            ${cvData.skills.soft && cvData.skills.soft.length > 0 ? `
                <div style="margin-bottom: 1rem;">
                    <h5 style="font-size: 0.8rem; margin-bottom: 0.5rem; opacity: 0.9;">SOFT SKILLS</h5>
                    <div class="skills-list">
                        ${cvData.skills.soft.map(skill => `<span class="skill-item" style="background: white; color: var(--theme-primary, #2563eb); border: 1px solid rgba(255,255,255,0.3); font-weight: 500;">${skill}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            ${cvData.skills.languages && cvData.skills.languages.length > 0 ? `
                <div>
                    <h5 style="font-size: 0.8rem; margin-bottom: 0.5rem; opacity: 0.9;">LANGUAGES</h5>
                    <div class="skills-list">
                        ${cvData.skills.languages.map(skill => `<span class="skill-item" style="background: white; color: var(--theme-primary, #2563eb); border: 1px solid rgba(255,255,255,0.3); font-weight: 500;">${skill}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function generateSummarySection() {
    const summary = document.getElementById('useAutoSummary')?.checked ? autoSummaryTemplate : cvData.personal.summary;
    
    if (!summary) return '';
    
    return `
        <div class="summary-section">
            <h3 class="section-title" style="color: var(--theme-primary, #2563eb);">Professional Summary</h3>
            <p style="text-align: justify; line-height: 1.6; color: #333;">${summary}</p>
        </div>
    `;
}

function generateExperienceTableSection() {
    if (!cvData.experience || cvData.experience.length === 0 || !cvData.experience.some(exp => exp.title || exp.company)) {
        return '';
    }
    
    const validExperiences = cvData.experience.filter(exp => exp.title || exp.company);
    
    return `
        <div class="experience-section">
            <h3 class="section-title" style="color: var(--theme-primary, #2563eb);">Work Experience</h3>
            <table class="cv-table">
                <thead>
                    <tr>
                        <th style="width: 25%; background: var(--theme-primary, #2563eb);">Position</th>
                        <th style="width: 25%; background: var(--theme-primary, #2563eb);">Company</th>
                        <th style="width: 20%; background: var(--theme-primary, #2563eb);">Duration</th>
                        <th style="width: 30%; background: var(--theme-primary, #2563eb);">Key Responsibilities</th>
                    </tr>
                </thead>
                <tbody>
                    ${validExperiences.map(exp => `
                        <tr>
                            <td><strong style="color: #1a1a1a;">${exp.title || 'N/A'}</strong></td>
                            <td style="color: #1a1a1a;">${exp.company || 'N/A'}</td>
                            <td style="color: #1a1a1a;">${exp.duration || 'N/A'}</td>
                            <td style="font-size: 0.85rem; color: #1a1a1a;">${exp.description ? exp.description.replace(/\n/g, '<br>') : 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function generateEducationTableSection() {
    if (!cvData.education || cvData.education.length === 0 || !cvData.education.some(edu => edu.degree || edu.institution)) {
        return '';
    }
    
    const validEducation = cvData.education.filter(edu => edu.degree || edu.institution);
    
    return `
        <div class="education-section">
            <h3 class="section-title" style="color: var(--theme-primary, #2563eb);">Education</h3>
            <table class="cv-table">
                <thead>
                    <tr>
                        <th style="width: 30%; background: var(--theme-primary, #2563eb);">Degree/Certificate</th>
                        <th style="width: 30%; background: var(--theme-primary, #2563eb);">Institution</th>
                        <th style="width: 20%; background: var(--theme-primary, #2563eb);">Duration</th>
                        <th style="width: 20%; background: var(--theme-primary, #2563eb);">Grade/CGPA</th>
                    </tr>
                </thead>
                <tbody>
                    ${validEducation.map(edu => `
                        <tr>
                            <td><strong style="color: #1a1a1a;">${edu.degree || 'N/A'}</strong></td>
                            <td style="color: #1a1a1a;">${edu.institution || 'N/A'}</td>
                            <td style="color: #1a1a1a;">${edu.duration || 'N/A'}</td>
                            <td style="color: #1a1a1a;">${edu.gpa || 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function generateAddressSection() {
    if (!cvData.personal.currentAddress && !cvData.personal.permanentAddress) {
        return '';
    }
    
    return `
        <div class="address-section">
            <h3 class="section-title" style="color: var(--theme-primary, #2563eb);">Mailing Address</h3>
            ${cvData.personal.currentAddress ? `
                <div style="margin-bottom: 1rem;">
                    <h5 style="font-size: 0.9rem; font-weight: 600; color: var(--theme-primary, #2563eb); margin-bottom: 0.25rem;">Current Address</h5>
                    <p style="line-height: 1.4; font-size: 0.9rem; color: #333;">${cvData.personal.currentAddress.replace(/\n/g, '<br>')}</p>
                </div>
            ` : ''}
            ${cvData.personal.permanentAddress ? `
                <div>
                    <h5 style="font-size: 0.9rem; font-weight: 600; color: var(--theme-primary, #2563eb); margin-bottom: 0.25rem;">Permanent Address</h5>
                    <p style="line-height: 1.4; font-size: 0.9rem; color: #333;">${cvData.personal.permanentAddress.replace(/\n/g, '<br>')}</p>
                </div>
            ` : ''}
        </div>
    `;
}

// Helper functions for different templates
function generatePersonalDetailsBoxSection() {
    if (!cvData.personal.fatherName && !cvData.personal.dateOfBirth && !cvData.personal.religion && !cvData.personal.gender && !cvData.personal.nationality && !cvData.personal.domicile) {
        return '';
    }
    
    return `
        <div class="personal-details-box" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <h4 style="color: var(--theme-primary, #2563eb); font-weight: 600; margin-bottom: 1rem; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 1px;">Personal Details</h4>
            ${cvData.personal.fatherName ? `<div style="margin-bottom: 0.5rem; color: #1a1a1a;"><strong>Father Name:</strong> ${cvData.personal.fatherName}</div>` : ''}
            ${cvData.personal.dateOfBirth ? `<div style="margin-bottom: 0.5rem; color: #1a1a1a;"><strong>Date of Birth:</strong> ${formatSimpleDate(cvData.personal.dateOfBirth)}</div>` : ''}
            ${cvData.personal.religion ? `<div style="margin-bottom: 0.5rem; color: #1a1a1a;"><strong>Religion:</strong> ${cvData.personal.religion}</div>` : ''}
            ${cvData.personal.gender ? `<div style="margin-bottom: 0.5rem; color: #1a1a1a;"><strong>Gender:</strong> ${cvData.personal.gender}</div>` : ''}
            ${cvData.personal.nationality ? `<div style="margin-bottom: 0.5rem; color: #1a1a1a;"><strong>Nationality:</strong> ${cvData.personal.nationality}</div>` : ''}
            ${cvData.personal.domicile ? `<div style="color: #1a1a1a;"><strong>Domicile:</strong> ${cvData.personal.domicile}</div>` : ''}
        </div>
    `;
}

function generateSkillsBoxSection() {
    const hasSkills = (cvData.skills.technical && cvData.skills.technical.length > 0) || 
                     (cvData.skills.soft && cvData.skills.soft.length > 0) || 
                     (cvData.skills.languages && cvData.skills.languages.length > 0);
    
    if (!hasSkills) return '';
    
    return `
        <div class="skills-box" style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <h4 style="color: var(--theme-primary, #2563eb); font-weight: 600; margin-bottom: 1rem; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 1px;">Skills & Abilities</h4>
            ${cvData.skills.technical && cvData.skills.technical.length > 0 ? `
                <div style="margin-bottom: 1rem;">
                    <h5 style="font-size: 0.8rem; margin-bottom: 0.5rem; color: var(--theme-primary, #2563eb); text-transform: uppercase; letter-spacing: 1px;">Technical</h5>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.3rem;">
                        ${cvData.skills.technical.map(skill => `<span style="background: var(--theme-primary, #2563eb); color: white; padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.75rem;">${skill}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            ${cvData.skills.soft && cvData.skills.soft.length > 0 ? `
                <div style="margin-bottom: 1rem;">
                    <h5 style="font-size: 0.8rem; margin-bottom: 0.5rem; color: var(--theme-primary, #2563eb); text-transform: uppercase; letter-spacing: 1px;">Soft Skills</h5>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.3rem;">
                        ${cvData.skills.soft.map(skill => `<span style="background: var(--theme-primary, #2563eb); color: white; padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.75rem;">${skill}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            ${cvData.skills.languages && cvData.skills.languages.length > 0 ? `
                <div>
                    <h5 style="font-size: 0.8rem; margin-bottom: 0.5rem; color: var(--theme-primary, #2563eb); text-transform: uppercase; letter-spacing: 1px;">Languages</h5>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.3rem;">
                        ${cvData.skills.languages.map(skill => `<span style="background: var(--theme-primary, #2563eb); color: white; padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.75rem;">${skill}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Creative and Minimal section variants
function generateExperienceCreativeSection() {
    if (!cvData.experience || cvData.experience.length === 0 || !cvData.experience.some(exp => exp.title || exp.company)) {
        return '';
    }
    
    const validExperiences = cvData.experience.filter(exp => exp.title || exp.company);
    
    return `
        <div class="experience-section">
            <h3 class="section-title" style="color: var(--theme-primary); position: relative;">
                Work Experience
                <span style="position: absolute; bottom: -3px; left: 0; width: 50px; height: 3px; background: linear-gradient(45deg, var(--theme-primary), var(--theme-secondary)); border-radius: 2px;"></span>
            </h3>
            ${validExperiences.map(exp => `
                <div style="margin-bottom: 2rem; padding: 1.5rem; background: #f8fafc; border-radius: 10px; border-left: 4px solid var(--theme-primary);">
                    <h4 style="color: var(--theme-primary); font-weight: 600; margin-bottom: 0.5rem;">${exp.title || 'N/A'}</h4>
                    <p style="color: #666; font-weight: 500; margin-bottom: 0.5rem;">${exp.company || 'N/A'} | ${exp.duration || 'N/A'}</p>
                    ${exp.description ? `<p style="color: #333; line-height: 1.6; font-size: 0.9rem;">${exp.description.replace(/\n/g, '<br>')}</p>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function generateEducationCreativeSection() {
    if (!cvData.education || cvData.education.length === 0 || !cvData.education.some(edu => edu.degree || edu.institution)) {
        return '';
    }
    
    const validEducation = cvData.education.filter(edu => edu.degree || edu.institution);
    
    return `
        <div class="education-section">
            <h3 class="section-title" style="color: var(--theme-primary); position: relative;">
                Education
                <span style="position: absolute; bottom: -3px; left: 0; width: 50px; height: 3px; background: linear-gradient(45deg, var(--theme-primary), var(--theme-secondary)); border-radius: 2px;"></span>
            </h3>
            ${validEducation.map(edu => `
                <div style="margin-bottom: 2rem; padding: 1.5rem; background: #f8fafc; border-radius: 10px; border-left: 4px solid var(--theme-primary);">
                    <h4 style="color: var(--theme-primary); font-weight: 600; margin-bottom: 0.5rem;">${edu.degree || 'N/A'}</h4>
                    <p style="color: #666; font-weight: 500; margin-bottom: 0.5rem;">${edu.institution || 'N/A'} | ${edu.duration || 'N/A'}</p>
                    ${edu.gpa ? `<p style="color: #333; font-size: 0.9rem;">Grade: ${edu.gpa}</p>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function generateExperienceMinimalSection() {
    if (!cvData.experience || cvData.experience.length === 0 || !cvData.experience.some(exp => exp.title || exp.company)) {
        return '';
    }
    
    const validExperiences = cvData.experience.filter(exp => exp.title || exp.company);
    
    return `
        <div class="experience-section">
            <h3 style="font-size: 0.9rem; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 2px; margin: 2.5rem 0 1rem 0; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">Experience</h3>
            ${validExperiences.map(exp => `
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="font-weight: 600; color: #1a1a1a; margin-bottom: 0.25rem;">${exp.title || 'N/A'}</h4>
                    <p style="color: var(--theme-primary); font-weight: 500; margin-bottom: 0.25rem;">${exp.company || 'N/A'}</p>
                    ${exp.duration ? `<p style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">${exp.duration}</p>` : ''}
                    ${exp.description ? `<p style="color: #555; line-height: 1.6; font-size: 0.9rem;">${exp.description.replace(/\n/g, '<br>')}</p>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function generateEducationMinimalSection() {
    if (!cvData.education || cvData.education.length === 0 || !cvData.education.some(edu => edu.degree || edu.institution)) {
        return '';
    }
    
    const validEducation = cvData.education.filter(edu => edu.degree || edu.institution);
    
    return `
        <div class="education-section">
            <h3 style="font-size: 0.9rem; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 2px; margin: 2.5rem 0 1rem 0; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">Education</h3>
            ${validEducation.map(edu => `
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="font-weight: 600; color: #1a1a1a; margin-bottom: 0.25rem;">${edu.degree || 'N/A'}</h4>
                    <p style="color: var(--theme-primary); font-weight: 500; margin-bottom: 0.25rem;">${edu.institution || 'N/A'}</p>
                    ${edu.duration ? `<p style="font-size: 0.9rem; color: #666;">${edu.duration}${edu.gpa ? ` | Grade: ${edu.gpa}` : ''}</p>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function generatePersonalDetailsMinimalSection() {
    if (!cvData.personal.fatherName && !cvData.personal.dateOfBirth && !cvData.personal.religion && !cvData.personal.gender && !cvData.personal.nationality && !cvData.personal.domicile) {
        return '';
    }
    
    return `
        <div class="personal-details-minimal">
            <h3 style="font-size: 0.9rem; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">Personal Details</h3>
            ${cvData.personal.fatherName ? `<p style="margin-bottom: 0.5rem; color: #333; font-size: 0.9rem;"><strong>Father Name:</strong> ${cvData.personal.fatherName}</p>` : ''}
            ${cvData.personal.dateOfBirth ? `<p style="margin-bottom: 0.5rem; color: #333; font-size: 0.9rem;"><strong>Date of Birth:</strong> ${formatSimpleDate(cvData.personal.dateOfBirth)}</p>` : ''}
            ${cvData.personal.religion ? `<p style="margin-bottom: 0.5rem; color: #333; font-size: 0.9rem;"><strong>Religion:</strong> ${cvData.personal.religion}</p>` : ''}
            ${cvData.personal.nationality ? `<p style="color: #333; font-size: 0.9rem;"><strong>Nationality:</strong> ${cvData.personal.nationality}</p>` : ''}
        </div>
    `;
}

function generateSkillsMinimalSection() {
    const hasSkills = (cvData.skills.technical && cvData.skills.technical.length > 0) || 
                     (cvData.skills.soft && cvData.skills.soft.length > 0) || 
                     (cvData.skills.languages && cvData.skills.languages.length > 0);
    
    if (!hasSkills) return '';
    
    return `
        <div class="skills-minimal">
            <h3 style="font-size: 0.9rem; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">Skills</h3>
            ${cvData.skills.technical && cvData.skills.technical.length > 0 ? `
                <div style="margin-bottom: 1rem;">
                    <h5 style="font-size: 0.8rem; margin-bottom: 0.5rem; color: #666; text-transform: uppercase; letter-spacing: 1px;">Technical</h5>
                    <p style="color: #333; font-size: 0.9rem; line-height: 1.4;">${cvData.skills.technical.join(', ')}</p>
                </div>
            ` : ''}
            ${cvData.skills.soft && cvData.skills.soft.length > 0 ? `
                <div style="margin-bottom: 1rem;">
                    <h5 style="font-size: 0.8rem; margin-bottom: 0.5rem; color: #666; text-transform: uppercase; letter-spacing: 1px;">Soft Skills</h5>
                    <p style="color: #333; font-size: 0.9rem; line-height: 1.4;">${cvData.skills.soft.join(', ')}</p>
                </div>
            ` : ''}
            ${cvData.skills.languages && cvData.skills.languages.length > 0 ? `
                <div>
                    <h5 style="font-size: 0.8rem; margin-bottom: 0.5rem; color: #666; text-transform: uppercase; letter-spacing: 1px;">Languages</h5>
                    <p style="color: #333; font-size: 0.9rem; line-height: 1.4;">${cvData.skills.languages.join(', ')}</p>
                </div>
            ` : ''}
        </div>
    `;
}

// CV Generation and Export
function generateCV() {
    if (!validateRequiredFields()) {
        showValidationMessage('Please complete the required fields before generating your CV.');
        return;
    }
    
    updatePreview();
    showSuccessMessage('🎉 CV generated successfully! You can now download or print your CV.');
}

function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.innerHTML = `
        <div style="background: #dcfce7; border: 1px solid #bbf7d0; color: #166534; padding: 1rem; border-radius: 8px; margin: 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-check-circle"></i>
            ${message}
        </div>
    `;
    
    const previewHeader = document.querySelector('.preview-header');
    previewHeader.parentNode.insertBefore(messageDiv, previewHeader.nextSibling);
    
    setTimeout(() => {
        if (messageDiv) {
            messageDiv.remove();
        }
    }, 5000);
}

function downloadCV() {
    const cvContent = document.getElementById('cvPreview').innerHTML;
    
    const tempDoc = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${cvData.personal.firstName || 'Professional'} CV</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                ${getCVStyles()}
            </style>
        </head>
        <body>
            ${cvContent}
        </body>
        </html>
    `;
    
    const blob = new Blob([tempDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cvData.personal.firstName || 'Professional'}_CV.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccessMessage('CV downloaded successfully!');
}

function printCV() {
    window.print();
}

function getCVStyles() {
    const theme = colorThemes[selectedColor];
    return `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: 'Inter', sans-serif; 
            line-height: 1.5; 
            color: #1a1a1a;
        }
        
        .cv-template { 
            max-width: 210mm; 
            min-height: 297mm; 
            margin: 0 auto; 
            background: white;
            color: #1a1a1a;
        }
        
        .cv-template.modern { 
            display: grid; 
            grid-template-columns: 1fr 2fr; 
            gap: 0; 
        }
        
        .cv-template.modern .sidebar { 
            padding: 2rem 1.5rem; 
            color: white; 
        }
        
        .cv-template.modern .main-content { 
            padding: 2rem; 
        }
        
        .name { font-size: 1.8rem; font-weight: 700; margin-bottom: 0.5rem; }
        .title { font-size: 1rem; margin-bottom: 1.5rem; opacity: 0.9; }
        .section-title { 
            font-size: 1.1rem; 
            font-weight: 600; 
            margin: 1.5rem 0 1rem 0; 
            border-bottom: 2px solid currentColor; 
            padding-bottom: 0.5rem; 
        }
        
        .contact-item { 
            display: flex; 
            align-items: center; 
            gap: 0.5rem; 
            margin-bottom: 0.5rem; 
            font-size: 0.9rem; 
        }
        
        .cv-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 1.5rem; 
            font-size: 0.9rem; 
        }
        
        .cv-table th { 
            background: ${theme.primary}; 
            color: white; 
            padding: 0.5rem; 
            text-align: left; 
            font-weight: 600; 
        }
        
        .cv-table td { 
            padding: 0.5rem; 
            border-bottom: 1px solid #e5e7eb; 
            vertical-align: top; 
            color: #1a1a1a;
        }
        
        .skill-item { 
            background: white; 
            color: ${theme.primary}; 
            border: 1px solid rgba(255,255,255,0.3);
            padding: 0.2rem 0.5rem; 
            border-radius: 10px; 
            font-size: 0.8rem; 
            margin: 0.1rem; 
            display: inline-block; 
            font-weight: 500;
        }
        
        .cv-photo { 
            width: 120px; 
            height: 120px; 
            border-radius: 50%; 
            object-fit: cover; 
            margin: 0 auto 1rem; 
            display: block; 
            border: 4px solid rgba(255,255,255,0.9);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        @media print {
            body { margin: 0; }
            .cv-template { box-shadow: none; }
        }
    `;
}

// Utility functions
function formatSimpleDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
}

// Auto-save and load functionality
function saveToLocalStorage() {
    localStorage.setItem('cvData', JSON.stringify(cvData));
    localStorage.setItem('selectedTemplate', selectedTemplate);
    localStorage.setItem('selectedColor', selectedColor);
    localStorage.setItem('uploadedPhoto', uploadedPhoto);
}

function loadFromLocalStorage() {
    const savedCvData = localStorage.getItem('cvData');
    const savedTemplate = localStorage.getItem('selectedTemplate');
    const savedColor = localStorage.getItem('selectedColor');
    const savedPhoto = localStorage.getItem('uploadedPhoto');
    
    if (savedCvData) {
        try {
            cvData = JSON.parse(savedCvData);
            populateForm();
        } catch (e) {
            console.warn('Could not load saved CV data');
        }
    }
    
    if (savedTemplate) {
        selectTemplate(savedTemplate);
    }
    
    if (savedColor) {
        selectColor(savedColor);
    }
    
    if (savedPhoto) {
        uploadedPhoto = savedPhoto;
        displayPhoto(savedPhoto);
    }
}

function populateForm() {
    updatePreview();
}

// Auto-save every 30 seconds
setInterval(saveToLocalStorage, 30000);

// Load saved data on page load
window.addEventListener('load', loadFromLocalStorage);
