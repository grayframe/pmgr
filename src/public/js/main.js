// Socket.IO connection
const socket = io();

// DOM Elements
const uploadContainer = document.getElementById('upload-container');
const fileInput = document.getElementById('file-input');
const browseButton = document.getElementById('browse-button');
const uploadProgress = document.getElementById('upload-progress');
const uploadStatus = document.getElementById('upload-status');
const uploadPercentage = document.getElementById('upload-percentage');
const uploadBar = document.getElementById('upload-bar');
const uploadPreview = document.getElementById('upload-preview');
const previewImage = document.getElementById('preview-image');
const retryButton = document.getElementById('retry-button');
const confirmButton = document.getElementById('confirm-button');
const uploadSuccess = document.getElementById('upload-success');

// File handling
let currentFile = null;

// Drag and drop handlers
uploadContainer.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadContainer.classList.add('border-blue-500');
});

uploadContainer.addEventListener('dragleave', () => {
  uploadContainer.classList.remove('border-blue-500');
});

uploadContainer.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadContainer.classList.remove('border-blue-500');
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFile(files[0]);
  }
});

// Browse button handler
browseButton.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleFile(e.target.files[0]);
  }
});

// File handling
function handleFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    alert('File size must be less than 10MB');
    return;
  }

  currentFile = file;
  showPreview(file);
  uploadFile(file);
}

function showPreview(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.src = e.target.result;
    uploadPreview.classList.remove('hidden');
    uploadProgress.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function uploadFile(file) {
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('title', file.name.replace(/\.[^/.]+$/, '')); // Use filename as title
  formData.append('description', ''); // Empty description by default

  uploadStatus.textContent = 'Uploading...';
  uploadPercentage.textContent = '0%';
  uploadBar.style.width = '0%';

  fetch('/api/photos', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    return response.json();
  })
  .then(data => {
    showSuccess();
    // Emit socket event for real-time updates
    socket.emit('photo-update', {
      photoId: data.id,
      updates: data
    });
  })
  .catch(error => {
    console.error('Upload error:', error);
    uploadStatus.textContent = 'Upload failed';
    uploadPercentage.textContent = 'Error';
    uploadBar.style.width = '0%';
    uploadBar.classList.add('bg-red-500');
  });
}

function showSuccess() {
  uploadProgress.classList.add('hidden');
  uploadPreview.classList.add('hidden');
  uploadSuccess.classList.remove('hidden');
}

// Retry and confirm button handlers
retryButton.addEventListener('click', () => {
  uploadPreview.classList.add('hidden');
  uploadProgress.classList.add('hidden');
  uploadSuccess.classList.add('hidden');
  uploadBar.classList.remove('bg-red-500');
  if (currentFile) {
    uploadFile(currentFile);
  }
});

confirmButton.addEventListener('click', () => {
  showSuccess();
});

// Socket.IO event handlers
socket.on('photo-updated', (data) => {
  // Handle real-time updates from other users
  console.log('Photo updated:', data);
}); 