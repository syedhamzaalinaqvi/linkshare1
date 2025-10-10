// Global variables
let currentStep = 1;
let selectedTemplate = 'modern';
let selectedColor = 'blue';
let uploadedPhoto = null;
let experienceCount = 1;
let educationCount = 1;

// Color themes
const colorThemes = {
    blue: '#2563eb',
    green: '#10b981',
    purple: '#8b5cf6',
    red: '#ef4444',
    orange: '#f97316',
    teal: '#14b8a6'
};

// Auto summary template
const autoSummary = "I am a dynamic, motivated & action-oriented professional seeking to contribute my skills and expertise to your esteemed organization. With strong dedication and commitment, I am ready to deliver exceptional results and contribute to organizational success.";

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    loadSampleData();
    
    // Initialize auto summary preview
    setTimeout(() => {
        toggleAutoSummary();
    }, 100);
    
    updatePreview();
    updateNavigation();
}

function setupEventListeners() {
    // Template selection
    document.getElementById('templateSelect').addEventListener('change', function(e) {
        selectedTemplate = e.target.value;
        updatePreview();
    });

    // Color selection
    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', function() {
            selectColor(this.dataset.theme);
        });
    });

    // Photo upload
    document.getElementById('photoInput').addEventListener('change', handlePhotoUpload);

    // Form inputs
    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', debounce(updatePreview, 300));
    });

    // Auto summary toggle
    document.getElementById('useAutoSummary').addEventListener('change', toggleAutoSummary);
}

// Debounce function
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

// Load sample data
function loadSampleData() {
    document.getElementById('fullName').value = 'John Alexander Smith';
    document.getElementById('jobTitle').value = 'Senior Software Engineer';
    document.getElementById('email').value = 'john.alexander@email.com';
    document.getElementById('phone').value = '+1 (555) 123-4567';
    document.getElementById('technicalSkills').value = 'JavaScript, React, Node.js, Python, SQL, AWS, Docker';
    document.getElementById('softSkills').value = 'Leadership, Communication, Problem Solving, Team Management';
    document.getElementById('languages').value = 'English (Native), Spanish (Fluent), French (Basic)';
    
    // Add sample experience data
    const expTitle = document.querySelector('.exp-title');
    const expCompany = document.querySelector('.exp-company');
    const expDuration = document.querySelector('.exp-duration');
    const expDescription = document.querySelector('.exp-description');
    
    if (expTitle) expTitle.value = 'Senior Software Engineer';
    if (expCompany) expCompany.value = 'Tech Solutions Inc.';
    if (expDuration) expDuration.value = '2022 - Present';
    if (expDescription) expDescription.value = '• Developed and maintained web applications using React and Node.js\n• Led a team of 5 developers in agile development processes\n• Improved system performance by 40% through optimization';
    
    // Add sample education data
    const eduDegree = document.querySelector('.edu-degree');
    const eduInstitution = document.querySelector('.edu-institution');
    const eduDuration = document.querySelector('.edu-duration');
    const eduGrade = document.querySelector('.edu-grade');
    
    if (eduDegree) eduDegree.value = 'Bachelor of Computer Science';
    if (eduInstitution) eduInstitution.value = 'University of Technology';
    if (eduDuration) eduDuration.value = '2018 - 2022';
    if (eduGrade) eduGrade.value = '3.8 GPA';
}

// Multi-step navigation
function nextStep() {
    if (currentStep < 4) {
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        currentStep++;
        document.getElementById(`step-${currentStep}`).classList.add('active');
        updateNavigation();
        updatePreview();
    }
}

function previousStep() {
    if (currentStep > 1) {
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        currentStep--;
        document.getElementById(`step-${currentStep}`).classList.add('active');
        updateNavigation();
        updatePreview();
    }
}

function updateNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const generateBtn = document.getElementById('generateBtn');

    // Previous button
    prevBtn.disabled = currentStep === 1;

    // Next/Generate button
    if (currentStep === 4) {
        nextBtn.style.display = 'none';
        generateBtn.style.display = 'flex';
    } else {
        nextBtn.style.display = 'flex';
        generateBtn.style.display = 'none';
    }
}

