import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../Utils/api';

export const usePosts = (token) => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/posts`, {
        headers: { Authorization: `Bearer${token}` },
      });
      return res.data;
    },
    staleTime: 1000 * 60, // 1 minute
    cacheTime: 1000 * 60 * 5,
  });
};
