import { Student } from '@/types';
import { User, Mail, GraduationCap, Calendar, TrendingUp, Phone } from 'lucide-react';
import Image from 'next/image';

interface StudentCardProps {
  student: Student;
  onEdit?: (student: Student) => void;
  onDelete?: (id: string) => void;
}

export function StudentCard({ student, onEdit, onDelete }: StudentCardProps) {
  const getYearLabel = (year: number) => {
    switch (year) {
      case 1:
        return 'Freshman';
      case 2:
        return 'Sophomore';
      case 3:
        return 'Junior';
      case 4:
        return 'Senior';
      default:
        return `Year ${year}`;
    }
  };

  const getGpaColor = (gpa: number) => {
    if (gpa >= 3.7) return 'text-green-600';
    if (gpa >= 3.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {student.avatar ? (
            <Image
              src={student.avatar}
              alt={student.name}
              width={64}
              height={64}
              className="rounded-full"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-500" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{student.name}</h3>

          <div className="mt-2 space-y-1">
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{student.email}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <GraduationCap className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{student.major}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{getYearLabel(student.year)}</span>
            </div>

            <div className="flex items-center text-sm">
              <TrendingUp className="w-4 h-4 mr-2 flex-shrink-0 text-gray-600" />
              <span className={`font-medium ${getGpaColor(student.gpa)}`}>
                {student.gpa.toFixed(2)} GPA
              </span>
            </div>

            {student.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{student.phone}</span>
              </div>
            )}
          </div>

          {(onEdit || onDelete) && (
            <div className="mt-4 flex space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(student)}
                  className="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(student.id)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
