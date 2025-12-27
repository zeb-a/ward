import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', description: '' });

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*');
        
        if (error) throw error;
        setClasses(data || []);
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleAddClass = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('classes')
        .insert([newClass])
        .select();

      if (error) throw error;

      setClasses([...classes, ...data]);
      setNewClass({ name: '', description: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding class:', error);
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
        Loading classes...
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
          Classes
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
          + Add Class
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
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Add New Class</h3>
          <form onSubmit={handleAddClass}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Class Name</label>
                <input
                  type="text"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
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
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Description</label>
                <input
                  type="text"
                  value={newClass.description}
                  onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
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
                Add Class
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
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>All Classes</h3>
        
        {classes.length === 0 ? (
          <div style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>
            No classes found. Add your first class to get started.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {classes.map(cls => (
              <div key={cls.id} style={{
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
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #6b46ff, #7dd7ff)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '20px'
                  }}>
                    🏫
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '18px' }}>{cls.name}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                      {cls.description || 'No description'}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(11,18,32,0.06)',
                    background: 'transparent',
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    Edit
                  </button>
                  <button style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6b46ff, #b86bff)',
                    border: '0',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    View Students
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