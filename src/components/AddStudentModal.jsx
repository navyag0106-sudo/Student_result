import { useState } from 'react';

const AddStudentModal = ({ isOpen, onClose, onSave, students, setStudents, setSuccessMessage }) => {
  const [studentForm, setStudentForm] = useState({
    name: '',
    regNo: '',
    year: '',
    dept: '',
    dob: ''
  });
  const [studentErrors, setStudentErrors] = useState({});

  const validateStudentForm = () => {
    const newErrors = {};
    if (!studentForm.name.trim()) newErrors.name = 'Name is required';
    if (!studentForm.regNo.trim()) newErrors.regNo = 'Registration number is required';
    if (!studentForm.year.trim()) newErrors.year = 'Year is required';
    if (!studentForm.dept.trim()) newErrors.dept = 'Department is required';
    if (!studentForm.dob) newErrors.dob = 'Date of birth is required';
    setStudentErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!validateStudentForm()) return;

    const newStudent = {
      id: studentForm.regNo || Date.now().toString(),
      name: studentForm.name.trim(),
      regNo: studentForm.regNo.trim(),
      year: studentForm.year.trim(),
      dept: studentForm.dept.trim(),
      dob: studentForm.dob,
      createdAt: new Date().toISOString()
    };

    try {
      // Save to Firestore STUDENT collection
      await addDoc(collection(db, 'STUDENT'), newStudent);

      // Keep local UI list in sync
      setStudents([...students, { id: newStudent.id, name: newStudent.name }]);
      setSuccessMessage('Student saved to database successfully!');
    } catch (err) {
      console.error('Error saving student:', err);
      setSuccessMessage('Failed to save student. Please try again.');
    }

    setTimeout(() => setSuccessMessage(''), 3000);

    setStudentForm({
      name: '',
      regNo: '',
      year: '',
      dept: '',
      dob: ''
    });
    setStudentErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      style={{ zIndex: 1060, pointerEvents: 'auto' }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Student</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            />
          </div>
          <form onSubmit={handleStudentSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className={`form-control ${studentErrors.name ? 'is-invalid' : ''}`}
                    value={studentForm.name}
                    onChange={(e) => {
                      setStudentForm({ ...studentForm, name: e.target.value });
                      if (studentErrors.name) setStudentErrors({ ...studentErrors, name: '' });
                    }}
                    placeholder="Enter full name"
                  />
                  {studentErrors.name && <div className="invalid-feedback">{studentErrors.name}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Reg No</label>
                  <input
                    type="text"
                    className={`form-control ${studentErrors.regNo ? 'is-invalid' : ''}`}
                    value={studentForm.regNo}
                    onChange={(e) => {
                      setStudentForm({ ...studentForm, regNo: e.target.value });
                      if (studentErrors.regNo) setStudentErrors({ ...studentErrors, regNo: '' });
                    }}
                    placeholder="e.g., STU123"
                  />
                  {studentErrors.regNo && <div className="invalid-feedback">{studentErrors.regNo}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Year</label>
                  <select
                    className={`form-select ${studentErrors.year ? 'is-invalid' : ''}`}
                    value={studentForm.year}
                    onChange={(e) => {
                      setStudentForm({ ...studentForm, year: e.target.value });
                      if (studentErrors.year) setStudentErrors({ ...studentErrors, year: '' });
                    }}
                  >
                    <option value="">Select year</option>
                    <option value="Year I">Year I</option>
                    <option value="Year II">Year II</option>
                  </select>
                  {studentErrors.year && (
                    <div className="text-danger small mt-1">{studentErrors.year}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Dept</label>
                  <input
                    type="text"
                    className={`form-control ${studentErrors.dept ? 'is-invalid' : ''}`}
                    value={studentForm.dept}
                    onChange={(e) => {
                      setStudentForm({ ...studentForm, dept: e.target.value });
                      if (studentErrors.dept) setStudentErrors({ ...studentErrors, dept: '' });
                    }}
                    placeholder="e.g., Computer Science"
                  />
                  {studentErrors.dept && <div className="invalid-feedback">{studentErrors.dept}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">DOB</label>
                  <input
                    type="date"
                    className={`form-control ${studentErrors.dob ? 'is-invalid' : ''}`}
                    value={studentForm.dob}
                    onChange={(e) => {
                      setStudentForm({ ...studentForm, dob: e.target.value });
                      if (studentErrors.dob) setStudentErrors({ ...studentErrors, dob: '' });
                    }}
                  />
                  {studentErrors.dob && <div className="invalid-feedback">{studentErrors.dob}</div>}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
              <button type="submit" className="btn btn-primary">
                Save Student
              </button>
            </div>
          </form>
        </div>
      </div>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040, pointerEvents: 'none' }}
      />
    </div>
  );
};

export default AddStudentModal;