// Color selection
function selectColor(color) {
    selectedColor = color;
    
    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.classList.remove('active');
    });
    
    document.querySelector(`[data-theme="${color}"]`).classList.add('active');
    updatePreview();
}

// Photo upload
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedPhoto = e.target.result;
            document.getElementById('photoPreview').innerHTML = 
                `<img src="${uploadedPhoto}" alt="Profile Photo">`;
            updatePreview();
        };
        reader.readAsDataURL(file);
    }
}

// Toggle auto summary
function toggleAutoSummary() {
    const checkbox = document.getElementById('useAutoSummary');
    const textarea = document.getElementById('professionalSummary');
    const autoPreview = document.getElementById('autoSummaryPreview');
    const summaryContent = document.querySelector('.summary-content');
    
    if (checkbox.checked) {
        // Show auto-generated summary preview
        textarea.style.display = 'none';
        autoPreview.style.display = 'block';
        if (summaryContent) {
            summaryContent.textContent = autoSummary;
        }
        textarea.value = autoSummary;
    } else {
        // Show manual textarea
        textarea.style.display = 'block';
        autoPreview.style.display = 'none';
        if (textarea.value === autoSummary) {
            textarea.value = '';
        }
    }
    updatePreview();
}

// Add experience
function addExperience() {
    experienceCount++;
    const container = document.getElementById('experienceContainer');
    const newExp = document.createElement('div');
    newExp.className = 'experience-item';
    newExp.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeExperience(this)">
            <i class="fas fa-times"></i>
        </button>
        <div class="form-row">
            <div class="form-group">
                <label>Job Title</label>
                <input type="text" class="exp-title" placeholder="Software Engineer">
            </div>
            <div class="form-group">
                <label>Company</label>
                <input type="text" class="exp-company" placeholder="Tech Company">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Duration</label>
                <input type="text" class="exp-duration" placeholder="2020 - Present">
            </div>
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea class="exp-description" placeholder="Key responsibilities and achievements"></textarea>
        </div>
    `;
    
    container.appendChild(newExp);
    
    // Add event listeners to new inputs
    newExp.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', debounce(updatePreview, 300));
    });
}

function removeExperience(btn) {
    btn.closest('.experience-item').remove();
    updatePreview();
}

// Add education
function addEducation() {
    educationCount++;
    const container = document.getElementById('educationContainer');
    const newEdu = document.createElement('div');
    newEdu.className = 'education-item';
    newEdu.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeEducation(this)">
            <i class="fas fa-times"></i>
        </button>
        <div class="form-row">
            <div class="form-group">
                <label>Degree</label>
                <input type="text" class="edu-degree" placeholder="Bachelor of Computer Science">
            </div>
            <div class="form-group">
                <label>Institution</label>
                <input type="text" class="edu-institution" placeholder="University Name">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Duration</label>
                <input type="text" class="edu-duration" placeholder="2016 - 2020">
            </div>
            <div class="form-group">
                <label>Grade</label>
                <input type="text" class="edu-grade" placeholder="3.8 GPA">
            </div>
        </div>
    `;
    
    container.appendChild(newEdu);
    
    // Add event listeners to new inputs
    newEdu.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', debounce(updatePreview, 300));
    });
}

function removeEducation(btn) {
    btn.closest('.education-item').remove();
    updatePreview();
}

// Generate CV
function generateCV() {
    updatePreview();
    document.getElementById('actionButtons').style.display = 'flex';
    document.getElementById('generateBtn').style.display = 'none';
    
    // Show success message
    showNotification('✅ CV Generated Successfully! You can now download or print.', 'success');
}

// Update preview
function updatePreview() {
    const data = collectFormData();
    const cvHTML = generateCVHTML(data);
    document.getElementById('cvPreview').innerHTML = cvHTML;
}

