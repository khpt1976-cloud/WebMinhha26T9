import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Users from './pages/Users';
import UsersPending from './pages/UsersPending';
import Roles from './pages/Roles';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout><Dashboard /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute permission="manage_users">
                  <Layout><Users /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/users/pending" element={
                <ProtectedRoute permission="manage_users">
                  <Layout><UsersPending /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/roles" element={
                <ProtectedRoute permission="manage_roles">
                  <Layout><Roles /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute permission="manage_products">
                  <Layout><Products /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/categories" element={
                <ProtectedRoute permission="manage_products">
                  <Layout><Categories /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/inventory" element={
                <ProtectedRoute permission="manage_products">
                  <Layout><Inventory /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings/*" element={
                <ProtectedRoute>
                  <Layout><Settings /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;