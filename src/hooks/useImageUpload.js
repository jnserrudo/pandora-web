// src/hooks/useImageUpload.js
// Hook compartido para subir imágenes con compresión automática y feedback de estado.
import { useState } from 'react';
import { uploadImage } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Comprime una imagen usando Canvas API si supera 2MB.
 * Si la compresión falla, devuelve el archivo original.
 */
const compressImage = (file) => {
  return new Promise((resolve) => {
    const COMPRESS_THRESHOLD = 2 * 1024 * 1024;
    if (file.size <= COMPRESS_THRESHOLD) return resolve(file);

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      console.warn('compressImage: error loading image, using original');
      resolve(file); // fallback al original
    };

    img.onload = () => {
      try {
        const MAX_WIDTH = 1920;
        const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob) {
              console.warn('compressImage: toBlob returned null, using original');
              return resolve(file);
            }
            // Solo usar comprimido si es efectivamente más pequeño
            const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
            resolve(compressed.size < file.size ? compressed : file);
          },
          'image/jpeg',
          0.85
        );
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        console.warn('compressImage: canvas error, using original', err);
        resolve(file);
      }
    };

    img.src = objectUrl;
  });
};

/**
 * Hook reutilizable para manejo de subida de imágenes en formularios ABM.
 * @returns {{ uploading, uploadError, handleImageUpload }}
 */
export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const { token } = useAuth();
  const { showToast } = useToast();

  const handleImageUpload = async (file, onSuccess) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      const msg = 'Tipo de archivo no válido. Se aceptan: JPG, PNG, GIF, WebP.';
      setUploadError(msg);
      showToast(msg, 'error');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      const msg = 'La imagen supera el tamaño máximo de 10MB.';
      setUploadError(msg);
      showToast(msg, 'error');
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      showToast('Procesando imagen...', 'info');
      const fileToUpload = await compressImage(file);
      const result = await uploadImage(fileToUpload, token);
      const imageUrl = result?.url || result?.imageUrl;
      if (!imageUrl) throw new Error('No se recibió URL del servidor.');

      onSuccess(imageUrl);
      showToast('Imagen subida correctamente.', 'success');
    } catch (err) {
      console.error('useImageUpload error:', err);
      const msg = err.response?.data?.message || err.message || 'Error al subir imagen.';
      setUploadError(msg);
      showToast(msg, 'error');
    } finally {
      setUploading(false);
    }
  };

  const fromInputEvent = (e, onSuccess) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file, onSuccess);
    // Reset input so selecting the same file again triggers onChange
    e.target.value = '';
  };

  return { uploading, uploadError, handleImageUpload, fromInputEvent };
};
