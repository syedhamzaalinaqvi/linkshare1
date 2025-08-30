// Initialize variables
let pdfFiles = [];
let mergedPdfBytes = null;
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const mergeButton = document.getElementById('mergeButton');
const clearButton = document.getElementById('clearButton');
const progressBar = document.getElementById('progressBar');
const progress = document.getElementById('progress');
const orderControls = document.getElementById('orderControls');
const mergedResult = document.getElementById('mergedResult');
const downloadButton = document.getElementById('downloadButton');
const recentFilesList = document.getElementById('recentFilesList');

// Load recent files from localStorage
let recentFiles = JSON.parse(localStorage.getItem('recentPdfMerges') || '[]');

// Drag and drop handlers
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '#f0f8ff';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '';
    const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
    if (files.length === 0) {
        alert('Please drop only PDF files.');
        return;
    }
    handleFiles(files);
});

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
    if (files.length === 0) {
        alert('Please select only PDF files.');
        return;
    }
    handleFiles(files);
    fileInput.value = ''; // Clear the input for future selections
});

function handleFiles(files) {
    files.forEach(file => {
        if (!pdfFiles.some(f => f.name === file.name)) {
            pdfFiles.push(file);
            addFileToList(file);
        }
    });
    updateButtons();
    if (pdfFiles.length >= 2) {
        orderControls.style.display = 'block';
    }
}

// Initialize drag and drop sorting
new Sortable(fileList, {
    animation: 150,
    ghostClass: 'dragging',
    onEnd: function(evt) {
        const item = pdfFiles[evt.oldIndex];
        pdfFiles.splice(evt.oldIndex, 1);
        pdfFiles.splice(evt.newIndex, 0, item);
    }
});

function addFileToList(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    
    const icon = document.createElement('i');
    icon.className = 'fas fa-file-pdf';
    icon.style.color = '#dc3545';
    
    const fileDetails = document.createElement('div');
    fileDetails.innerHTML = `
        <div class="file-name">${file.name}</div>
        <div class="file-size">${formatFileSize(file.size)}</div>
    `;
    
    const removeButton = document.createElement('div');
    removeButton.className = 'remove-file';
    removeButton.innerHTML = '<i class="fas fa-times"></i>';
    removeButton.onclick = () => removeFile(file.name);
    
    fileInfo.appendChild(icon);
    fileInfo.appendChild(fileDetails);
    fileItem.appendChild(fileInfo);
    fileItem.appendChild(removeButton);
    fileList.appendChild(fileItem);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function removeFile(fileName) {
    pdfFiles = pdfFiles.filter(file => file.name !== fileName);
    fileList.innerHTML = '';
    pdfFiles.forEach(file => addFileToList(file));
    updateButtons();
    orderControls.style.display = pdfFiles.length >= 2 ? 'block' : 'none';
    mergedResult.style.display = 'none';
}

function updateButtons() {
    mergeButton.disabled = pdfFiles.length < 2;
    clearButton.disabled = pdfFiles.length === 0;
}

function updateRecentFiles() {
    recentFilesList.innerHTML = '';
    recentFiles.forEach((merge, index) => {
        const item = document.createElement('div');
        item.className = 'recent-file-item';
        item.innerHTML = `
            <div class="delete-recent" onclick="deleteRecentMerge(${index})">
                <i class="fas fa-times"></i>
            </div>
            <div><strong>${merge.files.length} files merged</strong></div>
            <div class="date">${new Date(merge.date).toLocaleDateString()}</div>
            <div>Total Size: ${merge.totalSize}</div>
            <div class="files-list">${merge.files.join(', ')}</div>
        `;
        recentFilesList.appendChild(item);
    });
}

function deleteRecentMerge(index) {
    recentFiles.splice(index, 1);
    localStorage.setItem('recentPdfMerges', JSON.stringify(recentFiles));
    updateRecentFiles();
}

// Clear all recent merges
document.getElementById('clearRecentBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all merge history?')) {
        recentFiles = [];
        localStorage.setItem('recentPdfMerges', JSON.stringify(recentFiles));
        updateRecentFiles();
    }
});

// Merge PDFs
mergeButton.addEventListener('click', async () => {
    try {
        progressBar.style.display = 'block';
        progress.style.width = '0%';
        mergeButton.disabled = true;
        clearButton.disabled = true;

        const pdfDoc = await PDFLib.PDFDocument.create();
        let totalPages = 0;
        let currentPage = 0;

        // First count total pages
        for (const file of pdfFiles) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
            totalPages += pdf.getPageCount();
        }

        // Then merge PDFs
        for (const file of pdfFiles) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
            const pages = await pdfDoc.copyPages(pdf, pdf.getPageIndices());
            pages.forEach(page => {
                pdfDoc.addPage(page);
                currentPage++;
                progress.style.width = `${(currentPage / totalPages) * 100}%`;
            });
        }

        mergedPdfBytes = await pdfDoc.save();
        
        // Save to recent files
        const newMerge = {
            date: new Date().toISOString(),
            fileCount: pdfFiles.length,
            totalSize: formatFileSize(mergedPdfBytes.length),
            files: pdfFiles.map(f => f.name)
        };
        recentFiles.unshift(newMerge);
        if (recentFiles.length > 5) recentFiles.pop();
        localStorage.setItem('recentPdfMerges', JSON.stringify(recentFiles));
        
        // Update UI
        document.getElementById('mergedFileSize').textContent = formatFileSize(mergedPdfBytes.length);
        progressBar.style.display = 'none';
        mergedResult.style.display = 'block';
        updateRecentFiles();
        
        mergeButton.disabled = false;
        clearButton.disabled = false;
    } catch (error) {
        console.error('Error merging PDFs:', error);
        alert('An error occurred while merging the PDF files. Please try again.');
        progressBar.style.display = 'none';
        mergeButton.disabled = false;
        clearButton.disabled = false;
    }
});

// Handle file name input
const mergedFileName = document.getElementById('mergedFileName');
const finalFileName = document.getElementById('finalFileName');

function updateFinalFileName() {
    const timestamp = new Date().toISOString().slice(0,10);
    const customName = mergedFileName.value.trim();
    const fileName = customName ? 
        (customName.endsWith('.pdf') ? customName : `${customName}.pdf`) : 
        `linkshare_merger_${timestamp}.pdf`;
    finalFileName.textContent = fileName;
    return fileName;
}

mergedFileName.addEventListener('input', updateFinalFileName);

// Download merged PDF
downloadButton.addEventListener('click', () => {
    if (mergedPdfBytes) {
        const fileName = updateFinalFileName();
        download(mergedPdfBytes, fileName, "application/pdf");
    }
});

// Clear all files
clearButton.addEventListener('click', () => {
    pdfFiles = [];
    fileList.innerHTML = '';
    mergedResult.style.display = 'none';
    orderControls.style.display = 'none';
    mergedPdfBytes = null;
    mergedFileName.value = ''; // Clear the filename input
    updateFinalFileName(); // Reset the filename preview
    updateButtons();
});

// Initialize recent files list
updateRecentFiles();

// Mobile menu toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Scroll to Top Button
const scrollToTopBtn = document.querySelector('.scroll-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});




