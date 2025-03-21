document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('uploadForm');
  const fileInput = document.getElementById('fileInput');
  const dropZone = document.getElementById('dropZone');
  const progressBar = document.getElementById('progressBar');
  const preview = document.getElementById('preview');
  const previewImage = document.getElementById('previewImage');
  const retryButton = document.getElementById('retryButton');
  const confirmButton = document.getElementById('confirmButton');
  const successMessage = document.getElementById('successMessage');

  // Handle file selection
  fileInput.addEventListener('change', handleFileSelect);
  dropZone.addEventListener('click', () => fileInput.click());

  // Handle drag and drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-blue-500');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-blue-500');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-blue-500');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      fileInput.files = files;
      handleFileSelect({ target: fileInput });
    }
  });

  // Handle form submission
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);
    formData.append('title', file.name.replace(/\.[^/.]+$/, '')); // Use filename as title
    formData.append('description', ''); // Empty description for now

    try {
      progressBar.classList.remove('hidden');
      const response = await fetch('/photos', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      successMessage.classList.remove('hidden');
      preview.classList.add('hidden');
      uploadForm.reset();
    } catch (error) {
      console.error('Upload error:', error);
      retryButton.classList.remove('hidden');
    } finally {
      progressBar.classList.add('hidden');
    }
  });

  // Handle retry
  retryButton.addEventListener('click', () => {
    retryButton.classList.add('hidden');
    preview.classList.remove('hidden');
  });

  // Handle file selection
  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
      preview.classList.remove('hidden');
      retryButton.classList.add('hidden');
      successMessage.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  }
}); 