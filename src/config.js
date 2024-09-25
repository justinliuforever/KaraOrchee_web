// config.js
const config = {
  local: {
    apiUrl: 'http://localhost:5555/music/',
    ws: 'ws://localhost:8000/ws',
  },
  remote: {
    apiUrl: 'https://music-backend-az25.onrender.com/music/',
    ws: 'wss://karaorchee-cv-backend.onrender.com/ws',
  },
};

const activeEnv = 'local'; // Change to 'remote' for production

export default config[activeEnv];
