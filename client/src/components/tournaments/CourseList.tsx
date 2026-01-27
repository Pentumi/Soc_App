import React, { useEffect, useState } from 'react';
import Layout from '../common/Layout';
import { coursesAPI } from '../../services/api';
import { Course } from '../../types';
import CreateCourseModal from './CreateCourseModal';

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await coursesAPI.getAll();
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseCreated = (newCourse: Course) => {
    setCourses([...courses, newCourse]);
    setShowCreateModal(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 pb-24">
        <div className="mb-6 md:mb-8">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-apple-gray-900 tracking-tight">
              Golf Courses
            </h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="hidden md:block bg-apple-blue text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-apple-blue/90 transition-all shadow-sm hover:shadow-md"
            >
              Add Course
            </button>
          </div>
          <p className="text-apple-gray-600 text-sm md:text-base">
            Manage golf courses in the society database
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl shadow-apple border border-apple-gray-200 hover:shadow-apple-lg transition-all overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-apple-green to-emerald-500"></div>
              <div className="p-6">
                <div className="text-5xl mb-4">⛳</div>
                <h2 className="text-xl font-bold text-apple-gray-900 mb-2">{course.name}</h2>
                <p className="text-apple-gray-600 text-sm mb-4">{course.location}</p>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-apple-gray-200">
                  <div>
                    <p className="text-apple-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">
                      Par
                    </p>
                    <p className="text-2xl font-bold text-apple-gray-900">{course.par}</p>
                  </div>
                  {course.slopeRating && (
                    <div>
                      <p className="text-apple-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">
                        Slope
                      </p>
                      <p className="text-2xl font-bold text-apple-gray-900">{course.slopeRating}</p>
                    </div>
                  )}
                  {course.courseRating && (
                    <div>
                      <p className="text-apple-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">
                        Rating
                      </p>
                      <p className="text-2xl font-bold text-apple-gray-900">{course.courseRating}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {showCreateModal && (
          <CreateCourseModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCourseCreated}
          />
        )}

        {/* Floating Action Button for Mobile */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="md:hidden fixed bottom-24 right-6 bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40"
          aria-label="Add course"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </Layout>
  );
};

export default CourseList;
