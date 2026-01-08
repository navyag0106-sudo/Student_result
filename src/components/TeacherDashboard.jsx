import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import 'bootstrap/dist/css/bootstrap.min.css';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import AddStudentModal from './AddStudentModal';
import UploadGradesTab from './UploadGradesTab';
import ManageGradesTab from './ManageGradesTab';
import AddSubjectTab from './AddSubjectTab';

const TeacherDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: '',
    regNo: '',
    year: '',
    dept: '',
    dob: ''
  });
  const [studentErrors, setStudentErrors] = useState({});
  const [newSubject, setNewSubject] = useState('');
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
    // Mock data - in real app, this would be API calls
    setTimeout(() => {
      const mockStudents = [
        { id: 'STU001', name: 'John Smith' },
        { id: 'STU002', name: 'Emily Johnson' },
        { id: 'STU003', name: 'Michael Brown' },
        { id: 'STU004', name: 'Sarah Davis' },
        { id: 'STU005', name: 'James Wilson' },
      ];

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

      setStudents(mockStudents);
      setSubjects(mockSubjects);
      setGrades(mockGrades);
      setLoading(false);
    }, 1000);
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
    setIsStudentModalOpen(false);
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
        subjects: subjectEntries.map(({ id, ...rest }) => rest),
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
      <AddStudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSave={handleStudentSubmit}
        students={students}
        setStudents={setStudents}
        setSuccessMessage={setSuccessMessage}
      />
      {/* Header */}
      <header className="bg-white shadow-sm border-bottom">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center py-3">
            <h1 className="h5 mb-0">Teacher Dashboard</h1>
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted">Welcome, {user.username}</span>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => setIsStudentModalOpen(true)}
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
            setErrors={setErrors}
            fetchedSubjects={fetchedSubjects}
            subjectsLoading={subjectsLoading}
            subjectsError={subjectsError}
            handleSubmit={handleSubmit}
            handleInputChange={handleInputChange}
            handleMarksChange={handleMarksChange}
            handlePresentChange={handlePresentChange}
            calculateGrade={calculateGrade}
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
          />
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
