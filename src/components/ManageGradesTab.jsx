import { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const ManageGradesTab = ({ grades, setGrades, setSuccessMessage }) => {
  const [filterRegNo, setFilterRegNo] = useState('');

  const handleDelete = (gradeId) => {
    if (window.confirm('Are you sure you want to delete this grade?')) {
      setGrades(grades.filter(g => g.id !== gradeId));
      setSuccessMessage('Grade deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handlePresentToggle = async (grade) => {
    const newPresent = !grade.present;
    const newGrade = calculateGrade(grade.marks, newPresent);

    try {
      // Update in Firestore
      await updateDoc(doc(db, 'GRADES', grade.id), {
        present: newPresent,
        grade: newGrade
      });

      // Update local state
      setGrades(grades.map(g =>
        g.id === grade.id
          ? { ...g, present: newPresent, grade: newGrade }
          : g
      ));

      setSuccessMessage('Present status updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating present status:', err);
      setSuccessMessage('Failed to update present status. Please try again.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const calculateGrade = (marks, present) => {
    if (!present) return 'UA';
    if (marks >= 90) return 'O';
    if (marks >= 80) return 'A+';
    if (marks >= 70) return 'A';
    if (marks >= 60) return 'B+';
    if (marks >= 50) return 'B';
    return 'U';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="h5 mb-0">Manage Grades</h2>
      </div>
      <div className="card-body">
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="filterRegNo" className="form-label">
              Filter by Registration Number
            </label>
            <input
              id="filterRegNo"
              type="text"
              value={filterRegNo}
              onChange={(e) => setFilterRegNo(e.target.value)}
              className="form-control"
              placeholder="Enter Reg No to filter"
            />
          </div>
        </div>

        {grades.length === 0 ? (
          <div className="text-center">
            <p className="text-muted mb-0">No grades found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Reg No</th>
                  <th>Year</th>
                  <th>Semester</th>
                  <th>Subject</th>
                  <th>Present</th>
                  <th>Marks</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {grades
                  .filter((grade) =>
                    filterRegNo === '' || grade.studentId.toLowerCase().includes(filterRegNo.toLowerCase())
                  )
                  .map((grade) => (
                    <tr key={grade.id}>
                      <td>{grade.studentId}</td>
                      <td>{grade.year}</td>
                      <td>{grade.semester}</td>
                      <td>{grade.subject || '-'}</td>
                      <td>{grade.present ? 'Yes' : 'No'}</td>
                      <td>{grade.marks || '-'}</td>
                      <td>
                        <span className={`badge ${grade.grade === 'O' ? 'bg-success' : grade.grade === 'A+' || grade.grade === 'A' ? 'bg-primary' : grade.grade === 'B+' || grade.grade === 'B' ? 'bg-info' : grade.grade === 'C' ? 'bg-warning' : 'bg-danger'}`}>
                          {grade.grade || '-'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleEdit(grade)}
                          className="btn btn-sm btn-outline-primary me-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(grade.id)}
                          className="btn btn-sm btn-outline-danger"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageGradesTab;
