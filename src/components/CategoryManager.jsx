import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from './AuthProvider';

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchCategories = async () => {
      const q = query(collection(db, 'categories'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchCategories();
  }, [user]);

  return categories;
}

export default function CategoryManager() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, 'categories'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addDoc(collection(db, 'categories'), { name: name.trim(), userId: user.uid });
    setName('');
    fetchCategories();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'categories', id));
    fetchCategories();
  };

  if (!user) return null;

  return (
    <div className="category-manager">
      <h3>Categories</h3>
      <form onSubmit={handleAdd} className="category-form">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Add category" />
        <button type="submit">Add</button>
      </form>
      {loading ? <div>Loading...</div> : (
        <ul className="category-list">
          {categories.map(cat => (
            <li key={cat.id}>
              {cat.name}
              <button onClick={() => handleDelete(cat.id)} className="delete-category">Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 