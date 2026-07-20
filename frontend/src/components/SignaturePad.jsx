import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const SignaturePad = ({ onSave, label = 'Signature Required' }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState('draw'); // 'draw' or 'upload'
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Setup drawing canvas context
  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Handle high DPI displays
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  }, [mode]);

  // Drawing mouse/touch handlers
  const startDrawing = (e) => {
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getEventCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getEventCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getEventCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Check if touch or mouse
    if (e.touches && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Clear Canvas drawing
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Convert Base64 data URL to File Object
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Save Canvas drawing as file and invoke parent callback
  const saveDrawing = () => {
    const canvas = canvasRef.current;
    // Check if canvas is empty before saving
    const buffer = new Uint32Array(
      canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data.buffer
    );
    const isEmpty = !buffer.some((color) => color !== 0);

    if (isEmpty) {
      toast.error('Please draw a signature first');
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    const signatureFile = dataURLtoFile(dataUrl, 'signature.png');
    onSave(signatureFile);
    toast.success('Signature saved successfully');
  };

  // Handle uploaded file changes
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  // Save uploaded file and invoke parent callback
  const saveUploadedFile = () => {
    if (!file) {
      toast.error('Please select an image file first');
      return;
    }
    onSave(file);
    toast.success('Uploaded signature saved');
  };

  return (
    <div className="card border-1 p-3 bg-light shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <label className="fw-semibold text-secondary small">{label}</label>
        <div className="btn-group btn-group-sm" role="group">
          <button
            type="button"
            className={`btn ${mode === 'draw' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setMode('draw')}
          >
            <i className="bi bi-pencil-fill me-1"></i>Draw
          </button>
          <button
            type="button"
            className={`btn ${mode === 'upload' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setMode('upload')}
          >
            <i className="bi bi-upload me-1"></i>Upload File
          </button>
        </div>
      </div>

      {mode === 'draw' ? (
        <div>
          <div className="signature-canvas-container mb-3">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={clearCanvas}>
              <i className="bi bi-eraser-fill me-1"></i>Clear
            </button>
            <button type="button" className="btn btn-success btn-sm ms-auto" onClick={saveDrawing}>
              <i className="bi bi-check-lg me-1"></i>Save Signature
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-3">
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className="form-text small text-muted">Upload PNG, JPG, or WEBP signature file (max 2MB).</div>
          </div>
          {preview && (
            <div className="text-center mb-3 border bg-white p-2 rounded" style={{ maxHeight: '120px' }}>
              <img
                src={preview}
                alt="Signature preview"
                className="img-fluid"
                style={{ maxHeight: '100px', objectFit: 'contain' }}
              />
            </div>
          )}
          <button
            type="button"
            className="btn btn-success btn-sm w-100"
            onClick={saveUploadedFile}
            disabled={!file}
          >
            <i className="bi bi-check-lg me-1"></i>Confirm Upload
          </button>
        </div>
      )}
    </div>
  );
};

export default SignaturePad;
