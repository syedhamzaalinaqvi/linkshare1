// Simple Fabric.js-based image editor
const canvas = new fabric.Canvas('editor', {
  preserveObjectStacking: true,
  backgroundColor: '#ffffff'
});

// Resize canvas to parent width while keeping aspect ratio
function resizeCanvas() {
  const wrap = document.querySelector('.editor-wrap');
  if (!wrap) return;
  const w = Math.min(1100, wrap.clientWidth - 24);
  const h = Math.round(w * 600 / 900);
  canvas.setWidth(w);
  canvas.setHeight(h);
  canvas.renderAll();
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', resizeCanvas);

// Elements
const uploadInput = document.getElementById('uploadInput');
const uploadBtn = document.getElementById('uploadBtn');
const addTextBtn = document.getElementById('addTextBtn');
const drawBtn = document.getElementById('drawBtn');
const stickerBtn = document.getElementById('stickerBtn');
const cropStartBtn = document.getElementById('cropStartBtn');
const applyCropBtn = document.getElementById('applyCropBtn');
const rotateBtn = document.getElementById('rotateBtn');
const flipBtn = document.getElementById('flipBtn');
const clearBtn = document.getElementById('clearBtn');
const exportPngBtn = document.getElementById('exportPngBtn');
const exportJpgBtn = document.getElementById('exportJpgBtn');

uploadBtn.addEventListener('click', () => uploadInput.click());
uploadInput.addEventListener('change', handleUpload);

function handleUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { alert('Please upload an image file.'); return; }

  const reader = new FileReader();
  reader.onload = function(ev) {
    fabric.Image.fromURL(ev.target.result, function(img) {
      // fit to canvas
      const maxW = canvas.getWidth() * 0.95;
      const maxH = canvas.getHeight() * 0.95;
      img.set({ left: canvas.getWidth()/2, top: canvas.getHeight()/2, originX:'center', originY:'center' });
      img.scaleToWidth(maxW);
      if (img.getScaledHeight() > maxH) img.scaleToHeight(maxH);
      img.set({ selectable:true });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.requestRenderAll();
    }, { crossOrigin: 'anonymous' });
  };
  reader.readAsDataURL(file);
  // reset value so same file can be reselected
  e.target.value = '';
}

addTextBtn.addEventListener('click', () => {
  const text = prompt('Enter text to add on image', 'Your text here');
  if (!text) return;
  const textbox = new fabric.Textbox(text, {
    left: canvas.getWidth()/2,
    top: canvas.getHeight()/2,
    originX: 'center',
    originY: 'center',
    fontSize: 28,
    fill: '#222',
    fontFamily: 'Arial',
    editable: true
  });
  canvas.add(textbox);
  canvas.setActiveObject(textbox);
});

stickerBtn.addEventListener('click', () => {
  // add a simple emoji sticker — you can replace with image stickers
  const emoji = prompt('Enter emoji (e.g. 😄) or leave blank to add default', '😄');
  const txt = emoji || '😄';
  const sticker = new fabric.Text(txt, {
    left: 80,
    top: 80,
    fontSize: 64,
    originX: 'center',
    originY: 'center'
  });
  canvas.add(sticker);
  canvas.setActiveObject(sticker);
});

// Drawing
drawBtn.addEventListener('click', () => {
  canvas.isDrawingMode = !canvas.isDrawingMode;
  drawBtn.style.background = canvas.isDrawingMode ? '#e8f8f0' : '';
  // default brush settings
  canvas.freeDrawingBrush.width = 3;
  canvas.freeDrawingBrush.color = '#ff0000';
});

// Rotate selected by 90 degrees
rotateBtn.addEventListener('click', () => {
  const obj = canvas.getActiveObject();
  if (!obj) { alert('Select an object to rotate'); return; }
  obj.rotate((obj.angle || 0) + 90);
  canvas.requestRenderAll();
});

