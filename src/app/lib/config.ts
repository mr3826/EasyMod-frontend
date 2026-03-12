// Environment configuration with validation
interface Config {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
const environment = (import.meta.env.VITE_ENV || import.meta.env.MODE || 'development') as Config['environment'];

if (!apiBaseUrl) {
  throw new Error('Missing API base URL. Set VITE_API_BASE_URL or VITE_API_URL.');
}

const config: Config = {
  apiBaseUrl,
  environment,
};

// Validate environment value
const validEnvironments = ['development', 'staging', 'production'];
if (!validEnvironments.includes(config.environment)) {
  throw new Error(`Invalid VITE_ENV: ${config.environment}. Must be one of: ${validEnvironments.join(', ')}`);
}

export default config;