// Collect form data
function collectFormData() {
    return {
        personal: {
            fullName: document.getElementById('fullName').value,
            jobTitle: document.getElementById('jobTitle').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            fatherName: document.getElementById('fatherName').value,
            dateOfBirth: document.getElementById('dateOfBirth').value,
            religion: document.getElementById('religion').value,
            nationality: document.getElementById('nationality').value,
            address: document.getElementById('address').value
        },
        experience: collectExperience(),
        education: collectEducation(),
        skills: {
            technical: document.getElementById('technicalSkills').value.split(',').map(s => s.trim()).filter(s => s),
            soft: document.getElementById('softSkills').value.split(',').map(s => s.trim()).filter(s => s),
            languages: document.getElementById('languages').value.split(',').map(s => s.trim()).filter(s => s)
        },
        summary: document.getElementById('professionalSummary').value || autoSummary
    };
}

function collectExperience() {
    const experiences = [];
    document.querySelectorAll('.experience-item').forEach(item => {
        const title = item.querySelector('.exp-title').value;
        const company = item.querySelector('.exp-company').value;
        const duration = item.querySelector('.exp-duration').value;
        const description = item.querySelector('.exp-description').value;
        
        if (title || company) {
            experiences.push({ title, company, duration, description });
        }
    });
    return experiences;
}

function collectEducation() {
    const educations = [];
    document.querySelectorAll('.education-item').forEach(item => {
        const degree = item.querySelector('.edu-degree').value;
        const institution = item.querySelector('.edu-institution').value;
        const duration = item.querySelector('.edu-duration').value;
        const grade = item.querySelector('.edu-grade').value;
        
        if (degree || institution) {
            educations.push({ degree, institution, duration, grade });
        }
    });
    return educations;
}

// Generate CV HTML
function generateCVHTML(data) {
    if (!data.personal.fullName && !data.personal.jobTitle) {
        return `
            <div class="preview-placeholder">
                <i class="fas fa-eye"></i>
                <p>Fill in your basic information to see the preview</p>
            </div>
        `;
    }

    const primaryColor = colorThemes[selectedColor];
    
    if (selectedTemplate === 'modern') {
        return generateModernTemplate(data, primaryColor);
    } else if (selectedTemplate === 'classic') {
        return generateClassicTemplate(data, primaryColor);
    }
    
    return generateModernTemplate(data, primaryColor);
}

function generateModernTemplate(data, primaryColor) {
    return `
        <div class="cv-template modern" style="--cv-primary: ${primaryColor};">
            <div class="cv-sidebar">
                <div class="cv-header">
                    ${uploadedPhoto ? `<img src="${uploadedPhoto}" alt="Profile" class="cv-photo">` : ''}
                    <div class="cv-name">${data.personal.fullName}</div>
                    <div class="cv-title">${data.personal.jobTitle}</div>
                </div>
                
                ${generateContactSection(data)}
                ${generatePersonalSection(data)}
                ${generateSkillsSection(data)}
            </div>
            
            <div class="cv-main">
                ${generateSummarySection(data)}
                ${generateExperienceSection(data)}
                ${generateEducationSection(data)}
            </div>
        </div>
    `;
}

function generateClassicTemplate(data, primaryColor) {
    return `
        <div class="cv-template classic" style="--cv-primary: ${primaryColor};">
            <div class="cv-header">
                ${uploadedPhoto ? `<img src="${uploadedPhoto}" alt="Profile" class="cv-photo">` : ''}
                <div class="cv-name">${data.personal.fullName}</div>
                <div class="cv-title">${data.personal.jobTitle}</div>
                <div style="margin-top: 1rem; color: #6b7280;">
                    ${data.personal.email} ${data.personal.phone ? `| ${data.personal.phone}` : ''}
                </div>
            </div>
            
            ${generateSummarySection(data)}
            ${generateExperienceSection(data)}
            ${generateEducationSection(data)}
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
                <div>${generateSkillsSection(data)}</div>
                <div>${generatePersonalSection(data)}</div>
            </div>
        </div>
    `;
}