// Flip horizontally
flipBtn.addEventListener('click', () => {
  const obj = canvas.getActiveObject();
  if (!obj) { alert('Select an object to flip'); return; }
  obj.set('flipX', !obj.flipX);
  canvas.requestRenderAll();
});

clearBtn.addEventListener('click', () => {
  if (!confirm('Clear canvas? This will remove all objects.')) return;
  canvas.clear();
  canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
});

// Export helpers
function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

exportPngBtn.addEventListener('click', () => {
  // temporarily disable active object borders for clean export
  const active = canvas.getActiveObject();
  if (active) active.exitEditing?.();
  canvas.discardActiveObject();
  canvas.renderAll();
  const data = canvas.toDataURL({ format: 'png', quality: 1.0 });
  downloadDataUrl(data, 'image-editor-export.png');
});

exportJpgBtn.addEventListener('click', () => {
  canvas.discardActiveObject();
  canvas.renderAll();
  const data = canvas.toDataURL({ format: 'jpeg', quality: 0.92 });
  downloadDataUrl(data, 'image-editor-export.jpg');
});

// Crop: allow user to add/resize a crop rectangle, then apply
let cropRect = null;
let cropping = false;

cropStartBtn.addEventListener('click', () => {
  if (cropping) {
    // cancel crop
    if (cropRect) { canvas.remove(cropRect); cropRect = null; }
    cropping = false;
    cropStartBtn.textContent = ' Crop';
    applyCropBtn.disabled = true;
    return;
  }

  cropping = true;
  cropRect = new fabric.Rect({
    left: canvas.getWidth() * 0.1,
    top: canvas.getHeight() * 0.1,
    width: canvas.getWidth() * 0.8,
    height: canvas.getHeight() * 0.8,
    fill: 'rgba(0,0,0,0.2)',
    stroke: '#fff',
    strokeWidth: 1,
    selectable: true,
    cornerColor: '#fff'
  });
  canvas.add(cropRect);
  canvas.setActiveObject(cropRect);
  applyCropBtn.disabled = false;
  cropStartBtn.textContent = ' Cancel Crop';
});

applyCropBtn.addEventListener('click', () => {
  if (!cropRect) return;
  // get dataURL of full canvas at current resolution
  const fullData = canvas.toDataURL({ format: 'png', quality: 1.0 });
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function() {
    // scale factor between exported image and fabric canvas size
    const scaleX = img.width / canvas.getWidth();
    const scaleY = img.height / canvas.getHeight();

    const sx = Math.round(cropRect.left * scaleX);
    const sy = Math.round(cropRect.top * scaleY);
    const sw = Math.max(1, Math.round(cropRect.width * scaleX));
    const sh = Math.max(1, Math.round(cropRect.height * scaleY));

    const tmp = document.createElement('canvas');
    tmp.width = sw;
    tmp.height = sh;
    const ctx = tmp.getContext('2d');
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    const croppedData = tmp.toDataURL('image/png');

    // replace canvas contents with cropped image
    canvas.clear();
    fabric.Image.fromURL(croppedData, function(i) {
      i.set({ left: canvas.getWidth()/2, top: canvas.getHeight()/2, originX:'center', originY:'center' });
      // fit to canvas
      i.scaleToWidth(canvas.getWidth() * 0.95);
      if (i.getScaledHeight() > canvas.getHeight() * 0.95) i.scaleToHeight(canvas.getHeight() * 0.95);
      canvas.add(i);
      canvas.renderAll();
    }, { crossOrigin: 'anonymous' });

    // cleanup
    canvas.remove(cropRect);
    cropRect = null;
    cropping = false;
    applyCropBtn.disabled = true;
    cropStartBtn.textContent = ' Crop';
  };
  img.src = fullData;
});

// Keep UI consistent when selecting objects
canvas.on('selection:created', () => {});
canvas.on('selection:updated', () => {});

// Initialize
resizeCanvas();
canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
