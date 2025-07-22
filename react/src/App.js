import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import ErrorBoundary from './ErrorBoundary';
import Register from './components/Register';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import UploadPhoto from './components/UploadPhoto';
import RatePhoto from './components/RatePhoto';
import Statistics from './components/Statistics';
import './App.css';

const { Header, Content, Footer } = Layout;

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout className="layout">
          <Header>
            <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
              <Menu.Item key="1"><Link to="/">Главная</Link></Menu.Item>
              <Menu.Item key="2"><Link to="/upload">Загрузить фото</Link></Menu.Item>
              <Menu.Item key="3"><Link to="/rate">Оценить фото</Link></Menu.Item>
              <Menu.Item key="4"><Link to="/statistics">Статистика</Link></Menu.Item>
              <Menu.Item key="5"><Link to="/login">Вход</Link></Menu.Item>
              <Menu.Item key="6"><Link to="/register">Регистрация</Link></Menu.Item>
            </Menu>
          </Header>
          <Content style={{ padding: '50px' }}>
            <Routes>
              <Route path="/" element={<h1>Добро пожаловать в приложение для оценки фотографий</h1>} />
              <Route path="/upload" element={<UploadPhoto />} />
              <Route path="/rate" element={<RatePhoto />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Photo Rating App ©2023</Footer>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;