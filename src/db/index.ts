// Creates Course Catalog Database using MongoDB and the Vanderbilt API
import axios from 'axios';
import mongoose from 'mongoose';
import courseCatalog from '../models/courseCatalog';

const url = 'https://vanderbilt.kuali.co/api/v1/catalog/courses/626313688d6920f47a0d527e/';

// Gets the courses from the Vanderbilt API and calls getCourse for each course
const getCourses = async () => {
  try {
    const response = await axios.get(url);
    //console.log(response.data);
    for (let i = 0; i < response.data.length; i++) {
      const course = response.data[i];
      getCourse(course);
      await sleep(1000);
      //const newCourse = new courseCatalog(course);
      //await newCourse.save();
    }
  } catch (err) {
    console.error(err);
  }
};
// Formats information into JSON and calls addCourseToMongo to add to MongoDB
const getCourse = async (course) => {
  try {
    const courseNumber = course.__catalogCourseId.replace(course.subjectCode.name, '');
    const courseID = course.subjectCode.name + ' ' + courseNumber;
    const courseJSON = {
      code: courseID,
      name: course.title,
      department: course.subjectCode.description,
      departmentAbbreviation: course.subjectCode.name,
      hours: undefined,
      description: undefined,
    };
    //console.log(courseJSON);
    addCourseToMongo(courseJSON, course.pid);
  } catch (err) {
    console.error(err);
  }
};

// Calls the Vanderbilt API to get the course description and uses a regex expression to detemine the course hours
const addCourseToMongo = async (COURSE_JSON, COURSE_PID) => {
  try {
    const baseURL = 'https://vanderbilt.kuali.co/api/v1/catalog/course/626313688d6920f47a0d527e/';
    const url = baseURL + COURSE_PID;
    // add delay to avoid rate limit
    const response = await axios.get(url);
    const course_description = response.data.description;
    COURSE_JSON.description = course_description;

    // use regex to determine hours
    const regex = /\[.*\]/i;
    const hours_REGEX = course_description.match(regex);
    if (hours_REGEX) {
      COURSE_JSON.hours = hours_REGEX[0];
      COURSE_JSON.hours.replace('[', '').replace(']', '');
    } else {
      COURSE_JSON.hours = undefined;
    }
    // check is course is already in database
    const course = await courseCatalog.find({ code: COURSE_JSON.code });
    if (course) {
      console.log(COURSE_JSON.code + ': ' + 'Course already in database');
      return;
    } else {
      // create new course and save to mongoDB
      const newCourse = new courseCatalog({
        code: COURSE_JSON.code,
        name: COURSE_JSON.name,
        department: COURSE_JSON.department,
        departmentAbbreviation: COURSE_JSON.departmentAbbreviation,
        hours: COURSE_JSON.hours,
        description: COURSE_JSON.description,
      });
      const addedCourse = await newCourse.save();
      console.log(addedCourse);
    }
  } catch (err) {
    console.error(err);
  }
};
// simple timeout function
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
/*
// function to remove brackets from hour property in database 
const removeBrackets = async () => {
  try {
    const courses = await courseCatalog.find();
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const hours = course.hours;
      if (hours) {
        const newHours = hours.replace('[', '').replace(']', '');
        course.hours = newHours;
        await course.save();
        
      }
      console.log(course.code)
    }
  } catch (err) {
    console.error(err);
  }
};
*/

export default getCourses;