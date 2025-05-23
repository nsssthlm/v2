import React from 'react';

const SimpleKanbanPage: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Kanban-tavla</h1>
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <img 
          src="/images/kanban-example.png" 
          alt="Kanban exempel"
          style={{ 
            maxWidth: '100%', 
            maxHeight: '80vh',
            border: '1px solid #ddd',
            borderRadius: '8px'
          }} 
        />
      </div>
    </div>
  );
};

export default SimpleKanbanPage;