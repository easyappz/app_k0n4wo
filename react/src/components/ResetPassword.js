import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { instance } from '../api/axios';

const ResetPassword = () => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      await instance.post('/api/reset-password-request', values);
      message.success('Инструкции по сбросу пароля отправлены на ваш email.');
      form.resetFields();
    } catch (error) {
      message.error('Ошибка при отправке запроса на сброс пароля. Попробуйте еще раз.');
    }
  };

  return (
    <Form
      form={form}
      name="reset-password"
      onFinish={onFinish}
      className="auth-form"
    >
      <Form.Item
        name="email"
        rules={[{ required: true, type: 'email', message: 'Пожалуйста, введите корректный email!' }]}
      >
        <Input prefix={<MailOutlined />} placeholder="Email" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" className="auth-form-button">
          Сбросить пароль
        </Button>
      </Form.Item>
      <Form.Item>
        <Link to="/login">Вернуться к входу</Link>
      </Form.Item>
    </Form>
  );
};

export default ResetPassword;