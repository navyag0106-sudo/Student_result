const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// Get all students
router.get('/', async (req, res) => {
  try {
    const studentsSnapshot = await db.collection('students').get();
    const students = studentsSnapshot.docs.map(doc => doc.data());
    res.json({ success: true, data: students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Error fetching students' });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const studentSnapshot = await db.collection('students').where('id', '==', req.params.id).get();
    
    if (studentSnapshot.empty) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const student = studentSnapshot.docs[0].data();
    res.json({ success: true, data: student });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ success: false, message: 'Error fetching student' });
  }
});

// Verify student credentials and get grades with year and semester validation
router.post('/verify', async (req, res) => {
  try {
    const { regNo, dob, year, semester } = req.body;
    
    if (!regNo || !dob) {
      return res.status(400).json({ 
        success: false, 
        message: 'Registration number and date of birth are required' 
      });
    }
    
    // Find student by ID and DOB in STUDENT collection
    const studentSnapshot = await db.collection('students')
      .where('id', '==', regNo)
      .where('dob', '==', dob)
      .get();
    
    if (studentSnapshot.empty) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid registration number or date of birth' 
      });
    }
    
    const student = studentSnapshot.docs[0].data();
    
    // Build grades query with optional year and semester filters in GRADES collection
    let gradesQuery = db.collection('GRADES').where('studentId', '==', regNo);
    
    // Add year filter if provided
    if (year) {
      gradesQuery = gradesQuery.where('year', '==', year);
    }
    
    // Add semester filter if provided
    if (semester) {
      gradesQuery = gradesQuery.where('semester', '==', semester);
    }
    
    const gradesSnapshot = await gradesQuery.get();
    
    if (gradesSnapshot.empty && (year || semester)) {
      return res.status(404).json({ 
        success: false, 
        message: `No grades found for student ${regNo}${year ? ` in ${year}` : ''}${semester ? ` for ${semester}` : ''}` 
      });
    }
    
    // Process grades from GRADES collection
    const grades = gradesSnapshot.docs.map(doc => {
      const gradeData = doc.data();
      // If the grade has a subjects array, flatten it to individual grade entries
      if (gradeData.subjects && Array.isArray(gradeData.subjects)) {
        return gradeData.subjects.map(subject => ({
          id: `${doc.id}_${subject.name}`,
          studentId: gradeData.studentId,
          year: gradeData.year,
          semester: gradeData.semester,
          subject: subject.name,
          score: subject.marks,
          grade: subject.grade,
          present: subject.present,
          date: gradeData.createdAt || new Date().toISOString()
        }));
      } else {
        // If it's a single subject record
        return {
          id: doc.id,
          studentId: gradeData.studentId,
          year: gradeData.year,
          semester: gradeData.semester,
          subject: gradeData.subject,
          score: gradeData.marks || gradeData.score,
          grade: gradeData.grade,
          present: gradeData.present,
          date: gradeData.createdAt || new Date().toISOString()
        };
      }
    }).flat(); // Flatten the array if subjects were expanded
    
    res.json({ 
      success: true, 
      data: {
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          year: student.year,
          dept: student.dept
        },
        grades: grades,
        filters: {
          year: year || 'all',
          semester: semester || 'all'
        }
      }
    });
  } catch (error) {
    console.error('Error verifying student:', error);
    res.status(500).json({ success: false, message: 'Error verifying student credentials' });
  }
});

// Validate grade access with strict ID, DOB, year, and semester verification
router.post('/validate-grade-access', async (req, res) => {
  try {
    const { regNo, dob, year, semester } = req.body;
    
    // Validate required fields (make year and semester optional)
    if (!regNo || !dob) {
      return res.status(400).json({ 
        success: false, 
        message: 'Registration number and date of birth are required for grade access' 
      });
    }
    
    // Find student by ID and DOB in STUDENT collection
    const studentSnapshot = await db.collection('students')
      .where('id', '==', regNo)
      .where('dob', '==', dob)
      .get();
    
    if (studentSnapshot.empty) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid registration number or date of birth' 
      });
    }
    
    const student = studentSnapshot.docs[0].data();
    
    // Build grades query with optional year and semester filters in GRADES collection
    let gradesQuery = db.collection('GRADES').where('studentId', '==', regNo);
    
    // Add year filter if provided
    if (year) {
      gradesQuery = gradesQuery.where('year', '==', year);
    }
    
    // Add semester filter if provided
    if (semester) {
      gradesQuery = gradesQuery.where('semester', '==', semester);
    }
    
    const gradesSnapshot = await gradesQuery.get();
    
    if (gradesSnapshot.empty && (year || semester)) {
      return res.status(404).json({ 
        success: false, 
        message: `No grades found for student ${regNo}${year ? ` in ${year}` : ''}${semester ? ` for ${semester}` : ''}` 
      });
    }
    
    // Process grades from GRADES collection
    const grades = gradesSnapshot.docs.map(doc => {
      const gradeData = doc.data();
      // If the grade has a subjects array, flatten it to individual grade entries
      if (gradeData.subjects && Array.isArray(gradeData.subjects)) {
        return gradeData.subjects.map(subject => ({
          id: `${doc.id}_${subject.name}`,
          studentId: gradeData.studentId,
          year: gradeData.year,
          semester: gradeData.semester,
          subject: subject.name,
          score: subject.marks,
          grade: subject.grade,
          present: subject.present,
          date: gradeData.createdAt || new Date().toISOString()
        }));
      } else {
        // If it's a single subject record
        return {
          id: doc.id,
          studentId: gradeData.studentId,
          year: gradeData.year,
          semester: gradeData.semester,
          subject: gradeData.subject,
          score: gradeData.marks || gradeData.score,
          grade: gradeData.grade,
          present: gradeData.present,
          date: gradeData.createdAt || new Date().toISOString()
        };
      }
    }).flat(); // Flatten the array if subjects were expanded
    
    res.json({ 
      success: true, 
      message: 'Grade access validated successfully',
      data: {
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          year: student.year,
          dept: student.dept
        },
        grades: grades,
        validation: {
          regNo: regNo,
          dob: dob,
          year: year || 'all',
          semester: semester || 'all',
          verified: true
        }
      }
    });
  } catch (error) {
    console.error('Error validating grade access:', error);
    res.status(500).json({ success: false, message: 'Error validating grade access' });
  }
});

// Create student
router.post('/', async (req, res) => {
  try {
    const studentData = req.body;
    
    // Check if student already exists
    const existingStudent = await db.collection('students')
      .where('id', '==', studentData.id)
      .get();
    
    if (!existingStudent.empty) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student with this registration number already exists' 
      });
    }
    
    // Add timestamp
    studentData.createdAt = new Date().toISOString();
    studentData.updatedAt = new Date().toISOString();
    
    await db.collection('students').add(studentData);
    res.json({ success: true, message: 'Student created successfully' });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ success: false, message: 'Error creating student' });
  }
});

module.exports = router;