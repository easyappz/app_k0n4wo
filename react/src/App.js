import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout } from 'antd';
import ErrorBoundary from './ErrorBoundary';
import Register from './components/Register';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import './App.css';

const { Content } = Layout;

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout className="layout">
          <Content style={{ padding: '50px' }}>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </Content>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;