function generateContactSection(data) {
    if (!data.personal.email && !data.personal.phone) return '';
    
    return `
        <div class="cv-section">
            <div class="cv-section-title">Contact</div>
            ${data.personal.email ? `<div class="cv-contact-item"><i class="fas fa-envelope"></i>${data.personal.email}</div>` : ''}
            ${data.personal.phone ? `<div class="cv-contact-item"><i class="fas fa-phone"></i>${data.personal.phone}</div>` : ''}
            ${data.personal.address ? `<div class="cv-contact-item"><i class="fas fa-map-marker-alt"></i>${data.personal.address}</div>` : ''}
        </div>
    `;
}

function generatePersonalSection(data) {
    const hasPersonalData = data.personal.fatherName || data.personal.dateOfBirth || 
                           data.personal.religion || data.personal.nationality;
    
    if (!hasPersonalData) return '';
    
    return `
        <div class="cv-section">
            <div class="cv-section-title">Personal Details</div>
            ${data.personal.fatherName ? `<div class="cv-personal-item"><strong>Father:</strong> ${data.personal.fatherName}</div>` : ''}
            ${data.personal.dateOfBirth ? `<div class="cv-personal-item"><strong>DOB:</strong> ${data.personal.dateOfBirth}</div>` : ''}
            ${data.personal.religion ? `<div class="cv-personal-item"><strong>Religion:</strong> ${data.personal.religion}</div>` : ''}
            ${data.personal.nationality ? `<div class="cv-personal-item"><strong>Nationality:</strong> ${data.personal.nationality}</div>` : ''}
        </div>
    `;
}

