import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = 'http://127.0.0.1:8000';

function App() {
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [salary, setSalary] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/employees/`);
      setEmployees(response.data);
    } catch (error) {
      toast.error('Failed to load employee list.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const employeeData = { name, email, department, designation, salary: parseFloat(salary) };
      
      if (editingId) {
        await axios.put(`${API_URL}/employees/${editingId}`, employeeData);
        toast.success('Employee updated successfully!');
        setEditingId(null);
      } else {
        await axios.post(`${API_URL}/employees/`, employeeData);
        toast.success('Employee added successfully!');
      }

      setName(''); setEmail(''); setDepartment(''); setDesignation(''); setSalary('');
      fetchEmployees();
    } catch (error) {
      toast.error('Error saving employee.');
    }
  };

  const handleEditClick = (emp) => {
    setEditingId(emp.id);
    setName(emp.name);
    setEmail(emp.email);
    setDepartment(emp.department);
    setDesignation(emp.designation);
    setSalary(emp.salary);
    toast('Editing employee...', { icon: '✏️' });
  };

  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`${API_URL}/employees/${id}`);
      toast.success('Employee deleted!');
      setConfirmDeleteId(null);
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to delete.');
    }
  };

  const exportToCSV = () => {
    if (employees.length === 0) { toast.error('No data!'); return; }
    const headers = ['ID,Name,Email,Department,Designation,Salary\n'];
    const rows = employees.map(emp => `${emp.id},"${emp.name}","${emp.email}","${emp.department}","${emp.designation}",${emp.salary}`);
    const csvContent = 'data:text/csv;charset=utf-8,' + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'employee_directory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported to CSV!');
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalEmployees = employees.length;
  const totalPayroll = employees.reduce((acc, curr) => acc + curr.salary, 0);
  const uniqueDepartments = new Set(employees.map(e => e.department)).size;

  return (
    <div className="dashboard-container">
      <Toaster position="top-right" />
      <h1>Employee Management System Dashboard</h1>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <p>Total Employees</p>
          <h3>{totalEmployees}</h3>
        </div>
        <div className="stat-card">
          <p>Total Monthly Payroll</p>
          <h3>${totalPayroll.toLocaleString()}</h3>
        </div>
        <div className="stat-card">
          <p>Departments</p>
          <h3>{uniqueDepartments}</h3>
        </div>
      </div>

      {/* Form */}
      <div className="form-box">
        <h3>{editingId ? 'Edit Employee' : 'Add New Employee'}</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="text" placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} required />
          <input type="text" placeholder="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} required />
          <input type="number" placeholder="Salary" value={salary} onChange={(e) => setSalary(e.target.value)} required className="full-width" />
          
          <div className="full-width" style={{display: 'flex', gap: '10px'}}>
            <button type="submit" className="btn-submit" style={{backgroundColor: editingId ? '#059669' : '#2563eb'}}>
              {editingId ? 'Update Employee' : 'Add Employee'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setName(''); setEmail(''); setDepartment(''); setDesignation(''); setSalary(''); }} className="btn-submit" style={{backgroundColor: '#64748b'}}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List Header */}
      <div className="table-header-flex">
        <h3 style={{margin: 0}}>Employee List</h3>
        <div style={{display: 'flex', gap: '10px'}}>
          <input
            type="text"
            placeholder="Search name or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={exportToCSV} className="btn-export">Export CSV</button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>Name {sortField === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
              <th>Email</th>
              <th onClick={() => handleSort('department')}>Department {sortField === 'department' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
              <th>Designation</th>
              <th onClick={() => handleSort('salary')}>Salary {sortField === 'salary' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>
              <th style={{textAlign: 'center'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>No employees found.</td></tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td style={{fontWeight: 500}}>{emp.name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>
                  <td>${emp.salary.toLocaleString()}</td>
                  <td style={{textAlign: 'center'}}>
                    {confirmDeleteId === emp.id ? (
                      <>
                        <button onClick={() => deleteEmployee(emp.id)} className="btn-delete" style={{padding: '4px 8px', fontSize: '12px'}}>Confirm</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="btn-edit" style={{padding: '4px 8px', fontSize: '12px', background: '#cbd5e1', color: '#000'}}>No</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditClick(emp)} className="btn-edit">Edit</button>
                        <button onClick={() => setConfirmDeleteId(emp.id)} className="btn-delete">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;