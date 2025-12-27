import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReward, setNewReward] = useState({ 
    name: '', 
    description: '', 
    points: 10,
    icon: '🏆' 
  });
  const [students, setStudents] = useState([]);

  // Fetch rewards and students
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*');
        
        if (studentsError) throw studentsError;
        setStudents(studentsData || []);

        // Fetch rewards
        const { data: rewardsData, error: rewardsError } = await supabase
          .from('rewards')
          .select('*');
        
        if (rewardsError) throw rewardsError;
        setRewards(rewardsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddReward = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('rewards')
        .insert([newReward])
        .select();

      if (error) throw error;

      setRewards([...rewards, ...data]);
      setNewReward({ name: '', description: '', points: 10, icon: '🏆' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding reward:', error);
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
        Loading rewards...
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
          Rewards
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
          + Add Reward
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
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Add New Reward</h3>
          <form onSubmit={handleAddReward}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Reward Name</label>
                <input
                  type="text"
                  value={newReward.name}
                  onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
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
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Icon</label>
                <select
                  value={newReward.icon}
                  onChange={(e) => setNewReward({ ...newReward, icon: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #eef2f8',
                    background: 'linear-gradient(180deg, #fff, #fbfdff)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)'
                  }}
                >
                  <option value="🏆">🏆 Trophy</option>
                  <option value="⭐">⭐ Star</option>
                  <option value=" medal"> 🏅 Medal</option>
                  <option value="🎁">🎁 Gift</option>
                  <option value="🎯">🎯 Target</option>
                  <option value="💎">💎 Gem</option>
                  <option value="🎈">🎈 Balloon</option>
                  <option value="🌈">🌈 Rainbow</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Description</label>
                <input
                  type="text"
                  value={newReward.description}
                  onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
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
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Points</label>
                <input
                  type="number"
                  value={newReward.points}
                  onChange={(e) => setNewReward({ ...newReward, points: parseInt(e.target.value) })}
                  min="1"
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
                Add Reward
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
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>All Rewards</h3>
        
        {rewards.length === 0 ? (
          <div style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>
            No rewards found. Add your first reward to get started.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
            {rewards.map(reward => (
              <div key={reward.id} style={{
                background: 'linear-gradient(180deg, #fff, #fbfdff)',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid rgba(120,110,255,0.06)',
                transition: '0.28s'
              }}
              onMouseEnter={(e) => e.style.transform = 'translateY(-2px) scale(1.02)'}
              onMouseLeave={(e) => e.style.transform = 'translateY(0) scale(1)'}
              >
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>{reward.icon}</div>
                  <div style={{ fontWeight: '600', fontSize: '16px' }}>{reward.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    {reward.description || 'No description'}
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 0',
                  borderTop: '1px solid rgba(11,18,32,0.06)',
                  marginTop: '12px'
                }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #6b46ff, #b86bff)', 
                    color: 'white', 
                    padding: '4px 8px', 
                    borderRadius: '20px',
                    fontSize: '12px'
                  }}>
                    {reward.points} pts
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(11,18,32,0.06)',
                      background: 'transparent',
                      color: '#6b7280',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}>
                      Edit
                    </button>
                    <button style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'linear-gradient(135deg, #6b46ff, #b86bff)',
                      border: '0',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}>
                      Award
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};