function generateSkillsSection(data) {
    const hasSkills = data.skills.technical.length || data.skills.soft.length || data.skills.languages.length;
    if (!hasSkills) return '';
    
    return `
        <div class="cv-section">
            <div class="cv-section-title">Skills</div>
            ${data.skills.technical.length ? `
                <div style="margin-bottom: 1rem;">
                    <strong style="font-size: 0.9rem; margin-bottom: 0.5rem; display: block;">Technical</strong>
                    <div class="cv-skills">
                        ${data.skills.technical.map(skill => `<span class="cv-skill">${skill}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            ${data.skills.soft.length ? `
                <div style="margin-bottom: 1rem;">
                    <strong style="font-size: 0.9rem; margin-bottom: 0.5rem; display: block;">Soft Skills</strong>
                    <div class="cv-skills">
                        ${data.skills.soft.map(skill => `<span class="cv-skill">${skill}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            ${data.skills.languages.length ? `
                <div>
                    <strong style="font-size: 0.9rem; margin-bottom: 0.5rem; display: block;">Languages</strong>
                    <div class="cv-skills">
                        ${data.skills.languages.map(skill => `<span class="cv-skill">${skill}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function generateSummarySection(data) {
    if (!data.summary) return '';
    
    return `
        <div class="cv-section">
            <div class="cv-section-title">Professional Summary</div>
            <p style="text-align: justify; line-height: 1.7; color: #4b5563;">${data.summary}</p>
        </div>
    `;
}

function generateExperienceSection(data) {
    // Always show experience table even if empty, with sample data for demonstration
    const experienceData = data.experience.length > 0 ? data.experience : [
        {
            title: 'Senior Software Engineer',
            company: 'Tech Solutions Inc.',
            duration: '2022 - Present',
            description: '• Developed and maintained web applications using modern frameworks\n• Led a team of 5 developers in agile development processes\n• Improved system performance by 40% through code optimization'
        }
    ];
    
    return `
        <div class="cv-section">
            <div class="cv-section-title">Work Experience</div>
            <table class="cv-table">
                <thead>
                    <tr>
                        <th style="width: 35%;">Position & Company</th>
                        <th style="width: 20%;">Duration</th>
                        <th style="width: 45%;">Key Responsibilities & Achievements</th>
                    </tr>
                </thead>
                <tbody>
                    ${experienceData.map(exp => `
                        <tr>
                            <td>
                                <div class="job-title">${exp.title || 'Software Engineer'}</div>
                                <div class="company-name">${exp.company || 'Technology Company'}</div>
                            </td>
                            <td>
                                <span class="duration">${exp.duration || '2020 - Present'}</span>
                            </td>
                            <td>
                                <div class="description">${exp.description || '• Developed software applications\n• Collaborated with cross-functional teams\n• Delivered high-quality solutions'}</div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function generateEducationSection(data) {
    // Always show education table even if empty, with sample data for demonstration
    const educationData = data.education.length > 0 ? data.education : [
        {
            degree: 'Bachelor of Computer Science',
            institution: 'University of Technology',
            duration: '2018 - 2022',
            grade: '3.8 GPA'
        }
    ];
    
    return `
        <div class="cv-section">
            <div class="cv-section-title">Education</div>
            <table class="cv-table">
                <thead>
                    <tr>
                        <th style="width: 40%;">Degree & Institution</th>
                        <th style="width: 25%;">Duration</th>
                        <th style="width: 35%;">Grade/CGPA</th>
                    </tr>
                </thead>
                <tbody>
                    ${educationData.map(edu => `
                        <tr>
                            <td>
                                <div class="degree-title">${edu.degree || 'Bachelor Degree'}</div>
                                <div class="institution-name">${edu.institution || 'University Name'}</div>
                            </td>
                            <td>
                                <span class="duration">${edu.duration || '2018 - 2022'}</span>
                            </td>
                            <td>
                                <span class="grade">${edu.grade || '3.5 GPA'}</span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Download PDF
function downloadPDF() {
    const element = document.getElementById('cvPreview');
    const name = document.getElementById('fullName').value || 'CV';
    
    // Show loading notification
    showNotification('🔄 Generating PDF...', 'info');
    
    const opt = {
        margin: 0.5,
        filename: `${name.replace(/\s+/g, '_')}_CV.pdf`,
        image: { 
            type: 'jpeg', 
            quality: 0.98
        },
        html2canvas: { 
            scale: 2,
            useCORS: true
        },
        jsPDF: { 
            unit: 'in', 
            format: 'a4', 
            orientation: 'portrait'
        }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
        showNotification('✅ CV downloaded successfully!', 'success');
    }).catch((error) => {
        console.error('PDF generation error:', error);
        showNotification('⚠️ PDF generation failed. Please try again.', 'error');
    });
}

// Print CV
function printCV() {
    const printWindow = window.open('', '_blank');
    const cvContent = document.getElementById('cvPreview').innerHTML;
    
    // Get current CSS styles
    const styleSheets = Array.from(document.styleSheets);
    let allCSS = '';
    
    styleSheets.forEach(sheet => {
        try {
            if (sheet.cssRules) {
                Array.from(sheet.cssRules).forEach(rule => {
                    allCSS += rule.cssText;
                });
            }
        } catch (e) {
            // Handle CORS issues with external stylesheets
            console.log('Could not access stylesheet:', e);
        }
    });
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>CV - ${document.getElementById('fullName').value}</title>
            <meta charset="UTF-8">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    margin: 0; 
                    padding: 15mm; 
                    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
                    background: white;
                }
                ${allCSS}
                .cv-template { 
                    box-shadow: none !important; 
                    margin: 0 !important;
                    width: 100% !important;
                    max-width: none !important;
                }
                .cv-table {
                    page-break-inside: avoid;
                    border: 1px solid #e5e7eb;
                }
                .cv-table th {
                    background: var(--cv-primary, #2563eb) !important;
                    color: white !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .cv-sidebar {
                    background: var(--cv-primary, #2563eb) !important;
                    color: white !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .cv-skill {
                    background: rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                @page {
                    margin: 15mm;
                    size: A4;
                }
            </style>
        </head>
        <body>${cvContent}</body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }, 500);
    
    showNotification('✅ CV sent to printer!', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#2563eb'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
