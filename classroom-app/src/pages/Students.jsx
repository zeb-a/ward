import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', class_id: '' });
  const [classes, setClasses] = useState([]);

  return (
    <>
      <style>{`
        .btn-hover {
          transition: transform 0.28s ease;
        }
        .btn-hover:hover {
          transform: scale(1.04);
        }
        .card-hover {
          transition: transform 0.28s ease;
        }
        .card-hover:hover {
          transform: translateY(-2px);
        }
      `}</style>

  // Fetch students and classes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch classes
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('*');
        
        if (classesError) throw classesError;
        setClasses(classesData || []);

        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*');
        
        if (studentsError) throw studentsError;
        setStudents(studentsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('students')
        .insert([newStudent])
        .select();

      if (error) throw error;

      setStudents([...students, ...data]);
      setNewStudent({ name: '', class_id: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding student:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#6b46ff'
      }}>
        Loading students...
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          margin: 0,
          color: '#22143a'
        }}>
          Students
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            background: 'linear-gradient(135deg, #6b46ff, #b86bff)',
            color: 'white',
            border: '0',
            padding: '12px 16px',
            borderRadius: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 8px 28px rgba(15,20,40,0.08)',
            transition: '0.28s'
          }}
          onMouseEnter={(e) => e.style.transform = 'scale(1.04)'}
          onMouseLeave={(e) => e.style.transform = 'scale(1)'}
        >
          + Add Student
        </button>
      </div>

      {showAddForm && (
        <div style={{
          background: 'white',
          borderRadius: '18px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 8px 28px rgba(15,20,40,0.08)',
          border: '1px solid rgba(120,110,255,0.06)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Add New Student</h3>
          <form onSubmit={handleAddStudent}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Student Name</label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #eef2f8',
                    background: 'linear-gradient(180deg, #fff, #fbfdff)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Class</label>
                <select
                  value={newStudent.class_id}
                  onChange={(e) => setNewStudent({ ...newStudent, class_id: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #eef2f8',
                    background: 'linear-gradient(180deg, #fff, #fbfdff)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)'
                  }}
                >
                  <option value="">Select a class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(11,18,32,0.06)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #6b46ff, #b86bff)',
                  color: 'white',
                  border: '0',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Add Student
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{
        background: 'white',
        borderRadius: '18px',
        padding: '24px',
        boxShadow: '0 8px 28px rgba(15,20,40,0.08)',
        border: '1px solid rgba(120,110,255,0.06)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>All Students</h3>
        
        {students.length === 0 ? (
          <div style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>
            No students found. Add your first student to get started.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {students.map(student => (
              <div key={student.id} style={{
                background: 'linear-gradient(180deg, #fff, #fbfdff)',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid rgba(120,110,255,0.06)',
                transition: '0.28s'
              }}
              onMouseEnter={(e) => e.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6b46ff, #7dd7ff)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}>
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>{student.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {classes.find(c => c.id === student.class_id)?.name || 'No class'}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(11,18,32,0.06)',
                    background: 'transparent',
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}>
                    Edit
                  </button>
                  <button style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6b46ff, #b86bff)',
                    border: '0',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};