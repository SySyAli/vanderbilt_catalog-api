import courseCatalog from '../models/courseCatalog';

const resolvers = {
  Query: {
    course: async (_, obj) => {
        const { _id } = obj;
        const course = await courseCatalog.findById(_id);
        // console.log(course);
        return course;
    },
    courses: async (_, obj) => {
        const courses = await courseCatalog.find(obj);
        // console.log(courses);
        return courses;
    }
  },
};

export default resolvers;
