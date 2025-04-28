import { useState } from 'react';
import { useLanguage } from '../context/languagecontext';

interface PlantData {
  commonName: string;
  scientificName: string;
  description: string;
  careInstructions: string;
  idealConditions: string;
}

export const usePlantIdentification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plantData, setPlantData] = useState<PlantData | null>(null);
  const { locale } = useLanguage();

  const identifyPlant = async (imageBase64: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/identify-plant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64,
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to identify plant');
      }

      setPlantData(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    plantData,
    identifyPlant,
  };
};