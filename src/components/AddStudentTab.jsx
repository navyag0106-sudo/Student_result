import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

const AddStudentTab = ({ setSuccessMessage, currentUserInfo }) => {
  const [studentForm, setStudentForm] = useState({
    name: '',
    regNo: '',
    email: '',
    year: currentUserInfo?.year ? (currentUserInfo.year === 'year1' ? 'Year I' : 'Year II') : '',
    dept: currentUserInfo?.department?.name || '',
    dob: ''
  });
  const [studentErrors, setStudentErrors] = useState({});

  const validateStudentForm = () => {
    const newErrors = {};
    if (!studentForm.name.trim()) newErrors.name = 'Name is required';
    if (!studentForm.regNo.trim()) newErrors.regNo = 'Registration number is required';
    if (!studentForm.email.trim()) newErrors.email = 'Email is required';
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
      email: studentForm.email.trim(),
      year: studentForm.year.trim(),
      dept: studentForm.dept.trim(),
      dob: studentForm.dob,
      createdAt: new Date().toISOString()
    };

    try {
      // Save to Firestore STUDENT collection
      await addDoc(collection(db, 'STUDENT'), newStudent);

      setSuccessMessage('Student saved to database successfully!');
    } catch (err) {
      console.error('Error saving student:', err);
      setSuccessMessage('Failed to save student. Please try again.');
    }

    setTimeout(() => setSuccessMessage(''), 3000);

    setStudentForm({
      name: '',
      regNo: '',
      email: '',
      year: currentUserInfo?.year ? (currentUserInfo.year === 'year1' ? 'Year I' : 'Year II') : '',
      dept: currentUserInfo?.department?.name || '',
      dob: ''
    });
    setStudentErrors({});
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Add Student</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleStudentSubmit}>
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
              <label className="form-label">Email</label>
              <input
                type="email"
                className={`form-control ${studentErrors.email ? 'is-invalid' : ''}`}
                value={studentForm.email}
                onChange={(e) => {
                  setStudentForm({ ...studentForm, email: e.target.value });
                  if (studentErrors.email) setStudentErrors({ ...studentErrors, email: '' });
                }}
                placeholder="e.g., student@college.edu"
              />
              {studentErrors.email && <div className="invalid-feedback">{studentErrors.email}</div>}
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
                disabled={!!currentUserInfo?.year} // Disable if user's year is already set
              >
                <option value="">Select year</option>
                <option value="Year I">Year I</option>
                <option value="Year II">Year II</option>
              </select>
              {studentErrors.year && (
                <div className="text-danger small mt-1">{studentErrors.year}</div>
              )}
              {currentUserInfo?.year && (
                <div className="form-text text-muted small">
                  Auto-populated from your profile: {currentUserInfo.year === 'year1' ? 'Year I' : 'Year II'}
                </div>
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
                disabled={!!currentUserInfo?.department?.name} // Disable if user's department is already set
              />
              {studentErrors.dept && <div className="invalid-feedback">{studentErrors.dept}</div>}
              {currentUserInfo?.department?.name && (
                <div className="form-text text-muted small">
                  Auto-populated from your profile: {currentUserInfo.department.name}
                </div>
              )}
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
          <div className="mt-4">
            <button type="submit" className="btn btn-primary">
              Save Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentTab;