   // src/components/ModelSlider.jsx
   import React from 'react';
   import './ModelSlider.css'; // Assuming you have a CSS file for styling

   const ModelSlider = () => {
     return (
       <div className="slider">
         <div className="slider-content">
           <div className="model-item">Model 1</div>
           <div className="model-item">Model 2</div>
           <div className="model-item">Model 3</div>
           {/* Add more model items as needed */}
         </div>
       </div>
     );
   };

export default ModelSlider;
