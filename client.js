// This file contains the boilerplate to execute your React app.
// If you want to modify your application's content, start in "index.js"

import {ReactInstance} from 'react-360-web';

function init(bundle, parent, options = {}) {
  const r360 = new ReactInstance(bundle, parent, {
    // Add custom options here
    fullScreen: true,
    ...options,
  });

  // Render your app content to the default cylinder surface
  /*In order to use the 3D meter-based coordinate system for a layout in 3D space, we need to mount to a Location object instead of a
Surface */
  r360.renderToSurface(
    r360.createRoot('MERNVR', { /* initial props */ }),
    r360.getDefaultLocation()
  );

  // Load the initial environment
  r360.compositor.setBackground(r360.getAssetURL('360_world_black.jpg'))
}

window.React360 = {init};
