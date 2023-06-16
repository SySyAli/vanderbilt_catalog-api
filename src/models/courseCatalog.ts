import mongoose from 'mongoose';

const courseCatalogSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  departmentAbbreviation: {
    type: String,
    required: true,
  },
  hours: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
});

export default mongoose.model('Catalog', courseCatalogSchema);