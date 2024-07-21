// Import necessary libraries
import React, { useEffect, useRef } from 'react';

import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

// Create a component to display the music score
const MusicXMLViewer = ({ musicXML }) => {
  const osmdContainer = useRef(null);
  const osmd = useRef(null);

  useEffect(() => {
    const loadMusicXML = async () => {
      if (osmdContainer.current) {
        osmd.current = new OpenSheetMusicDisplay(osmdContainer.current);
        try {
          console.log('Loading MusicXML:', musicXML); // Log the MusicXML data
          await osmd.current.load(musicXML);
          osmd.current.render();
        } catch (error) {
          console.error('Error loading MusicXML:', error);
        }
      }
    };
    loadMusicXML();
  }, [musicXML]);

  return <div ref={osmdContainer} className="osmd-container"></div>;
};

export default MusicXMLViewer;
