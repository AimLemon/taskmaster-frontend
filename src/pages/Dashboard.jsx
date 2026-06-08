import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import './Dashboard.css';
import logo from '../assets/taskmastericon.png';

const Dashboard = () => {
    // Membersihkan trailing slash dari URL API agar tidak terjadi double slash
    const API_URL = process.env.REACT_APP_API_URL?.replace(/\/$/, "");

    // State Management
    const [user, setUser] = useState({ id: '', name: '', email: '' });
    const [tasks, setTasks] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    
    // State Modal Detail & Edit
    const [detailTask, setDetailTask] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        id: '', title: '', deadline: '', description: '', priority: '', color: '', attachment: ''
    });

    // State Grouping & Form Tambah
    const [openInProgressSubjects, setOpenInProgressSubjects] = useState({}); // State terpisah untuk "Sedang Dikerjakan"
    const [openCompletedSubjects, setOpenCompletedSubjects] = useState({});   // State terpisah untuk "Selesai"
    const [isNewSubject, setIsNewSubject] = useState(false);
    const [form, setForm] = useState({
        subject: '', title: '', description: '', deadline: '', priority: 'Biasa', color: '#3b82f6', attachment: ''
    });

    // State Pencarian dan Filter
    const [filtersInProgress, setFiltersInProgress] = useState({ search: '', date: '', subject: '' });
    const [filtersCompleted, setFiltersCompleted] = useState({ search: '', date: '', subject: '' });

    // State Edit Profil
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: '', email: '' });

    useEffect(() => {
        const initDashboard = async () => {
            const token = await refreshToken();
            if (token) fetchTasks(token);
        };
        initDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refreshToken = async () => {
        try {
            const response = await axios.get(`${API_URL}/token`, {
                withCredentials: true
            });
            const newToken = response.data.accessToken;
            localStorage.setItem('accessToken', newToken);
            const decoded = jwtDecode(newToken);
            setUser({ id: decoded.userId, name: decoded.name, email: decoded.email });
            return newToken;
        } catch (error) {
            // Jika refresh token gagal/habis, arahkan kembali ke login
            window.location.href = "/";
            return null;
        }
    }

    const fetchTasks = async (token) => {
        try {
            const res = await axios.get(`${API_URL}/tasks`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(res.data);
        } catch (err) {
            console.log("Gagal mengambil data");
        }
    };

    // --- FUNGSI CREATE ---
    const handleSave = async (e) => {
        e.preventDefault();
        const token = await refreshToken();
        
        const payload = {
            subject: form.subject,
            title: form.title,
            description: form.description,
            deadline: form.deadline,
            priority: form.priority,
            color: form.color,
            attachment: form.attachment
        };

        try { 
            await axios.post(`${API_URL}/tasks`, payload, {
                headers: { 
                    Authorization: `Bearer ${token}`
                }
            });
            setShowAddModal(false);
            setForm({ subject: '', title: '', description: '', deadline: '', priority: 'Biasa', color: '#3b82f6', attachment: '' });
            setIsNewSubject(false);
            fetchTasks(token);
        } catch (err) {
            const errorMsg = err.response?.data?.msg || "Gagal menyimpan tugas";
            alert(errorMsg);
        }
    };

    // --- FUNGSI UPDATE (EDIT) ---
    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = await refreshToken();

        const payload = {
            title: editForm.title,
            description: editForm.description,
            deadline: editForm.deadline,
            priority: editForm.priority,
            color: editForm.color,
            attachment: editForm.attachment
        };

        try { 
            await axios.patch(`${API_URL}/tasks/${editForm.id}`, payload, {
                headers: { 
                    Authorization: `Bearer ${token}`
                }
            });
            setIsEditing(false);
            setDetailTask(null);
            fetchTasks(token);
            alert("Tugas berhasil diperbarui!");
        } catch (err) {
            console.error(err);
            alert("Gagal memperbarui tugas");
        }
    };

    // --- FUNGSI DELETE ---
    const handleDelete = async (id) => {
        if (window.confirm("Apakah kamu yakin ingin menghapus tugas ini?")) {
            const token = await refreshToken();
            try {
                await axios.delete(`${API_URL}/tasks/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDetailTask(null);
                fetchTasks(token);
                alert("Tugas berhasil dihapus!");
            } catch (err) {
                alert("Gagal menghapus tugas");
            }
        }
    };

    // Helper untuk mendapatkan warna berdasarkan prioritas secara dinamis
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Penting': return '#eab308'; // Kuning
            case 'Utama': return '#ef4444';   // Merah
            default: return '#3b82f6';      // Biru
        }
    };

    // --- FUNGSI TOGGLE SELESAI ---
    const toggleComplete = async (task) => {
        const token = await refreshToken();
        const payload = {
            title: task.title,
            description: task.description || '',
            deadline: task.deadline,
            priority: task.priority,
            color: task.color,
            isCompleted: !task.isCompleted,
            attachment: task.attachment
        };

        try { 
            await axios.patch(`${API_URL}/tasks/${task.id}`, payload, {
                headers: { 
                    Authorization: `Bearer ${token}`
                }
            });
            setDetailTask(null);
            fetchTasks(token);
        } catch (err) {
            alert("Gagal mengubah status tugas");
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const token = await refreshToken();
        try {
            await axios.patch(`${API_URL}/users/${user.id}`, profileForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser({ ...user, name: profileForm.name, email: profileForm.email });
            setIsEditingProfile(false);
            alert("Profil berhasil diperbarui!");
        } catch (err) {
            alert(err.response?.data?.msg || "Gagal memperbarui profil");
        }
    };

    const handleLogout = async () => {
        try {
            await axios.delete(`${API_URL}/logout`, {
                withCredentials: true
            });
            localStorage.clear();
            window.location.href = '/';
        } catch (err) {
            console.log(err);
        }
    };

    // Grouping data untuk dropdown modal tambah tugas
    const allGrouped = tasks.reduce((acc, task) => {
        if (!acc[task.subject]) acc[task.subject] = [];
        acc[task.subject].push(task);
        return acc;
    }, {});
    const existingSubjects = Object.keys(allGrouped);


    const getRemainingDays = (deadline) => {
        if (!deadline) return "";
        // Memisahkan string YYYY-MM-DD dan membuat objek Date lokal
        // agar tidak dianggap sebagai UTC
        const [year, month, day] = deadline.split('-').map(Number);
        const target = new Date(year, month - 1, day); 
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = target - today;
        // Menggunakan Math.round untuk mendapatkan selisih hari yang presisi
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) return `${diffDays} Hari`;
        if (diffDays === 0) return "Hari Ini";
        return "Lewat";
    };

    const handleFileAction = (url) => {
        if (!url) return;
        window.open(url, '_blank');
    };

    // Helper untuk merender kolom tugas (In Progress / Completed)
    const renderTaskSection = (taskList, sectionTitle, openStates, setOpenStates, filters, setFilters) => {
        // Logika Filtering Multi-Keyword
        const filteredTasks = taskList.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(filters.search.toLowerCase()) || 
                                 (task.description && task.description.toLowerCase().includes(filters.search.toLowerCase()));
            const matchesDate = filters.date ? task.deadline === filters.date : true;
            const matchesSubject = filters.subject ? task.subject === filters.subject : true;
            return matchesSearch && matchesDate && matchesSubject;
        });

        const grouped = filteredTasks.reduce((acc, task) => {
            if (!acc[task.subject]) acc[task.subject] = [];
            acc[task.subject].push(task);
            return acc;
        }, {});

        const subjects = Object.keys(grouped);
        const toggleSubject = (subj) => setOpenStates(prev => ({ ...prev, [subj]: !prev[subj] }));

        return (
            <div className="task-section">
                <div className="section-header-container">
                    <h2 className="section-title">{sectionTitle} ({filteredTasks.length})</h2>
                    <div className="search-filter-controls">
                        <div className="search-box">
                            <input 
                                type="text" 
                                placeholder="Cari tugas..." 
                                value={filters.search}
                                onChange={(e) => setFilters({...filters, search: e.target.value})}
                            />
                        </div>
                        <div className="filter-dropdown-wrapper">
                            <button className="btn-filter-toggle">⚙️ Filter</button>
                            <div className="filter-menu">
                                <div className="filter-item">
                                    <label>📅 Filter Tanggal</label>
                                    <input type="date" value={filters.date} onChange={(e) => setFilters({...filters, date: e.target.value})} />
                                    {filters.date && <button type="button" className="btn-clear-filter" onClick={() => setFilters({...filters, date: ''})}>×</button>}
                                </div>
                                <div className="filter-item">
                                    <label>📚 Filter Matkul</label>
                                    <select value={filters.subject} onChange={(e) => setFilters({...filters, subject: e.target.value})}>
                                        <option value="">Semua Mata Kuliah</option>
                                        {existingSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    {filters.subject && <button type="button" className="btn-clear-filter" onClick={() => setFilters({...filters, subject: ''})}>×</button>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="task-grid-vertical">
                    {subjects.length === 0 ? <p className="empty-msg">Tidak ada tugas ditemukan.</p> : null}
                    {subjects.map(subj => (
                        <div key={subj} className="subject-group-card">
                            <div className="subject-header-clickable" 
                                 style={{ borderTop: `6px solid ${grouped[subj][0].color}` }}
                                 onClick={() => toggleSubject(subj)}>
                                <div className="subj-info">
                                    {/* Menghapus dot warna dari header mata kuliah */}
                                    <h3>{subj}</h3>
                                </div>
                                <span className={`arrow ${openStates[subj] ? 'up' : 'down'}`}>▼</span>
                            </div>
                            {openStates[subj] && (
                                <div className="task-dropdown-list">
                                    {grouped[subj].map(task => (
                                        <div key={task.id} className="task-item-row" onClick={() => setDetailTask(task)}>
                                            <div className="task-main-info">
                                                {/* Menambahkan dot warna prioritas di sini */}
                                                <span className="dot" style={{ backgroundColor: getPriorityColor(task.priority) }}></span>
                                                <div className="task-text-content"> {/* Wrapper untuk judul dan tanggal */}
                                                <span className="task-title-mini">{task.title}</span>
                                                <span className="task-date-mini">📅 {task.deadline}</span>
                                                </div>
                                            </div>
                                            <span className="task-days-mini">{getRemainingDays(task.deadline)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="dashboard-container">
            {/* NAVBAR */}
            <nav className="navbar">
                <div className="brand-section">
                    <img src={logo} alt="TaskMaster Logo" className="navbar-logo" />
                    <div className="brand-text">
                        <h1>TaskMaster</h1>
                        <p>Hai, {user.name}!</p>
                    </div>
                </div>
                <div className="nav-actions">
                    <button className="btn-add-task" onClick={() => setShowAddModal(true)}>Tambah tugas +</button>
                    <div className="profile-container" onClick={() => setShowProfileModal(true)}>
                        <div className="profile-circle">👤</div>
                        <span>Profil</span>
                    </div>
                </div>
            </nav>

            {/* PROGRESS BAR */}
            <div className="progress-section">
                <div className="progress-card">
                    <div className="progress-header">
                        <span>Progres Tugas {tasks.filter(t=>t.isCompleted).length}/{tasks.length}:</span>
                        <span>{tasks.length > 0 ? Math.round((tasks.filter(t=>t.isCompleted).length / tasks.length) * 100) : 0}%</span>
                    </div>
                    <div className="bar-outer">
                        <div className="bar-inner" style={{ width: `${tasks.length > 0 ? (tasks.filter(t=>t.isCompleted).length / tasks.length) * 100 : 0}%` }}></div>
                    </div>
                </div>
            </div>

            {/* DUAL COLUMN CONTENT */}
            <div className="dashboard-content-split">
                {renderTaskSection(tasks.filter(t => !t.isCompleted), "Sedang Dikerjakan", openInProgressSubjects, setOpenInProgressSubjects, filtersInProgress, setFiltersInProgress)}
                {renderTaskSection(tasks.filter(t => t.isCompleted), "Selesai", openCompletedSubjects, setOpenCompletedSubjects, filtersCompleted, setFiltersCompleted)}
            </div>

            {/* MODAL: DETAIL & EDIT */}
            {detailTask && (
                <div className="modal-overlay">
                    <div className="modal-box detail-box">
                        <button className="btn-close-x" onClick={() => {setDetailTask(null); setIsEditing(false);}}>×</button>
                        {!isEditing ? (
                            <>
                                <h3 style={{ color: detailTask.color }}>{detailTask.subject}</h3>
                                <div className="detail-body">
                                    <p><strong>Judul:</strong> {detailTask.title}</p>
                                    <p><strong>Deadline:</strong> {detailTask.deadline}</p>
                                    <p><strong>Prioritas:</strong> {detailTask.priority}</p>
                                    <p><strong>Deskripsi:</strong> {detailTask.description || 'Tidak ada deskripsi'}</p>
                                    <p><strong>Sisa Waktu:</strong> {getRemainingDays(detailTask.deadline)}</p>
                                    {detailTask.attachment && (
                                        <div className="attachment-section">
                                            <p><strong>Lampiran:</strong></p>
                                            <button className="btn-view-file" onClick={() => handleFileAction(detailTask.attachment)}>
                                                Buka Link Lampiran
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="detail-actions">
                                    {!detailTask.isCompleted && (
                                        <button 
                                            className="btn-complete-action" 
                                            onClick={() => toggleComplete(detailTask)}
                                        >
                                            Selesai
                                        </button>
                                    )}
                                    <button className="btn-edit-action" onClick={() => { setEditForm(detailTask); setIsEditing(true); }}>Edit</button>
                                    <button className="btn-delete-action" onClick={() => handleDelete(detailTask.id)}>Hapus</button>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleUpdate}>
                                <h3>Edit Tugas</h3>
                                <div className="input-group">
                                    <label>Judul</label>
                                    <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} required />
                                </div>
                                <div className="input-group">
                                    <label>Deskripsi</label>
                                    <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows="3"></textarea>
                                </div>
                                <div className="input-group">
                                    <label>Deadline</label>
                                    <input type="date" value={editForm.deadline} onChange={e => setEditForm({...editForm, deadline: e.target.value})} required />
                                </div>
                                <div className="input-group">
                                    <label>Prioritas</label>
                                    <select 
                                        value={editForm.priority} 
                                        onChange={e => setEditForm({...editForm, priority: e.target.value})}
                                    >
                                        <option value="Biasa">Biasa (Biru)</option>
                                        <option value="Penting">Penting (Kuning)</option>
                                        <option value="Utama">Utama (Merah)</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Link Lampiran (URL)</label>
                                    <input type="text" value={editForm.attachment} onChange={e => setEditForm({...editForm, attachment: e.target.value})} placeholder="Tempel link Google Drive/Gambar/PDF di sini" />
                                </div>
                                <div className="detail-actions">
                                    <button type="submit" className="btn-edit-action">Simpan</button>
                                    <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>Batal</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL: TAMBAH TUGAS */}
            {showAddModal && (
                <div className="modal-overlay">
                    <form className="modal-box" onSubmit={handleSave}>
                        <button type="button" className="btn-close-x" onClick={() => setShowAddModal(false)}>×</button>
                        <h3>Buat Tugas Baru</h3>
                        <div className="input-group">
                            <label>Mata Kuliah</label>
                            {!isNewSubject && existingSubjects.length > 0 ? (
                                <div className="subject-select-wrapper">
                                    <select 
                                        value={form.subject} 
                                        required 
                                        onChange={e => {
                                            const subj = e.target.value;
                                            const existingColor = allGrouped[subj]?.[0]?.color || '#3b82f6';
                                            setForm({...form, subject: subj, color: existingColor});
                                        }}
                                    >
                                        <option value="">Pilih Matkul</option>
                                        {existingSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <button type="button" className="btn-toggle-new" onClick={() => { setIsNewSubject(true); setForm({...form, subject: ''}) }}>+ Baru</button>
                                </div>
                            ) : (
                                <>
                                    <div className="subject-select-wrapper">
                                        <input type="text" placeholder="Matkul Baru" value={form.subject} required onChange={e => setForm({...form, subject: e.target.value})} />
                                        {existingSubjects.length > 0 && <button type="button" className="btn-toggle-new" onClick={() => setIsNewSubject(false)}>Batal</button>}
                                    </div>
                                    <div className="input-group" style={{ marginTop: '10px' }}>
                                        <label>Warna Card Mata Kuliah</label>
                                        <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="input-group">
                            <label>Judul Tugas</label>
                            <input type="text" value={form.title} required onChange={e => setForm({...form, title: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label>Deskripsi Tugas</label>
                            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Tambahkan detail tugas..."></textarea>
                        </div>
                        <div className="input-group">
                            <label>Deadline</label>
                            <input type="date" value={form.deadline} required onChange={e => setForm({...form, deadline: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label>Prioritas</label>
                            <select 
                                value={form.priority} 
                                onChange={e => setForm({...form, priority: e.target.value})}
                            >
                                <option value="Biasa">Biasa (Biru)</option>
                                <option value="Penting">Penting (Kuning)</option>
                                <option value="Utama">Utama (Merah)</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Link Lampiran (URL)</label>
                            <input type="text" value={form.attachment} onChange={e => setForm({...form, attachment: e.target.value})} placeholder="Tempel link Google Drive/Gambar/PDF di sini" />
                        </div>
                        <button type="submit" className="btn-submit-form">Simpan Tugas</button>
                    </form>
                </div>
            )}

            {/* MODAL: PROFILE */}
            {showProfileModal && (
                <div className="modal-overlay">
                    <div className="modal-box profile-box">
                        <button className="btn-close-x" onClick={() => { setShowProfileModal(false); setIsEditingProfile(false); }}>×</button>
                        <div className="avatar-large">👤</div>
                        {!isEditingProfile ? (
                            <>
                                <p><strong>Nama:</strong> {user.name}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                                <button className="btn-edit-action" style={{ width: '100%', marginTop: '20px' }} onClick={() => { setProfileForm({name: user.name, email: user.email}); setIsEditingProfile(true); }}>Edit Profil</button>
                                <button className="btn-logout" style={{ marginTop: '10px' }} onClick={handleLogout}>Logout</button>
                            </>
                        ) : (
                            <form onSubmit={handleUpdateProfile}>
                                <div className="input-group">
                                    <label style={{ textAlign: 'left' }}>Nama</label>
                                    <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} required />
                                </div>
                                <div className="input-group">
                                    <label style={{ textAlign: 'left' }}>Email</label>
                                    <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} required />
                                </div>
                                <div className="detail-actions">
                                    <button type="submit" className="btn-edit-action">Simpan</button>
                                    <button type="button" className="btn-cancel" onClick={() => setIsEditingProfile(false)}>Batal</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;