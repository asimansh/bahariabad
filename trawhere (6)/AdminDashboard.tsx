import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Database,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { motion } from 'motion/react';

interface Location {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  price: string;
  category: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  bio: string;
  avatar: string;
  isPublic: number;
}

export const AdminDashboard: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'locations' | 'users'>('locations');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Location>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [locRes, userRes] = await Promise.all([
        fetch('/api/locations'),
        fetch('/api/users')
      ]);
      const locData = await locRes.json();
      const userData = await userRes.json();
      setLocations(locData);
      setUsers(userData);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (loc: Location) => {
    setIsEditing(loc.id);
    setEditForm(loc);
  };

  const handleSave = async () => {
    if (!isEditing) return;
    try {
      const res = await fetch(`/api/locations/${isEditing}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setIsEditing(null);
        fetchData();
      }
    } catch (error) {
      console.error("Error saving location:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;
    try {
      const res = await fetch(`/api/locations/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  };

  const handleAdd = async () => {
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setIsAdding(false);
        setEditForm({});
        fetchData();
      }
    } catch (error) {
      console.error("Error adding location:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <ShieldCheck className="text-primary" size={32} />
            Admin Dashboard
          </h2>
          <p className="text-slate-500">Manage your application data and users</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveSubTab('locations')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'locations' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Locations
          </button>
          <button 
            onClick={() => setActiveSubTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'users' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Users
          </button>
        </div>
      </div>

      {activeSubTab === 'locations' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search locations..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
            <button 
              onClick={() => { setIsAdding(true); setEditForm({}); }}
              className="bg-primary text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all"
            >
              <Plus size={18} />
              Add Location
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-bottom border-slate-200">
                  <th className="px-6 py-4 text-sm font-bold text-slate-700">Location</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-700">Category</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-700">Price</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-700">Rating</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isAdding && (
                  <tr className="bg-primary/5">
                    <td className="px-6 py-4">
                      <input 
                        className="w-full p-2 border rounded-lg" 
                        placeholder="Name" 
                        value={editForm.name || ''} 
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        className="w-full p-2 border rounded-lg" 
                        placeholder="Category" 
                        value={editForm.category || ''} 
                        onChange={e => setEditForm({...editForm, category: e.target.value})}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        className="w-full p-2 border rounded-lg" 
                        placeholder="Price" 
                        value={editForm.price || ''} 
                        onChange={e => setEditForm({...editForm, price: e.target.value})}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        className="w-full p-2 border rounded-lg" 
                        placeholder="Rating" 
                        value={editForm.rating || ''} 
                        onChange={e => setEditForm({...editForm, rating: parseFloat(e.target.value)})}
                      />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={handleAdd} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Save size={18} /></button>
                      <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><X size={18} /></button>
                    </td>
                  </tr>
                )}
                {locations.map(loc => (
                  <tr key={loc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      {isEditing === loc.id ? (
                        <input 
                          className="w-full p-2 border rounded-lg" 
                          value={editForm.name || ''} 
                          onChange={e => setEditForm({...editForm, name: e.target.value})}
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <img src={loc.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <div className="font-bold text-slate-900">{loc.name}</div>
                            <div className="text-xs text-slate-500 truncate max-w-[200px]">{loc.description}</div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing === loc.id ? (
                        <input 
                          className="w-full p-2 border rounded-lg" 
                          value={editForm.category || ''} 
                          onChange={e => setEditForm({...editForm, category: e.target.value})}
                        />
                      ) : (
                        <span className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-600">{loc.category}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing === loc.id ? (
                        <input 
                          className="w-full p-2 border rounded-lg" 
                          value={editForm.price || ''} 
                          onChange={e => setEditForm({...editForm, price: e.target.value})}
                        />
                      ) : (
                        <span className="text-sm font-bold text-slate-700">{loc.price}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing === loc.id ? (
                        <input 
                          type="number"
                          className="w-full p-2 border rounded-lg" 
                          value={editForm.rating || ''} 
                          onChange={e => setEditForm({...editForm, rating: parseFloat(e.target.value)})}
                        />
                      ) : (
                        <div className="flex items-center gap-1 text-amber-500">
                          <span className="text-sm font-bold">{loc.rating}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {isEditing === loc.id ? (
                        <>
                          <button onClick={handleSave} className="p-2 text-primary hover:bg-primary/5 rounded-lg"><Save size={18} /></button>
                          <button onClick={() => setIsEditing(null)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><X size={18} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(loc)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"><Edit2 size={18} /></button>
                          <button onClick={() => handleDelete(loc.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-bottom border-slate-200">
                <th className="px-6 py-4 text-sm font-bold text-slate-700">User</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Email</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Role</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.bio}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${user.isPublic ? 'text-green-600' : 'text-slate-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${user.isPublic ? 'bg-green-600' : 'bg-slate-400'}`} />
                      {user.isPublic ? 'Public' : 'Private'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
