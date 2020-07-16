const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.addMessage = functions.https.onRequest(async (req, res) => {
  const original = req.query.text;
  const writeResult = await admin
    .firestore()
    .collection("messages")
    .add({ original: original });
  res.json({ result: `Message with ID: ${writeResult.id} added.` });
});

// listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase
// this makeUppercase() function executes when cloud firestore is written to
// the ref.set function defines the document to listen on
exports.makeUppercase = functions.firestore
  .document(`/messages/{documentId}`)
  .onCreate((snap, context) => {
    // grab the current value of what was written to cloud firestore
    const original = snap.data().original;
    // access the param "documentId" with context.params
    functions.logger.log(`Uppercasing`, context.params.documentId, original);
    const uppercase = original.toUpperCase();
    // must return a promise when performing async tasks inside functions such as
    // writing to cloud firestore
    // setting an "uppercase" field in cloud firestore returns a promise
    return snap.ref.set({ uppercase }, { merge: true });
  });
