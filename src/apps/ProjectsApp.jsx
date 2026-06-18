import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  Trash2, 
  CheckSquare, 
  Calendar, 
  User, 
  ArrowLeft,
  X
} from 'lucide-react';

export default function ProjectsApp() {
  const { 
    db, 
    addProject, 
    addTask, 
    updateTaskColumn, 
    deleteTask, 
    toggleSubtask,
    triggerToast,
    filterMonth,
    filterYear,
    renameProject,
    deleteProject,
    editTask
  } = useOS();

  // Selected project filter ('all' or name)
  const [selectedProject, setSelectedProject] = useState('all');
  const [isRenamingProject, setIsRenamingProject] = useState(false);
  const [renameInput, setRenameInput] = useState('');
  
  // Edit Task States
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskProj, setEditTaskProj] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState('medium');
  const [editTaskDueDate, setEditTaskDueDate] = useState('');
  const [editTaskSubtasks, setEditTaskSubtasks] = useState([]);
  const [editSubtaskInput, setEditSubtaskInput] = useState('');
  
  // Modals / Form States
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskProj, setTaskProj] = useState(db.projects.projectsList[0] || 'General');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [tempSubtasks, setTempSubtasks] = useState([]);
  const [subtaskInput, setSubtaskInput] = useState('');

  // Expand task checklist state
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [cardSubtaskInput, setCardSubtaskInput] = useState('');

  const projects = db.projects.projectsList || [];
  const tasks = db.projects.tasks || [];

  const datePrefix = `${filterYear}-${String(filterMonth).padStart(2, '0')}`;
  const dateFilteredTasks = tasks.filter(t => !t.dueDate || t.dueDate.startsWith(datePrefix));

  // Filtered Tasks
  const filteredTasks = selectedProject === 'all' 
    ? dateFilteredTasks 
    : dateFilteredTasks.filter(t => t.project === selectedProject);

  const getColumnTasks = (columnName) => {
    return filteredTasks.filter(t => t.column === columnName);
  };

  const handleAddFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    addProject(newFolderName.trim());
    setTaskProj(newFolderName.trim()); // select as default in add task
    setNewFolderName('');
    setIsNewFolderOpen(false);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle.trim(),
      project: taskProj,
      column: 'todo',
      priority: taskPriority,
      dueDate: taskDueDate || new Date().toISOString().split('T')[0],
      subtasks: tempSubtasks
    });

    setTaskTitle('');
    setTaskDueDate('');
    setTempSubtasks([]);
    setIsNewTaskOpen(false);
  };

  const handleAddTempSubtask = () => {
    if (!subtaskInput.trim()) return;
    setTempSubtasks([
      ...tempSubtasks,
      { id: 'sub-' + Math.random().toString(36).substring(2, 9), title: subtaskInput.trim(), completed: false }
    ]);
    setSubtaskInput('');
  };

  const [activeDragOverColumn, setActiveDragOverColumn] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      updateTaskColumn(taskId, targetColumn);
    }
  };

  const handleStartEdit = (task) => {
    setEditingTask(task);
    setEditTaskTitle(task.title);
    setEditTaskProj(task.project);
    setEditTaskPriority(task.priority);
    setEditTaskDueDate(task.dueDate || '');
    setEditTaskSubtasks(task.subtasks || []);
    setEditSubtaskInput('');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editTaskTitle.trim()) return;

    editTask(editingTask.id, {
      title: editTaskTitle.trim(),
      project: editTaskProj,
      priority: editTaskPriority,
      dueDate: editTaskDueDate || new Date().toISOString().split('T')[0],
      subtasks: editTaskSubtasks
    });

    setEditingTask(null);
  };

  const handleAddEditSubtask = () => {
    if (!editSubtaskInput.trim()) return;
    setEditTaskSubtasks([
      ...editTaskSubtasks,
      { id: 'sub-' + Math.random().toString(36).substring(2, 9), title: editSubtaskInput.trim(), completed: false }
    ]);
    setEditSubtaskInput('');
  };

  const handleDeleteEditSubtask = (subId) => {
    setEditTaskSubtasks(editTaskSubtasks.filter(s => s.id !== subId));
  };

  const handleAddCardSubtask = (taskId, taskSubtasks, subtaskTitle) => {
    if (!subtaskTitle.trim()) return;
    const newSub = { id: 'sub-' + Math.random().toString(36).substring(2, 9), title: subtaskTitle.trim(), completed: false };
    editTask(taskId, {
      subtasks: [...taskSubtasks, newSub]
    });
  };

  return (
    <div className="projects-layout">
      
      {/* Left Sidebar: Folder / Projects Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>Projects</h3>
          <button 
            onClick={() => setIsNewFolderOpen(true)}
            className="glass-btn" 
            style={{ padding: '4px', borderRadius: '6px' }}
          >
            <Plus size={14} />
          </button>
        </div>

        {isNewFolderOpen && (
          <form onSubmit={handleAddFolder} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
            <input
              type="text"
              placeholder="Folder Name"
              className="glass-input"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              style={{ padding: '6px 8px', fontSize: '12px' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '6px' }}>
              <button type="submit" className="glass-btn" style={{ padding: '4px 8px', fontSize: '11px', flexGrow: 1 }}>Save</button>
              <button type="button" onClick={() => setIsNewFolderOpen(false)} className="glass-btn" style={{ padding: '4px 8px', fontSize: '11px' }}>Cancel</button>
            </div>
          </form>
        )}

        <div className="projects-sidebar">
          <button
            onClick={() => setSelectedProject('all')}
            className={`glass-btn ${selectedProject === 'all' ? 'active' : ''}`}
            style={{ justifyContent: 'space-between', textAlign: 'left', width: '100%', fontSize: '13px' }}
          >
            <span>All Projects</span>
            <span className="font-mono" style={{ opacity: 0.5 }}>{dateFilteredTasks.length}</span>
          </button>
          
          {projects.map(proj => {
            const count = dateFilteredTasks.filter(t => t.project === proj && t.column !== 'done').length;
            return (
              <button
                key={proj}
                onClick={() => setSelectedProject(proj)}
                className={`glass-btn ${selectedProject === proj ? 'active' : ''}`}
                style={{ justifyContent: 'space-between', textAlign: 'left', width: '100%', fontSize: '13px' }}
              >
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                  {proj}
                </span>
                {count > 0 && <span className="font-mono" style={{ opacity: 0.5 }}>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Content Area: Kanban Board */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
        
        {/* Kanban Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {isRenamingProject ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              if (renameInput.trim()) {
                renameProject(selectedProject, renameInput.trim());
                setSelectedProject(renameInput.trim());
                setIsRenamingProject(false);
              }
            }} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                className="glass-input"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                style={{ fontSize: '18px', fontWeight: 700, padding: '4px 8px', height: '32px' }}
                required
                autoFocus
              />
              <button type="submit" className="glass-btn" style={{ padding: '4px 10px', fontSize: '12px' }}>Save</button>
              <button type="button" onClick={() => setIsRenamingProject(false)} className="glass-btn" style={{ padding: '4px 10px', fontSize: '12px' }}>Cancel</button>
            </form>
          ) : (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
                {selectedProject === 'all' ? 'All Workspace Tasks' : selectedProject}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
                Showing {filteredTasks.length} tasks ({filteredTasks.filter(t => t.column === 'done').length} completed)
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {selectedProject !== 'all' && (
              <>
                <button 
                  onClick={() => {
                    setRenameInput(selectedProject);
                    setIsRenamingProject(true);
                  }} 
                  className="glass-btn" 
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  Rename
                </button>
                {selectedProject !== 'General' && (
                  <button 
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete the folder "${selectedProject}"? All tasks inside will be permanently deleted.`)) {
                        deleteProject(selectedProject);
                        setSelectedProject('all');
                      }
                    }} 
                    className="glass-btn" 
                    style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--color-danger)' }}
                  >
                    Delete
                  </button>
                )}
              </>
            )}
            <button 
              onClick={() => {
                setIsNewTaskOpen(true);
              }} 
              className="glass-btn" 
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <Plus size={16} /> New Task
            </button>
          </div>
        </div>

        {/* Task Columns Grid */}
        <div className="kanban-grid">
          
          {/* TO DO Column */}
          <div 
            className={`glass-panel ${activeDragOverColumn === 'todo' ? 'column-drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragEnter={() => setActiveDragOverColumn('todo')}
            onDragLeave={() => setActiveDragOverColumn(null)}
            onDrop={(e) => { handleDrop(e, 'todo'); setActiveDragOverColumn(null); }}
            style={{ borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '400px', transition: 'var(--transition-smooth)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>To Do</h3>
              <span className="font-mono" style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '100px', fontSize: '11px' }}>
                {getColumnTasks('todo').length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {getColumnTasks('todo').map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onMove={(col) => updateTaskColumn(task.id, col)}
                  onDelete={() => deleteTask(task.id)}
                  onToggleSubtask={(subId) => toggleSubtask(task.id, subId)}
                  onAddSubtask={(title) => handleAddCardSubtask(task.id, task.subtasks, title)}
                  onEdit={() => handleStartEdit(task)}
                  isExpanded={expandedTaskId === task.id}
                  onExpand={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                />
              ))}
            </div>
          </div>

          {/* IN PROGRESS Column */}
          <div 
            className={`glass-panel ${activeDragOverColumn === 'in-progress' ? 'column-drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragEnter={() => setActiveDragOverColumn('in-progress')}
            onDragLeave={() => setActiveDragOverColumn(null)}
            onDrop={(e) => { handleDrop(e, 'in-progress'); setActiveDragOverColumn(null); }}
            style={{ borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '400px', transition: 'var(--transition-smooth)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>In Progress</h3>
              <span className="font-mono" style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '100px', fontSize: '11px' }}>
                {getColumnTasks('in-progress').length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {getColumnTasks('in-progress').map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onMove={(col) => updateTaskColumn(task.id, col)}
                  onDelete={() => deleteTask(task.id)}
                  onToggleSubtask={(subId) => toggleSubtask(task.id, subId)}
                  onAddSubtask={(title) => handleAddCardSubtask(task.id, task.subtasks, title)}
                  onEdit={() => handleStartEdit(task)}
                  isExpanded={expandedTaskId === task.id}
                  onExpand={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                />
              ))}
            </div>
          </div>

          {/* DONE Column */}
          <div 
            className={`glass-panel ${activeDragOverColumn === 'done' ? 'column-drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragEnter={() => setActiveDragOverColumn('done')}
            onDragLeave={() => setActiveDragOverColumn(null)}
            onDrop={(e) => { handleDrop(e, 'done'); setActiveDragOverColumn(null); }}
            style={{ borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '400px', transition: 'var(--transition-smooth)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Completed</h3>
              <span className="font-mono" style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '100px', fontSize: '11px' }}>
                {getColumnTasks('done').length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {getColumnTasks('done').map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onMove={(col) => updateTaskColumn(task.id, col)}
                  onDelete={() => deleteTask(task.id)}
                  onToggleSubtask={(subId) => toggleSubtask(task.id, subId)}
                  onAddSubtask={(title) => handleAddCardSubtask(task.id, task.subtasks, title)}
                  onEdit={() => handleStartEdit(task)}
                  isExpanded={expandedTaskId === task.id}
                  onExpand={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                />
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Modal: Create Task */}
      {isNewTaskOpen && (
        <div className="cmd-overlay" style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', paddingTop: '0' }} onClick={() => setIsNewTaskOpen(false)}>
          <div className="glass-panel" style={{ width: '480px', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--glass-shadow)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px' }}>New Kanban Task</h3>
              <button onClick={() => setIsNewTaskOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Task Title</label>
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  className="glass-input"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Project</label>
                  <select
                    className="glass-input"
                    value={taskProj}
                    onChange={(e) => setTaskProj(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    {projects.map(p => (
                      <option key={p} value={p} style={{ background: '#121214' }}>{p}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Priority</label>
                  <select
                    className="glass-input"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="low" style={{ background: '#121214' }}>Low Priority</option>
                    <option value="medium" style={{ background: '#121214' }}>Medium Priority</option>
                    <option value="high" style={{ background: '#121214' }}>High Priority</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Due Date</label>
                <input
                  type="date"
                  className="glass-input font-mono"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>

              {/* Add Subtasks in Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Subtasks Checklist</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Add step..."
                    className="glass-input"
                    value={subtaskInput}
                    onChange={(e) => setSubtaskInput(e.target.value)}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  />
                  <button type="button" onClick={handleAddTempSubtask} className="glass-btn" style={{ padding: '6px 12px', fontSize: '12px' }}>Add Step</button>
                </div>

                {tempSubtasks.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', maxHeight: '100px', overflowY: 'auto' }}>
                    {tempSubtasks.map((st, i) => (
                      <div key={st.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <span>{i + 1}. {st.title}</span>
                        <button type="button" onClick={() => setTempSubtasks(tempSubtasks.filter(s => s.id !== st.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>Delete</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" className="glass-btn" style={{ flexGrow: 1 }}>Create Task</button>
                <button type="button" onClick={() => setIsNewTaskOpen(false)} className="glass-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Task */}
      {editingTask && (
        <div className="cmd-overlay" style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', paddingTop: '0' }} onClick={() => setEditingTask(null)}>
          <div className="glass-panel" style={{ width: '480px', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--glass-shadow)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px' }}>Edit Kanban Task</h3>
              <button onClick={() => setEditingTask(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Task Title</label>
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  className="glass-input"
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Project</label>
                  <select
                    className="glass-input"
                    value={editTaskProj}
                    onChange={(e) => setEditTaskProj(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    {projects.map(p => (
                      <option key={p} value={p} style={{ background: '#121214' }}>{p}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Priority</label>
                  <select
                    className="glass-input"
                    value={editTaskPriority}
                    onChange={(e) => setEditTaskPriority(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="low" style={{ background: '#121214' }}>Low Priority</option>
                    <option value="medium" style={{ background: '#121214' }}>Medium Priority</option>
                    <option value="high" style={{ background: '#121214' }}>High Priority</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Due Date</label>
                <input
                  type="date"
                  className="glass-input font-mono"
                  value={editTaskDueDate}
                  onChange={(e) => setEditTaskDueDate(e.target.value)}
                />
              </div>

              {/* Subtasks Checklist in Edit Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Subtasks Checklist</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Add step..."
                    className="glass-input"
                    value={editSubtaskInput}
                    onChange={(e) => setEditSubtaskInput(e.target.value)}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  />
                  <button type="button" onClick={handleAddEditSubtask} className="glass-btn" style={{ padding: '6px 12px', fontSize: '12px' }}>Add Step</button>
                </div>

                {editTaskSubtasks.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', maxHeight: '120px', overflowY: 'auto' }}>
                    {editTaskSubtasks.map((st, i) => (
                      <div key={st.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <span style={{ textDecoration: st.completed ? 'line-through' : 'none' }}>{i + 1}. {st.title}</span>
                        <button type="button" onClick={() => handleDeleteEditSubtask(st.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>Delete</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" className="glass-btn" style={{ flexGrow: 1 }}>Save Changes</button>
                <button type="button" onClick={() => setEditingTask(null)} className="glass-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Kanban Card Component
function TaskCard({ task, onMove, onDelete, onToggleSubtask, onAddSubtask, onEdit, isExpanded, onExpand }) {
  const [cardSubtaskInput, setCardSubtaskInput] = useState('');
  const completedCount = task.subtasks.filter(s => s.completed).length;
  const totalCount = task.subtasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const priorityColorClass = () => {
    if (task.priority === 'high') return 'danger';
    if (task.priority === 'medium') return 'warning';
    return 'info';
  };

  return (
    <div 
      className="glass-card" 
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      style={{ 
        padding: '14px', 
        borderRadius: '10px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        background: 'rgba(20, 20, 25, 0.35)',
        cursor: 'pointer'
      }}
      onClick={onExpand}
    >
      
      {/* Category & Action Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>
          {task.project}
        </span>
        
        {/* Column Navigation Indicators */}
        <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
          {task.column !== 'todo' && (
            <button 
              onClick={() => onMove(task.column === 'done' ? 'in-progress' : 'todo')} 
              className="glass-btn" 
              style={{ padding: '2px 4px', borderRadius: '4px' }}
            >
              <ChevronLeft size={12} />
            </button>
          )}
          {task.column !== 'done' && (
            <button 
              onClick={() => onMove(task.column === 'todo' ? 'in-progress' : 'done')} 
              className="glass-btn" 
              style={{ padding: '2px 4px', borderRadius: '4px' }}
            >
              <ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-pure)', lineHeight: '1.4' }}>
        {task.title}
      </div>

      {/* Subtask progress mini bar */}
      {totalCount > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-secondary)' }}>
            <span>Steps Completed</span>
            <span>{completedCount}/{totalCount}</span>
          </div>
          <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${progressPercent}%`, 
              height: '100%', 
              background: 'var(--text-secondary)', 
              borderRadius: '2px',
              transition: 'var(--transition-smooth)'
            }} />
          </div>
        </div>
      )}

      {/* Metadata Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={10} />
          <span className="font-mono">{task.dueDate}</span>
        </div>
        <span className={`status-pill ${priorityColorClass()}`} style={{ fontSize: '8px', padding: '1px 5px' }}>
          {task.priority}
        </span>
      </div>

      {/* EXPANDED VIEW: Checklist & Delete */}
      {isExpanded && (
        <div 
          style={{ 
            borderTop: '1px solid var(--border-subtle)', 
            paddingTop: '12px', 
            marginTop: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
          onClick={(e) => e.stopPropagation()} // halt bubbles
        >
          {totalCount > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {task.subtasks.map(sub => (
                <label 
                  key={sub.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    fontSize: '12px', 
                    cursor: 'pointer',
                    color: sub.completed ? 'var(--text-secondary)' : 'var(--text-primary)'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={sub.completed}
                    onChange={() => onToggleSubtask(sub.id)}
                    style={{ accentColor: 'var(--text-pure)', cursor: 'pointer' }}
                  />
                  <span style={{ textDecoration: sub.completed ? 'line-through' : 'none' }}>
                    {sub.title}
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Add Checklist Step Inline */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            <input
              type="text"
              placeholder="Add step..."
              className="glass-input"
              value={cardSubtaskInput}
              onChange={(e) => setCardSubtaskInput(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '12px', flexGrow: 1 }}
            />
            <button 
              type="button" 
              onClick={() => {
                if (cardSubtaskInput.trim()) {
                  onAddSubtask(cardSubtaskInput.trim());
                  setCardSubtaskInput('');
                }
              }} 
              className="glass-btn" 
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Add
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <button 
              onClick={onEdit}
              className="glass-btn" 
              style={{ padding: '4px 8px', fontSize: '11px' }}
            >
              Edit Details
            </button>
            <button 
              onClick={onDelete}
              className="glass-btn" 
              style={{ color: 'var(--color-danger)', border: '1px solid var(--color-danger-border)', padding: '4px 8px', fontSize: '11px' }}
            >
              <Trash2 size={12} /> Delete Card
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
