import { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth, signInWithEmailAndPassword } from '../firebase';
import 'bootstrap/dist/css/bootstrap.min.css';


const LoginPage = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const isValidPassword = (userRecord, inputPassword) => {
    // Check if the user record has a password field and compare
    if (userRecord.password) {
      return userRecord.password === inputPassword;
    }
    // If no password is stored, return false to prevent login
    // This ensures that only users with proper credentials can log in
    return false;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      setError('Please enter both email and password');
      return;
    }

    // Hardcoded admin credentials check
    if (credentials.email === 'admin123@gmail.com' && credentials.password === 'Password') {
      const adminUser = {
        email: 'admin123@gmail.com',
        username: 'admin123',
        role: 'admin',
        status: 'active',
        canManageResults: true,
        createdAt: new Date().toISOString().split('T')[0]
      };
      onLogin(adminUser);
      return;
    }

    try {
      // First, try Firebase Authentication
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      
      // If Firebase auth succeeds, check if the user exists in the COLLEGE collection
      const collegesSnapshot = await getDocs(collection(db, 'colleges'));
      let foundUser = null;
      let userCollegeData = null;
      let userCollegeId = null;
      let userDepartment = null;
      let userYear = null;
      
      for (const collegeDoc of collegesSnapshot.docs) {
        const collegeData = collegeDoc.data();
        
        // Check for user in college-level users
        if (collegeData.users && Array.isArray(collegeData.users)) {
          const userInCollege = collegeData.users.find(u => u.username === credentials.email || u.username === credentials.email.split('@')[0]);
          if (userInCollege && isValidPassword(userInCollege, credentials.password)) {
            foundUser = userInCollege;
            userCollegeData = collegeData;
            userCollegeId = collegeDoc.id;
            break;
          }
        }
        
        // Check for user in department-level users
        if (collegeData.departments && Array.isArray(collegeData.departments)) {
          for (const dept of collegeData.departments) {
            if (dept.year1 && dept.year1.users && Array.isArray(dept.year1.users)) {
              const userInDept = dept.year1.users.find(u => u.username === credentials.email || u.username === credentials.email.split('@')[0]);
              if (userInDept && isValidPassword(userInDept, credentials.password)) {
                foundUser = userInDept;
                userCollegeData = collegeData;
                userCollegeId = collegeDoc.id;
                userDepartment = dept;
                userYear = 'year1';
                break;
              }
            }
            
            if (dept.year2 && dept.year2.users && Array.isArray(dept.year2.users)) {
              const userInDept = dept.year2.users.find(u => u.username === credentials.email || u.username === credentials.email.split('@')[0]);
              if (userInDept && isValidPassword(userInDept, credentials.password)) {
                foundUser = userInDept;
                userCollegeData = collegeData;
                userCollegeId = collegeDoc.id;
                userDepartment = dept;
                userYear = 'year2';
                break;
              }
            }
          }
        }
      }
      
      if (!foundUser) {
        setError('User not found in the system. Please contact administrator.');
        return;
      }
      
      // Create user data object based on found user
      const userData = {
        email: credentials.email,
        username: foundUser.username,
        ...foundUser,
        college: userCollegeData,
        collegeId: userCollegeId,
        department: userDepartment,
        year: userYear
      };
      
      onLogin(userData);
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-vh-100 bg-white d-flex align-items-center justify-content-center p-4">
      <div className="card shadow-lg" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h1 className="h3 mb-3 fw-bold">Student Result System</h1>
            <p className="text-muted">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="form-control"
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="form-control"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
            >
              Sign In
            </button>
          </form>

          <div className="mt-4 text-center text-muted small">
            <p className="mb-1">Firebase Authentication:</p>
            <p className="mb-1">Use any valid Firebase email/password</p>
            <p className="mb-0">Login credentials are checked against the COLLEGE collection</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
