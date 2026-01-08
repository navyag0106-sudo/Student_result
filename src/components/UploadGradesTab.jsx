import React from 'react';

const UploadGradesTab = ({
  editingGrade,
  setEditingGrade,
  formData,
  setFormData,
  errors,
  setErrors,
  fetchedSubjects,
  subjectsLoading,
  subjectsError,
  handleSubmit,
  handleInputChange,
  handleMarksChange,
  handlePresentChange,
  calculateGrade
}) => {

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="h5 mb-4">
          {editingGrade ? 'Edit Grade' : 'Upload New Grade'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="regNo" className="form-label">
                Reg No
              </label>
              <input
                id="regNo"
                name="regNo"
                type="text"
                value={formData.regNo}
                onChange={handleInputChange}
                className={`form-control ${errors.regNo ? 'is-invalid' : ''}`}
                placeholder="e.g., STU123"
              />
              {errors.regNo && (
                <div className="invalid-feedback">{errors.regNo}</div>
              )}
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="year" className="form-label">
                Year
              </label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className={`form-select ${errors.year ? 'is-invalid' : ''}`}
              >
                <option value="">Select year</option>
                <option value="Year I">Year I</option>
                <option value="Year II">Year II</option>
              </select>
              {errors.year && (
                <div className="invalid-feedback">{errors.year}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="semester" className="form-label">
                Semester
              </label>
              <select
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                className={`form-select ${errors.semester ? 'is-invalid' : ''}`}
              >
                <option value="">Select semester</option>
                <option value="Sem 1">Sem 1</option>
                <option value="Sem 2">Sem 2</option>
                <option value="Sem 3">Sem 3</option>
                <option value="Sem 4">Sem 4</option>
              </select>
              {errors.semester && (
                <div className="invalid-feedback">{errors.semester}</div>
              )}
            </div>
          </div>

          {formData.year && formData.semester && (
            <div className="mt-3">
              <h3 className="h6 mb-2">
                Subjects for {formData.year} - {formData.semester}
              </h3>

              {subjectsLoading && (
                <p className="text-muted mb-0">Loading subjects from database...</p>
              )}

              {!subjectsLoading && subjectsError && (
                <div className="alert alert-danger py-2 mb-2">
                  {subjectsError}
                </div>
              )}

              {!subjectsLoading && !subjectsError && fetchedSubjects.length === 0 && (
                <p className="text-muted mb-0">No subjects found for this year and semester.</p>
              )}

              {!subjectsLoading && !subjectsError && fetchedSubjects.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-sm table-striped align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Subject Name</th>
                        <th>Present</th>
                        <th>Marks</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fetchedSubjects.map((subj, index) => {
                        const marks = formData.marks[subj.name] || '';
                        const present = formData.present[subj.name] || false;
                        const grade = marks ? calculateGrade(parseInt(marks), present) : '';
                        return (
                          <tr key={`${subj.name}-${subj.year}-${subj.semester}-${index}`}>
                            <td>{subj.name}</td>
                            <td>
                              <input
                                type="checkbox"
                                checked={present}
                                onChange={(e) => handlePresentChange(subj.name, e.target.checked)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className={`form-control form-control-sm ${errors[`marks_${subj.name}`] ? 'is-invalid' : ''}`}
                                value={marks}
                                onChange={(e) => handleMarksChange(subj.name, e.target.value)}
                                placeholder="0-100"
                                min="0"
                                max="100"
                              />
                              {errors[`marks_${subj.name}`] && (
                                <div className="invalid-feedback">{errors[`marks_${subj.name}`]}</div>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${grade === 'O' ? 'bg-success' : grade === 'A+' || grade === 'A' ? 'bg-primary' : grade === 'B+' || grade === 'B' ? 'bg-info' : grade === 'C' ? 'bg-warning' : 'bg-danger'}`}>
                                {grade || '-'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
            >
              {editingGrade ? 'Update Grade' : 'Upload Grade'}
            </button>
            {editingGrade && (
              <button
                type="button"
                onClick={() => {
                  setEditingGrade(null);
                  setFormData({
                    regNo: '',
                    year: '',
                    semester: ''
                  });
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
  );
};

export default UploadGradesTab;
