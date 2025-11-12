import axios, { AxiosResponse } from 'axios';

const API_URL = 'https://casestudy-fullstack-ai.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Message {
  id: number;
  nickname: string;
  text: string;
  sentimentLabel: string;
  sentimentScore: number;
  createdAt: string;
}

// Mesaj gönder (ELLE YAZILDI)
export const sendMessage = (
  nickname: string,
  text: string,
): Promise<AxiosResponse<Message>> => {
  return api.post<Message>('/messages', { nickname, text });
};

// Mesajları getir (ELLE YAZILDI)
export const getMessages = (
  limit: number = 50,
): Promise<AxiosResponse<Message[]>> => {
  return api.get<Message[]>(`/messages?limit=${limit}`);
};

export default api;