import { useState } from 'react';

const DepartmentsManagement = ({ selectedCollege, setColleges, colleges, setSuccessMessage, setSelectedDepartment, setSelectedYear, setActiveTab, setSelectedCollege }) => {
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [departmentFormData, setDepartmentFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  const handleDepartmentSubmit = (e) => {
    e.preventDefault();

    const newDepartment = {
      id: editingDepartment ? editingDepartment.id : Date.now(),
      name: departmentFormData.name,
      code: departmentFormData.code,
      description: departmentFormData.description,
      year1: editingDepartment ? editingDepartment.year1 : { users: [], subjects: [] },
      year2: editingDepartment ? editingDepartment.year2 : { users: [], subjects: [] }
    };

    const updatedCollege = {
      ...selectedCollege,
      departments: editingDepartment
        ? selectedCollege.departments.map(d => d.id === editingDepartment.id ? newDepartment : d)
        : [...selectedCollege.departments, newDepartment]
    };

    setColleges(colleges.map(c => c.id === selectedCollege.id ? updatedCollege : c));
    setSelectedCollege(updatedCollege);
    setSuccessMessage(editingDepartment ? 'Department updated successfully!' : 'Department created successfully!');
    setEditingDepartment(null);
    setDepartmentFormData({ name: '', code: '', description: '' });
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setDepartmentFormData({
      name: department.name,
      code: department.code,
      description: department.description
    });
  };

  const handleDeleteDepartment = (departmentId) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      const updatedCollege = {
        ...selectedCollege,
        departments: selectedCollege.departments.filter(d => d.id !== departmentId)
      };
      setColleges(colleges.map(c => c.id === selectedCollege.id ? updatedCollege : c));
      setSelectedCollege(updatedCollege);
      setSuccessMessage('Department deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Department Form */}
      <div className="card">
        <div className="card-body">
          <h2 className="h5 mb-4">
            {editingDepartment ? 'Edit Department' : 'Add New Department'}
          </h2>

          <form onSubmit={handleDepartmentSubmit} className="space-y-3">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="departmentName" className="form-label">
                  Department Name
                </label>
                <input
                  id="departmentName"
                  type="text"
                  value={departmentFormData.name}
                  onChange={(e) => setDepartmentFormData({ ...departmentFormData, name: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="departmentCode" className="form-label">
                  Department Code
                </label>
                <input
                  id="departmentCode"
                  type="text"
                  value={departmentFormData.code}
                  onChange={(e) => setDepartmentFormData({ ...departmentFormData, code: e.target.value })}
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="departmentDescription" className="form-label">
                Description
              </label>
              <textarea
                id="departmentDescription"
                value={departmentFormData.description}
                onChange={(e) => setDepartmentFormData({ ...departmentFormData, description: e.target.value })}
                rows={3}
                className="form-control"
                required
              />
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
              >
                {editingDepartment ? 'Update Department' : 'Add Department'}
              </button>
              {editingDepartment && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingDepartment(null);
                    setDepartmentFormData({ name: '', code: '', description: '' });
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Departments Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="h5 mb-0">All Departments</h2>
        </div>

        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Department Name</th>
                <th>Code</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedCollege.departments.map((department) => (
                <tr key={department.id}>
                  <td className="fw-medium">{department.name}</td>
                  <td>{department.code}</td>
                  <td>{department.description}</td>
                  <td>
                    <button
                      onClick={() => handleEditDepartment(department)}
                      className="btn btn-sm btn-outline-primary me-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDepartment(department.id)}
                      className="btn btn-sm btn-outline-danger me-2"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDepartment(department);
                        setSelectedYear('year1');
                        setActiveTab('departments-year1-users');
                      }}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DepartmentsManagement;
