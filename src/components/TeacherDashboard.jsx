import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import 'bootstrap/dist/css/bootstrap.min.css';
import AddStudentModal from './AddStudentModal';
import UploadGradesTab from './UploadGradesTab';
import ManageGradesTab from './ManageGradesTab';
import AddSubjectTab from './AddSubjectTab';
import AddStudentTab from './AddStudentTab';

const TeacherDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('addStudent');
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserInfo, setCurrentUserInfo] = useState(null);

  const [formData, setFormData] = useState({
    regNo: '',
    year: '',
    semester: '',
    marks: {},
    present: false
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [editingGrade, setEditingGrade] = useState(null);




  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    year: '',
    semester: ''
  });
  const [subjectErrors, setSubjectErrors] = useState({});
  const [subjectEntries, setSubjectEntries] = useState([]);
  const [fetchedSubjects, setFetchedSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState('');
  const [filterRegNo, setFilterRegNo] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user information from COLLEGE collection based on email
        const collegesSnapshot = await getDocs(collection(db, 'colleges'));
        
        for (const collegeDoc of collegesSnapshot.docs) {
          const collegeData = collegeDoc.data();
          
          // Check for user in college-level users
          if (collegeData.users && Array.isArray(collegeData.users)) {
            const foundUser = collegeData.users.find(u => u.username === user.username);
            if (foundUser) {
              setCurrentUserInfo({
                ...foundUser,
                college: collegeData,
                collegeId: collegeDoc.id
              });
              break;
            }
          }
          
          // Check for user in department-level users
          if (collegeData.departments && Array.isArray(collegeData.departments)) {
            for (const dept of collegeData.departments) {
              if (dept.year1 && dept.year1.users && Array.isArray(dept.year1.users)) {
                const foundUser = dept.year1.users.find(u => u.username === user.username);
                if (foundUser) {
                  setCurrentUserInfo({
                    ...foundUser,
                    college: collegeData,
                    collegeId: collegeDoc.id,
                    department: dept,
                    year: 'year1'
                  });
                  // Set the year in formData to match the user's year
                  setFormData(prev => ({
                    ...prev,
                    year: 'Year I'
                  }));
                  break;
                }
              }
              
              if (dept.year2 && dept.year2.users && Array.isArray(dept.year2.users)) {
                const foundUser = dept.year2.users.find(u => u.username === user.username);
                if (foundUser) {
                  setCurrentUserInfo({
                    ...foundUser,
                    college: collegeData,
                    collegeId: collegeDoc.id,
                    department: dept,
                    year: 'year2'
                  });
                  // Set the year in formData to match the user's year
                  setFormData(prev => ({
                    ...prev,
                    year: 'Year II'
                  }));
                  break;
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, [user]);

  useEffect(() => {
    // Fetch initial data - this can remain as mock data or be replaced with actual API calls
    const loadData = async () => {
      const mockSubjects = [
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'English',
        'History',
        'Computer Science',
        'Economics'
      ];

      const mockGrades = [
        { id: 1, studentId: 'STU001', year: 'Year I', semester: 'Sem 1' },
        { id: 2, studentId: 'STU002', year: 'Year I', semester: 'Sem 2' },
        { id: 3, studentId: 'STU003', year: 'Year II', semester: 'Sem 3' },
        { id: 4, studentId: 'STU004', year: 'Year II', semester: 'Sem 4' },
        { id: 5, studentId: 'STU005', year: 'Year I', semester: 'Sem 1' },
      ];

      setSubjects(mockSubjects);
      setGrades(mockGrades);
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Load subjects from Firestore for selected year & semester in Upload tab
  useEffect(() => {
    const loadSubjectsForSelection = async () => {
      if (!formData.year || !formData.semester) {
        setFetchedSubjects([]);
        setSubjectsError('');
        return;
      }

      setSubjectsLoading(true);
      setSubjectsError('');

      try {
        const snapshot = await getDocs(collection(db, 'SUBJECT'));
        const matched = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (Array.isArray(data.subjects)) {
            data.subjects.forEach((subj) => {
              if (subj.year === formData.year && subj.semester === formData.semester) {
                matched.push(subj);
              }
            });
          }
        });

        setFetchedSubjects(matched);
      } catch (err) {
        console.error('Error fetching subjects from Firestore:', err);
        setSubjectsError('Failed to load subjects from database.');
        setFetchedSubjects([]);
      } finally {
        setSubjectsLoading(false);
      }
    };

    loadSubjectsForSelection();
  }, [formData.year, formData.semester]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.regNo.trim()) {
      newErrors.regNo = 'Please enter a registration number';
    }

    if (!formData.year) {
      newErrors.year = 'Please select a year';
    }

    if (!formData.semester) {
      newErrors.semester = 'Please select a semester';
    }

    // Validate marks for each subject
    fetchedSubjects.forEach((subj) => {
      const mark = formData.marks[subj.name];
      if (mark === undefined || mark === '') {
        newErrors[`marks_${subj.name}`] = `Please enter marks for ${subj.name}`;
      } else if (isNaN(mark) || mark < 0 || mark > 100) {
        newErrors[`marks_${subj.name}`] = `Marks for ${subj.name} must be a number between 0 and 100`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const gradeEntries = fetchedSubjects.map((subj) => ({
      id: editingGrade ? editingGrade.id + subj.name : Date.now() + subj.name,
      studentId: formData.regNo.trim(),
      year: formData.year,
      semester: formData.semester,
      subject: subj.name,
      marks: parseInt(formData.marks[subj.name]),
      present: formData.present[subj.name] || false,
      grade: calculateGrade(parseInt(formData.marks[subj.name]), formData.present[subj.name] || false)
    }));

    try {
      // Save each grade entry to Firestore
      for (const entry of gradeEntries) {
        await addDoc(collection(db, 'GRADES'), entry);
      }

      // Update local state
      setGrades([...grades, ...gradeEntries]);
      setSuccessMessage('Grades uploaded successfully!');
    } catch (err) {
      console.error('Error saving grades:', err);
      setSuccessMessage('Failed to save grades. Please try again.');
    }

    setFormData({
      regNo: '',
      year: '',
      semester: '',
      marks: {},
      present: {}
    });

    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleEdit = (grade) => {
    setEditingGrade(grade);
    setFormData({
      regNo: grade.studentId || '',
      year: grade.year || '',
      semester: grade.semester || '',
      marks: { [grade.subject]: grade.marks || '' },
      present: { [grade.subject]: grade.present || false }
    });
    setActiveTab('upload');
  };

  const handleDelete = async (gradeId) => {
    if (window.confirm('Are you sure you want to delete this grade?')) {
      setGrades(grades.filter(g => g.id !== gradeId));
      setSuccessMessage('Grade deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleMarksChange = (subjectName, value) => {
    const updatedMarks = { ...formData.marks, [subjectName]: value };
    setFormData({ ...formData, marks: updatedMarks });
    if (errors[`marks_${subjectName}`]) {
      setErrors({ ...errors, [`marks_${subjectName}`]: '' });
    }
  };

  const handlePresentChange = (subjectName, value) => {
    const updatedPresent = { ...formData.present, [subjectName]: value };
    setFormData({ ...formData, present: updatedPresent });
  };



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

    // Also keep dropdown subjects list updated
    if (trimmed && !subjects.includes(trimmed)) {
      setSubjects([...subjects, trimmed]);
    }

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
        subjects: subjectEntries.map((entry) => ({ name: entry.name, code: entry.code, year: entry.year, semester: entry.semester })),
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

  if (loading) {
    return (
      <div className="min-vh-100 bg-white d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading teacher dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">

      {/* Header */}
      <header className="bg-white shadow-sm border-bottom">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center py-3">
            <h1 className="h5 mb-0">Teacher Dashboard</h1>
            <div className="d-flex align-items-center gap-3">
              <div>
                <span className="text-muted">Welcome, {user.username}</span>
                {currentUserInfo && (
                  <div className="text-muted small">
                    Role: {currentUserInfo.role} | {currentUserInfo.department ? `Department: ${currentUserInfo.department.name || 'N/A'}` : 'College Level'}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => {
                  // Check if user has permission to add students
                  if (currentUserInfo?.canManageResults || currentUserInfo?.role === 'head' || currentUserInfo?.role === 'admin') {
                    setActiveTab('addStudent');
                  }
                }}
                disabled={!(currentUserInfo?.canManageResults || currentUserInfo?.role === 'head' || currentUserInfo?.role === 'admin')}
              >
                Add Student
              </button>
              <button
                onClick={onLogout}
                className="btn btn-danger btn-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-4">
        {/* Navigation Tabs */}
        <div className="mb-4">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('addStudent')}
                className={`nav-link ${activeTab === 'addStudent' ? 'active' : ''}`}
              >
                Add Student
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('addSubject')}
                className={`nav-link ${activeTab === 'addSubject' ? 'active' : ''}`}
              >
                Add Subject
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('upload')}
                className={`nav-link ${activeTab === 'upload' ? 'active' : ''}`}
              >
                {editingGrade ? 'Edit Grade' : 'Upload Grades'}
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('edit')}
                className={`nav-link ${activeTab === 'edit' ? 'active' : ''}`}
              >
                Manage Grades
              </button>
            </li>
          </ul>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}

        {/* Upload/Edit Grade Form */}
        {activeTab === 'upload' && (
          <UploadGradesTab
            editingGrade={editingGrade}
            setEditingGrade={setEditingGrade}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            fetchedSubjects={fetchedSubjects}
            subjectsLoading={subjectsLoading}
            subjectsError={subjectsError}
            handleSubmit={handleSubmit}
            handleInputChange={handleInputChange}
            handleMarksChange={handleMarksChange}
            handlePresentChange={handlePresentChange}
            calculateGrade={calculateGrade}
            currentUserInfo={currentUserInfo}
          />
        )}

        {/* Editable Grades Table */}
        {activeTab === 'edit' && (
          <ManageGradesTab
            grades={grades}
            setGrades={setGrades}
            setSuccessMessage={setSuccessMessage}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            filterRegNo={filterRegNo}
            setFilterRegNo={setFilterRegNo}
          />
        )}

        {/* Add Subject Tab */}
        {activeTab === 'addSubject' && (
          <AddSubjectTab
            subjectForm={subjectForm}
            setSubjectForm={setSubjectForm}
            subjectErrors={subjectErrors}
            setSubjectErrors={setSubjectErrors}
            subjectEntries={subjectEntries}
            setSubjectEntries={setSubjectEntries}
            handleAddSubjectRow={handleAddSubjectRow}
            handleSubjectSubmit={handleSubjectSubmit}
            setSuccessMessage={setSuccessMessage}
            currentUserInfo={currentUserInfo}
          />
        )}

        {/* Add Student Tab */}
        {activeTab === 'addStudent' && (
          <AddStudentTab
            setSuccessMessage={setSuccessMessage}
            currentUserInfo={currentUserInfo}
          />
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
