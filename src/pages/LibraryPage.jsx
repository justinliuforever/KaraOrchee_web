// LibraryPage.js
import React, { useEffect, useState } from 'react';

import MusicCard from '../components/MusicCard';
import axios from 'axios';
import config from '../config'; // Import the API URL from the config file

const LibraryPage = () => {
  const [musicData, setMusicData] = useState([]);

  useEffect(() => {
    const fetchMusicData = async () => {
      try {
        const response = await axios.get(config.apiUrl);
        
        if (Array.isArray(response.data)) {
          setMusicData(response.data);
        } else {
          console.error('Expected an array but got:', response.data);
        }
      } catch (error) {
        console.error('Error fetching music data:', error);
      }
    };

    fetchMusicData();
  }, []);

  return (
    <main className="grid place-items-center min-h-screen bg-gradient-to-t from-blue-200 to-indigo-900 p-5">
      <div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-gray-200 mb-5">Music Library</h1>
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {musicData.map((music, index) => (
            <MusicCard
              key={index}
              imageUrl={music.musicPictureURL}
              title={music.title}
              artist={music.artist}
              id={music._id}
            />
          ))}
        </section>
      </div>
    </main>
  );
};

export default LibraryPage;
