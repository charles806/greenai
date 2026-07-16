import { API_CONFIG } from '../config/apiConfig';

const IMAGE_API_KEY = API_CONFIG.GEMINI_API_KEY;
const IMAGE_API_URL = API_CONFIG.GEMINI_API_URL;

export const generateImage = async (prompt: string): Promise<{ url: string; blob: Blob }> => {
  try {
    const response = await fetch(`${IMAGE_API_URL}?key=${IMAGE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: `Generate a high-quality, detailed image based on this description: ${prompt}. Make it visually appealing, creative, and professionally rendered.`,
          },
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: '1:1',
          safetyFilterLevel: 'block_some',
          personGeneration: 'allow_adult',
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(
        errorBody?.error?.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();

    const prediction = data.predictions?.[0];

    if (!prediction?.bytesBase64Encoded) {
      throw new Error('No image data found in response');
    }

    const mimeType = prediction.mimeType || 'image/png';
    const blob = base64ToBlob(prediction.bytesBase64Encoded, mimeType);
    const url = URL.createObjectURL(blob);

    // Return both so the caller can revoke the URL and download without re-fetching
    return { url, blob };
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};

const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64);
  const byteArray = new Uint8Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i);
  }

  return new Blob([byteArray], { type: mimeType });
};

export const downloadImage = (
  blob: Blob,
  filename: string = 'generated-image.png'
): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const revokeImageUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};