import mongoose from 'mongoose';

const Survivor = mongoose.Schema({
  name: { type: String, required: true },
  age: { type: String, required: true },
  gender: { type: String, required: true }, // male or female
  lastLocation: {
    type: [Number],  // [<longitude>, <latitude>]
    index: '2d',      // create the geospatial index
    required: true
  },
  inventory: [{
    name: { type: String },
    points: { type: Number }
  }],
  indications: [{
    author: { type: mongoose.Schema.Types.ObjectId },
    created: { type: Date, default: Date.now }
  }],
  isInfected: { type: Boolean, default: false }
});

Survivor.post('save', (doc, next) => {
  if (doc.indications.length === 3) {
    doc.isInfected = true;
    doc.save((err) => {
      console.error(err.message);
    });
  }
  next();
});

export default Survivor;
