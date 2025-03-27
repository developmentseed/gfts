/* global module, require */

//
// See threads-fix.js
//

// eslint-disable-next-line @typescript-eslint/no-var-requires
const workerContext = require('node_modules/threads/dist/worker/index.js');
module.exports = workerContext;
module.exports.default = workerContext;