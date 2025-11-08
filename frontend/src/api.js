import axios from "axios";

// Prod: VITE_API_URL setli ise kullan.
// Dev: Vite proxy kullanıyorsan import.meta.env.DEV === true => relative "" kullan.
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "" : "https://casestudy-fullstack-ai.onrender.com");

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

export const sendMessage = (nickname, text) =>
  api.post("/messages", { nickname, text });

export async function getMessages(limit = 50) {
  try {
    const res = await api.get(`/messages?limit=${limit}`);
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.items)) return res.data.items;
    console.warn("getMessages: unexpected response shape:", res.data);
    return [];
  } catch (err) {
    console.error("getMessages error:", err);
    throw err; // üst tarafta göstermek isteyebiliriz
  }
}
