/* global module, require */

// Aaaand what's happening here you ask?
// Well, here we go...

// The `index.mjs` of the threads module looks like this:
//
// import Threads from "./dist/index.js"

// export const registerSerializer = Threads.registerSerializer
// export const spawn = Threads.spawn
// export const BlobWorker = Threads.BlobWorker
// export const DefaultSerializer = Threads.DefaultSerializer
// export const Pool = Threads.Pool
// export const Thread = Threads.Thread
// export const Transfer = Threads.Transfer
// export const Worker = Threads.Worker
//

// The problem is that the cjs module doesn't have a `default` export. That
// means that `import Threads from "./dist/index.js"` will be undefined.
// That import should be `import * as Threads from "./dist/index.js"` instead.
// This is a workaround to fix the issue, and requires us to set an alias for
// threads in the package.json file to point to the dist file.

// I'm not sure if this is a `parcel` problem, but from my research it seems
// that what threads id doing is not according to spec.
// This only happens when parcel is set to follow package exports.

// PR to fix the issue: https://github.com/andywer/threads.js/pull/495

// eslint-disable-next-line @typescript-eslint/no-var-requires
const threads = require('node_modules/threads/dist/index.js');
module.exports = threads;
module.exports.default = threads;