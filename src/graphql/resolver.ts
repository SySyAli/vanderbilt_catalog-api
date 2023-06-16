import courseCatalog from '../models/courseCatalog';

const resolvers = {
  Query: {
    course: async (_, obj) => {
        const { _id } = obj;
        const course = await courseCatalog.findById(_id);
        return course;
    },
    courses: async (_, obj) => {
        const courses = await courseCatalog.find(obj);
        return courses;
    }
  },
};

export default resolvers;
