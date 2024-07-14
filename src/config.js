// config.js
const config = {
  local: 'http://localhost:5555/music/',
  remote: 'https://music-backend-az25.onrender.com/music/',
};

const activeEnv = 'local'; // Change to 'remote' when deploying to production

export default config[activeEnv];
