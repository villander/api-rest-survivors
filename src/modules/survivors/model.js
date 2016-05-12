import mongoose from 'mongoose';
import survivorSchema from './schema';

export default mongoose.model('Survivor', survivorSchema);
