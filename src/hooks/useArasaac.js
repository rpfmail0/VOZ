import { useState, useEffect, useCallback } from 'react';

const ARASAAC_API_BASE_URL = 'https://api.arasaac.org/api';
const LOCAL_STORAGE_KEY = 'pictogramApp.pictograms';

const useArasaac = (searchTerm, appMode) => {
  const [allPictograms, setAllPictograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPictograms = async () => {
      if (!searchTerm || appMode !== 'phraseBuilder') {
        setAllPictograms([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const words = searchTerm.trim().split(/\s+/);
        const results = [];

        for (const word of words) {
          if (word) {
            const response = await fetch(`${ARASAAC_API_BASE_URL}/pictograms/es/search/${encodeURIComponent(word)}`);
            if (!response.ok) {
              results.push({ id: `text-${word}`, text: word, imageUrl: '' });
              continue;
            }
            const data = await response.json();
            if (data && data.length > 0) {
              const item = data[0];
              results.push({
                id: item._id,
                text: item.keywords[0]?.keyword || word,
                imageUrl: `${ARASAAC_API_BASE_URL}/pictograms/${item._id}`
              });
            } else {
               results.push({ id: `text-${word}`, text: word, imageUrl: '' });
            }
          }
        }

        setAllPictograms(results);
        setLoading(false);

      } catch (err) {
        setError(err);
        setLoading(false);
        console.error("Error fetching pictograms:", err);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchPictograms();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, appMode]);

  useEffect(() => {
    if (allPictograms.length > 0 && !error) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allPictograms));
    }
  }, [allPictograms, error]);

  const fetchSinglePictogram = useCallback(async (word) => {
    if (!word) return null;
    try {
      const response = await fetch(`${ARASAAC_API_BASE_URL}/pictograms/es/search/${encodeURIComponent(word)}`);
      const data = response.ok ? await response.json() : [];
      if (data.length > 0) {
        const item = data[0];
        return {
          id: item._id,
          text: item.keywords[0]?.keyword || word,
          imageUrl: `${ARASAAC_API_BASE_URL}/pictograms/${item._id}`,
        };
      } else {
        return { id: `text-${word}`, text: word, imageUrl: '' };
      }
    } catch (err) {
      console.error("Error fetching single pictogram:", err);
      setError(err);
      return { id: `text-${word}`, text: word, imageUrl: '' };
    }
  }, []);

  return { allPictograms, setAllPictograms, loading, setLoading, error, fetchSinglePictogram };
};

export default useArasaac;
