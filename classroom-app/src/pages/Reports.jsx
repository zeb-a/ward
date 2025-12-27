import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('student-progress');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*');
        
        if (studentsError) throw studentsError;
        setStudents(studentsData || []);

        // Fetch classes
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('*');
        
        if (classesError) throw classesError;
        setClasses(classesData || []);

        // Fetch reports
        const { data: reportsData, error: reportsError } = await supabase
          .from('reports')
          .select('*');
        
        if (reportsError) throw reportsError;
        setReports(reportsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateReport = async () => {
    setLoading(true);
    try {
      // This would be the actual report generation logic
      // For now, we'll just simulate it
      const newReport = {
        id: Date.now(),
        type: reportType,
        student_id: selectedStudent || null,
        generated_at: new Date().toISOString(),
        data: {
          title: `Report for ${reportType.replace('-', ' ')}`,
          content: 'This is a sample report. In a real application, this would contain actual data from your database.'
        }
      };
      
      setReports([newReport, ...reports]);
    } catch (error) {
      console.error('Error generating report:', error);
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
        Loading reports...
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
          Reports & Analytics
        </h2>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '18px',
        padding: '24px',
        boxShadow: '0 8px 28px rgba(15,20,40,0.08)',
        border: '1px solid rgba(120,110,255,0.06)',
        marginBottom: '24px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Generate Report</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #eef2f8',
                background: 'linear-gradient(180deg, #fff, #fbfdff)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              <option value="student-progress">Student Progress</option>
              <option value="class-performance">Class Performance</option>
              <option value="reward-distribution">Reward Distribution</option>
              <option value="activity-summary">Activity Summary</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Student (Optional)</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #eef2f8',
                background: 'linear-gradient(180deg, #fff, #fbfdff)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              <option value="">All Students</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Date Range</label>
            <select
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #eef2f8',
                background: 'linear-gradient(180deg, #fff, #fbfdff)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              <option value="last-week">Last Week</option>
              <option value="last-month">Last Month</option>
              <option value="last-quarter">Last Quarter</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          <button
            onClick={generateReport}
            style={{
              background: 'linear-gradient(135deg, #6b46ff, #b86bff)',
              color: 'white',
              border: '0',
              padding: '12px 16px',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Generate
          </button>
        </div>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '18px',
        padding: '24px',
        boxShadow: '0 8px 28px rgba(15,20,40,0.08)',
        border: '1px solid rgba(120,110,255,0.06)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Recent Reports</h3>
        
        {reports.length === 0 ? (
          <div style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>
            No reports generated yet. Generate your first report to see it here.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {reports.map(report => (
              <div key={report.id} style={{
                background: 'linear-gradient(180deg, #fff, #fbfdff)',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid rgba(120,110,255,0.06)',
                transition: '0.28s'
              }}
              onMouseEnter={(e) => e.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                      {report.data?.title || report.type.replace('-', ' ')}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {new Date(report.generated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    background: 'linear-gradient(135deg, #6b46ff, #b86bff)',
                    color: 'white'
                  }}>
                    {report.type.replace('-', ' ')}
                  </div>
                </div>
                
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                  {report.data?.content || 'Report content would appear here in a real application.'}
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
                    View
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
                    Download
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