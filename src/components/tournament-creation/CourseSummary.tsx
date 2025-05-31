
import React from 'react';

interface CourseSummaryProps {
  totalPar: number;
  totalYardage: number;
  rating: number;
  slope: number;
}

const CourseSummary: React.FC<CourseSummaryProps> = ({
  totalPar,
  totalYardage,
  rating,
  slope
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-emerald-600">{totalPar}</div>
          <div className="text-sm text-gray-600">Total Par</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-emerald-600">{totalYardage.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Yardage</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-emerald-600">{rating}</div>
          <div className="text-sm text-gray-600">Course Rating</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-emerald-600">{slope}</div>
          <div className="text-sm text-gray-600">Slope Rating</div>
        </div>
      </div>
    </div>
  );
};

export default CourseSummary;
