import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';
import './CategoryManager.css';

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
  const navigate = useNavigate();
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
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

  useEffect(() => { 
    fetchCategories(); 
  }, [user]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim() || !user) return;
    
    try {
      await addDoc(collection(db, 'categories'), { 
        name: newCategory.trim(), 
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      setNewCategory('');
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory || !user) return;
    
    try {
      const categoryToDelete = categories.find(cat => cat.name === selectedCategory);
      if (categoryToDelete) {
        await deleteDoc(doc(db, 'categories', categoryToDelete.id));
        setSelectedCategory('');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleCategorySelect = async (categoryName) => {
    setSelectedCategory(categoryName);
    
    if (!categoryName) {
      navigate('/');
      return;
    }

    // Fetch items for the selected category
    try {
      const tasks = await getDocs(query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid),
        where('category', '==', categoryName)
      ));

      const notes = await getDocs(query(
        collection(db, 'notes'),
        where('userId', '==', user.uid),
        where('category', '==', categoryName)
      ));

      const journals = await getDocs(query(
        collection(db, 'journals'),
        where('userId', '==', user.uid),
        where('category', '==', categoryName)
      ));

      // Navigate to home with the category filter
      navigate('/?category=' + encodeURIComponent(categoryName));
    } catch (error) {
      console.error('Error fetching category items:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="category-manager">
      {/* New Category Input */}
      <div className="category-section" >
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name"
          className="category-input"
        />
        <button 
          onClick={handleAddCategory}
          className="category-btn add-btn"
          disabled={!newCategory.trim()}
        >
          Add Category
        </button>
      </div>

      {/* Category Selection and Deletion */}
      <div className="category-section">
        <select
          value={selectedCategory}
          onChange={(e) => handleCategorySelect(e.target.value)}
          className="category-select"
        >
          <option value="">Select a category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
        <button 
          onClick={handleDeleteCategory}
          className="category-btn delete-btn"
          disabled={!selectedCategory}
        >
          Delete Category
        </button>
      </div>


      {loading && <div className="category-loading">Loading...</div>}
    </div>
  );
} 