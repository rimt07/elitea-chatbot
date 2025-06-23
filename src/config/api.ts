interface ApiConfig {
  baseUrl: string;
  bearerToken: string;
  cookie: string;
}

const getApiConfig = (): ApiConfig => {
  const baseUrl = import.meta.env.VITE_ELITEA_API_URL;
  const bearerToken = import.meta.env.VITE_ELITEA_BEARER_TOKEN;
  const cookie = import.meta.env.VITE_ELITEA_COOKIE;

  if (!baseUrl || !bearerToken) {
    throw new Error(
      'Missing required environment variables. Please check your .env file and ensure VITE_ELITEA_API_URL and VITE_ELITEA_BEARER_TOKEN are set.'
    );
  }

  return {
    baseUrl,
    bearerToken,
    cookie: cookie || ''
  };
};

export const apiConfig = getApiConfig();