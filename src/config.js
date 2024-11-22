// config.js
const config = {
  local: {
    apiUrl: 'http://localhost:5555/music/',
    subscriptionUrl: 'http://localhost:5555/api/subscriptions/',
    ws: 'ws://localhost:8000/ws',
  },
  remote: {
    apiUrl: 'https://music-backend-az25.onrender.com/music/',
    subscriptionUrl: 'https://music-backend-az25.onrender.com/api/subscriptions/',
    ws: 'wss://karaorchee-cv-backend.onrender.com/ws',
  },
};

const activeEnv = 'remote'; // Change to 'remote' for production

export default config[activeEnv];
