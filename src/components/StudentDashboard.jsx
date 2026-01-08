import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';

const StudentDashboard = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState('landing');
  const [regNo, setRegNo] = useState('');
  const [dob, setDob] = useState('');
  const [collegeName, setCollegeName] = useState('K S R Institute for Engineering And Technology');
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({});
  const gradesPerPage = 5;

  useEffect(() => {
    // Fetch college name from Firestore
    const fetchCollegeName = async () => {
      try {
        const collegeCollection = collection(db, 'college');
        const collegeSnapshot = await getDocs(collegeCollection);
        if (!collegeSnapshot.empty) {
          const collegeDoc = collegeSnapshot.docs[0];
          const collegeData = collegeDoc.data();
          if (collegeData.name) {
            setCollegeName(collegeData.name);
          }
        }
      } catch (error) {
        console.error('Error fetching college name:', error);
      }
    };

    fetchCollegeName();

    // Mock data - in real app, this would be an API call
    setTimeout(() => {
      const mockGrades = [
        { id: 1, subject: 'Mathematics', score: 85, date: '2024-01-15', semester: 'Fall 2024' },
        { id: 2, subject: 'Physics', score: 78, date: '2024-01-20', semester: 'Fall 2024' },
        { id: 3, subject: 'Chemistry', score: 92, date: '2024-01-25', semester: 'Fall 2024' },
        { id: 4, subject: 'Biology', score: 88, date: '2024-02-01', semester: 'Fall 2024' },
        { id: 5, subject: 'English', score: 90, date: '2024-02-05', semester: 'Fall 2024' },
        { id: 6, subject: 'History', score: 82, date: '2024-02-10', semester: 'Fall 2024' },
        { id: 7, subject: 'Computer Science', score: 95, date: '2024-02-15', semester: 'Fall 2024' },
        { id: 8, subject: 'Economics', score: 76, date: '2024-02-20', semester: 'Fall 2024' },
      ];
      setGrades(mockGrades);
      setLoading(false);
    }, 1000);
  }, []);

  const indexOfLastGrade = currentPage * gradesPerPage;
  const indexOfFirstGrade = indexOfLastGrade - gradesPerPage;
  const currentGrades = grades.slice(indexOfFirstGrade, indexOfLastGrade);
  const totalPages = Math.ceil(grades.length / gradesPerPage);

  const downloadGradeReport = () => {
    const reportData = {
      student: user?.username || 'Student',
      grades: grades,
      average: grades.reduce((acc, grade) => acc + grade.score, 0) / grades.length,
      generatedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `grade-report-${user?.username || 'Student'}-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderHeader = (rightContent, backAction) => (
    <header className="bg-white shadow-sm border-bottom">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center py-3">
          <h1 className="h5 mb-0">Student Result System</h1>
          <div className="d-flex align-items-center gap-3">
            {rightContent}
            {backAction && (
              <button onClick={backAction} className="btn btn-danger btn-sm">
                Back to Home
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  const renderGradesSection = () => (
    <>
      <section className="mb-4">
        <h2 className="h4 mb-3">My Grades</h2>
        {grades.length ? (
          <div className="card">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Subject</th>
                    <th>Score</th>
                    <th>Date</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {currentGrades.map((grade) => (
                    <tr key={grade.id}>
                      <td className="fw-medium">{grade.subject}</td>
                      <td>{grade.score}</td>
                      <td>{new Date(grade.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${
                          grade.score >= 90 ? 'bg-success' :
                          grade.score >= 80 ? 'bg-primary' :
                          grade.score >= 70 ? 'bg-warning' :
                          'bg-danger'
                        }`}>
                          {grade.score >= 90 ? 'A' : grade.score >= 80 ? 'B' : grade.score >= 70 ? 'C' : 'D'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="card-footer">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-none d-md-block">
                    <small className="text-muted">
                      Showing {indexOfFirstGrade + 1} to {Math.min(indexOfLastGrade, grades.length)} of {grades.length} results
                    </small>
                  </div>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                          Previous
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(page)}>
                            {page}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card text-center p-4">
            <p className="text-muted mb-0">No grades found</p>
          </div>
        )}
      </section>
      <div className="mt-3 text-end">
        <button onClick={downloadGradeReport} className="btn btn-success">
          <i className="bi bi-download me-2"></i>Download Grade Report (JSON)
        </button>
      </div>
    </>
  );

  // Landing page
  if (currentView === 'landing') {
    return (
      <div className="min-vh-100 bg-light d-flex flex-column align-items-center justify-content-center">
        <div className="text-center mb-4">
          <h1 className="display-4 mb-3">{collegeName}</h1>
          <button
            onClick={() => setCurrentView('credentials')}
            className="btn btn-primary btn-lg"
          >
            Results
          </button>
        </div>
      </div>
    );
  }

  // Credentials input page
  if (currentView === 'credentials') {
    const handleViewResults = () => {
      const newErrors = {};
      if (!regNo.trim()) {
        newErrors.regNo = 'Registration Number is required';
      }
      if (!dob) {
        newErrors.dob = 'Date of Birth is required';
      }
      setErrors(newErrors);
      if (Object.keys(newErrors).length === 0) {
        setCurrentView('results');
      }
    };

    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="card shadow-lg" style={{ maxWidth: '400px', width: '100%' }}>
          <div className="card-body p-4">
            <div className="text-center mb-4">
              <h2 className="h4 mb-3">View Results</h2>
            </div>
            <form>
              <div className="mb-3">
                <label htmlFor="regNo" className="form-label">Registration Number (REG NO) *</label>
                <input
                  type="text"
                  className={`form-control ${errors.regNo ? 'is-invalid' : ''}`}
                  id="regNo"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  placeholder="Enter your REG NO"
                  required
                />
                {errors.regNo && <div className="invalid-feedback">{errors.regNo}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="dob" className="form-label">Date of Birth (DOB) *</label>
                <input
                  type="date"
                  className={`form-control ${errors.dob ? 'is-invalid' : ''}`}
                  id="dob"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
                {errors.dob && <div className="invalid-feedback">{errors.dob}</div>}
              </div>
              <div className="d-grid gap-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleViewResults}
                >
                  View Results
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCurrentView('landing')}
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Results page
  if (currentView === 'results') {
    return (
      <div className="min-vh-100 bg-light">
        {renderHeader(<span className="text-muted">REG NO: {regNo}</span>, () => setCurrentView('landing'))}
        <main className="container py-4">
          {renderGradesSection()}
        </main>
      </div>
    );
  }

  // Fallback for logged-in users (dashboard view)
  if (user) {
    return (
      <div className="min-vh-100 bg-light">
        {renderHeader(<><span className="text-muted">Welcome, {user.username}</span><button onClick={onLogout} className="btn btn-danger btn-sm">Logout</button></>, null)}
        <main className="container py-4">
          {renderGradesSection()}
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-vh-100 bg-white d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading your grades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {renderHeader(<><span className="text-muted">Welcome, {user.username}</span><button onClick={onLogout} className="btn btn-danger btn-sm">Logout</button></>, null)}
      <main className="container py-4">
        {renderGradesSection()}
      </main>
    </div>
  );
};

export default StudentDashboard;
