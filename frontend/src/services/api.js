import axios from 'axios';

/**
 * Axios instance — Vite proxy forwards /predict → http://localhost:8000
 */
const api = axios.create({
  timeout: 30_000,
});

/**
 * @param {File} file
 * @returns {Promise<{ prediction: "Real" | "Fake", confidence: number }>}
 */
export async function predictImage(file) {
  const form = new FormData();
  form.append('file', file);

  const { data } = await api.post('/predict', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
}
