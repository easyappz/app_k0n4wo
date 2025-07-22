import React from 'react';
import { Form, Input, Button, Select, InputNumber, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { instance } from '../api/axios';

const { Option } = Select;

const Register = () => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      await instance.post('/api/register', values);
      message.success('Регистрация успешна!');
      form.resetFields();
    } catch (error) {
      message.error('Ошибка при регистрации. Попробуйте еще раз.');
    }
  };

  return (
    <Form
      form={form}
      name="register"
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
      <Form.Item
        name="email"
        rules={[{ required: true, type: 'email', message: 'Пожалуйста, введите корректный email!' }]}
      >
        <Input prefix={<MailOutlined />} placeholder="Email" />
      </Form.Item>
      <Form.Item
        name="gender"
        rules={[{ required: true, message: 'Пожалуйста, выберите пол!' }]}
      >
        <Select placeholder="Выберите пол">
          <Option value="male">Мужской</Option>
          <Option value="female">Женский</Option>
          <Option value="other">Другой</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="age"
        rules={[{ required: true, message: 'Пожалуйста, введите возраст!' }]}
      >
        <InputNumber min={1} max={120} placeholder="Возраст" style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" className="auth-form-button">
          Зарегистрироваться
        </Button>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </Form.Item>
    </Form>
  );
};

export default Register;