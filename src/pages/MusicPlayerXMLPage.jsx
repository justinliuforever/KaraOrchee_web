import React, { useEffect, useRef } from 'react';

import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

const MusicPlayerXMLPage = () => {
    const osmdContainerRef = useRef(null);
    const osmdRef = useRef(null);

    useEffect(() => {
        const loadMusicXML = async () => {
            const response = await fetch('/test.musicxml');
            const musicXML = await response.text();

            if (osmdRef.current) {
                await osmdRef.current.load(musicXML);
                osmdRef.current.render();
            }
        };

        if (!osmdRef.current && osmdContainerRef.current) {
            osmdRef.current = new OpenSheetMusicDisplay(osmdContainerRef.current);
            loadMusicXML();
        }
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Rachmaninoff Piano Concerto No.2 Mov.3</h1>
            <div ref={osmdContainerRef} className="osmd-container border p-4 bg-white shadow-md"></div>
        </div>
    );
};

export default MusicPlayerXMLPage;
