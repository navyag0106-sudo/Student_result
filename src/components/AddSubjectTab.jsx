import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AddSubjectTab = ({ setSuccessMessage, currentUserInfo }) => {
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    year: currentUserInfo?.year ? (currentUserInfo.year === 'year1' ? 'Year I' : 'Year II') : '',
    semester: ''
  });
  const [subjectErrors, setSubjectErrors] = useState({});
  const [subjectEntries, setSubjectEntries] = useState([]);

  const validateSubjectForm = () => {
    const newErrors = {};
    if (!subjectForm.name.trim()) newErrors.name = 'Subject name is required';
    if (!subjectForm.code.trim()) newErrors.code = 'Subject code is required';
    if (!subjectForm.year.trim()) newErrors.year = 'Year is required';
    if (!subjectForm.semester.trim()) newErrors.semester = 'Semester is required';
    setSubjectErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSubjectRow = (e) => {
    e.preventDefault();
    if (!validateSubjectForm()) return;

    const trimmed = subjectForm.name.trim();

    // Add subject to local table
    setSubjectEntries([
      ...subjectEntries,
      {
        id: Date.now(),
        name: trimmed,
        code: subjectForm.code.trim(),
        year: subjectForm.year,
        semester: subjectForm.semester
      }
    ]);

    // Clear only the subject name to easily add another,
    // keep year/semester selected
    setSubjectForm({
      ...subjectForm,
      name: ''
    });
    setSubjectErrors({});
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();

    if (subjectEntries.length === 0) {
      setSuccessMessage('No subjects to submit.');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }

    try {
      // Store the whole table (all subjects) in one Firestore document
      await addDoc(collection(db, 'SUBJECT'), {
        subjects: subjectEntries.map(function(entry) {
          const { id: _id, ...subjectWithoutId } = entry;
          return subjectWithoutId;
        }), // Exclude the temporary id from the database entry
        createdAt: new Date().toISOString()
      });

      setSuccessMessage('All subjects saved to database successfully!');

      // Clear the local table so it disappears from the UI
      setSubjectEntries([]);

      // Optionally reset the subject form (including year/semester)
      setSubjectForm({
        name: '',
        year: '',
        semester: ''
      });
      setSubjectErrors({});
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving subjects table:', err);
      setSuccessMessage('Failed to save subjects table. Please try again.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Add Subjects</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleAddSubjectRow} className="mb-4">
          <div className="row g-3">
            <div className="col-md-3">
              <label htmlFor="subjectName" className="form-label">Subject Name</label>
              <input
                type="text"
                className={`form-control ${subjectErrors.name ? 'is-invalid' : ''}`}
                id="subjectName"
                value={subjectForm.name}
                onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                placeholder="Enter subject name"
              />
              {subjectErrors.name && <div className="invalid-feedback">{subjectErrors.name}</div>}
            </div>
            <div className="col-md-2">
              <label htmlFor="subjectCode" className="form-label">Code</label>
              <input
                type="text"
                className={`form-control ${subjectErrors.code ? 'is-invalid' : ''}`}
                id="subjectCode"
                value={subjectForm.code}
                onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                placeholder="e.g., MATH101"
              />
              {subjectErrors.code && <div className="invalid-feedback">{subjectErrors.code}</div>}
            </div>
            <div className="col-md-2">
              <label htmlFor="subjectYear" className="form-label">Year</label>
              <select
                className={`form-select ${subjectErrors.year ? 'is-invalid' : ''}`}
                id="subjectYear"
                value={subjectForm.year}
                onChange={(e) => setSubjectForm({ ...subjectForm, year: e.target.value })}
                disabled={!!currentUserInfo?.year} // Disable if user's year is already set
              >
                <option value="">Select Year</option>
                <option value="Year I">Year I</option>
                <option value="Year II">Year II</option>
                <option value="Year III">Year III</option>
                <option value="Year IV">Year IV</option>
              </select>
              {subjectErrors.year && <div className="invalid-feedback">{subjectErrors.year}</div>}
              {currentUserInfo?.year && (
                <div className="form-text text-muted small">
                  Auto-populated: {currentUserInfo.year === 'year1' ? 'Year I' : 'Year II'}
                </div>
              )}
            </div>
            <div className="col-md-2">
              <label htmlFor="subjectSemester" className="form-label">Semester</label>
              <select
                className={`form-select ${subjectErrors.semester ? 'is-invalid' : ''}`}
                id="subjectSemester"
                value={subjectForm.semester}
                onChange={(e) => setSubjectForm({ ...subjectForm, semester: e.target.value })}
              >
                <option value="">Select Semester</option>
                <option value="Sem 1">Sem 1</option>
                <option value="Sem 2">Sem 2</option>
                <option value="Sem 3">Sem 3</option>
                <option value="Sem 4">Sem 4</option>
                <option value="Sem 5">Sem 5</option>
                <option value="Sem 6">Sem 6</option>
                <option value="Sem 7">Sem 7</option>
                <option value="Sem 8">Sem 8</option>
              </select>
              {subjectErrors.semester && <div className="invalid-feedback">{subjectErrors.semester}</div>}
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button type="submit" className="btn btn-primary w-100">
                Add Subject
              </button>
            </div>
          </div>
        </form>

        {subjectEntries.length > 0 && (
          <>
            <div className="table-responsive mb-3">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Subject Name</th>
                    <th>Code</th>
                    <th>Year</th>
                    <th>Semester</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.name}</td>
                      <td>{entry.code}</td>
                      <td>{entry.year}</td>
                      <td>{entry.semester}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSubjectSubmit}
            >
              Save All Subjects to Database
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AddSubjectTab;
