
import React from 'react';
import OnCourseTracker from '../components/OnCourseTracker';

const Tracker = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">On-Course Tracker</h1>
          <p className="text-gray-600">Track your shots and analyze your game in real-time</p>
        </div>
        <OnCourseTracker />
      </div>
    </div>
  );
};

export default Tracker;
