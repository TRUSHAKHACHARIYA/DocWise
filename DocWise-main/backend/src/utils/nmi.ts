import axios from 'axios';
import { env } from '../config/env';

const baseURL = env.NMI_API_BASE_URL.replace(/\/+$/, '');

export const nmi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: env.NMI_PRIVATE_API_KEY,
  },
  timeout: 15000,
});
