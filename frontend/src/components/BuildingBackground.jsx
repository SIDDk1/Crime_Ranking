import React from 'react';
import './BuildingBackground.css';

const BuildingBackground = () => {
  return (
    <div className="building-background">
      <div className="scene-container">
        <div className="camera-rig">
          <div className="buildings-3d">
            {/* Front buildings */}
            <div className="building-3d building-front-1" style={{ '--x': '-150px', '--z': '200px', '--height': '380px' }}></div>
            <div className="building-3d building-front-2" style={{ '--x': '200px', '--z': '250px', '--height': '450px' }}></div>
            <div className="building-3d building-front-3" style={{ '--x': '-50px', '--z': '50px', '--height': '320px' }}></div>
            <div className="building-3d building-front-4" style={{ '--x': '350px', '--z': '300px', '--height': '480px' }}></div>
            
            {/* Middle buildings */}
            <div className="building-3d building-middle-1" style={{ '--x': '-250px', '--z': '-100px', '--height': '280px' }}></div>
            <div className="building-3d building-middle-2" style={{ '--x': '50px', '--z': '0px', '--height': '340px' }}></div>
            <div className="building-3d building-middle-3" style={{ '--x': '250px', '--z': '-200px', '--height': '300px' }}></div>
            <div className="building-3d building-middle-4" style={{ '--x': '-100px', '--z': '-50px', '--height': '380px' }}></div>
            
            {/* Back buildings */}
            <div className="building-3d building-back-1" style={{ '--x': '-350px', '--z': '-300px', '--height': '220px' }}></div>
            <div className="building-3d building-back-2" style={{ '--x': '150px', '--z': '-400px', '--height': '200px' }}></div>
            <div className="building-3d building-back-3" style={{ '--x': '400px', '--z': '-250px', '--height': '240px' }}></div>
            <div className="building-3d building-back-4" style={{ '--x': '-200px', '--z': '-350px', '--height': '180px' }}></div>
            
            {/* Additional buildings for depth */}
            <div className="building-3d building-extra-1" style={{ '--x': '450px', '--z': '150px', '--height': '420px' }}></div>
            <div className="building-3d building-extra-2" style={{ '--x': '-300px', '--z': '200px', '--height': '360px' }}></div>
            <div className="building-3d building-extra-3" style={{ '--x': '100px', '--z': '-150px', '--height': '320px' }}></div>
            <div className="building-3d building-extra-4" style={{ '--x': '300px', '--z': '-50px', '--height': '390px' }}></div>
          </div>
        </div>
      </div>
      
      <div className="overlay-gradient"></div>
    </div>
  );
};

export default BuildingBackground;
