// Environment configuration with validation
interface Config {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
}

// Validate required environment variables
const requiredEnvVars = ['VITE_API_BASE_URL', 'VITE_ENV'];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

const config: Config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  environment: import.meta.env.VITE_ENV as Config['environment'],
};

// Validate environment value
const validEnvironments = ['development', 'staging', 'production'];
if (!validEnvironments.includes(config.environment)) {
  throw new Error(`Invalid VITE_ENV: ${config.environment}. Must be one of: ${validEnvironments.join(', ')}`);
}

export default config;