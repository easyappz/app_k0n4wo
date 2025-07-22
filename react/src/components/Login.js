import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { instance } from '../api/axios';

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await instance.post('/api/login', values);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      message.success('Вход выполнен успешно!');
      navigate('/');
    } catch (error) {
      message.error('Ошибка при входе. Проверьте ваши учетные данные.');
    }
  };

  return (
    <Form
      form={form}
      name="login"
      onFinish={onFinish}
      className="auth-form"
    >
      <Form.Item
        name="username"
        rules={[{ required: true, message: 'Пожалуйста, введите имя пользователя!' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Имя пользователя" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Пожалуйста, введите пароль!' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
      </Form.Item>
      <Form.Item>
        <Link to="/reset-password" className="auth-form-forgot">
          Забыли пароль?
        </Link>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" className="auth-form-button">
          Войти
        </Button>
        Или <Link to="/register">зарегистрироваться!</Link>
      </Form.Item>
    </Form>
  );
};

export default Login;