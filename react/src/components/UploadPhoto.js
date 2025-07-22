import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import instance from '../api/axios';

const UploadPhoto = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await instance.post('/api/upload-photo', { photoUrl: values.photoUrl });
      message.success('Фотография успешно загружена');
      form.resetFields();
    } catch (error) {
      message.error('Ошибка при загрузке фотографии');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Form.Item
        name="photoUrl"
        label="URL фотографии"
        rules={[{ required: true, message: 'Пожалуйста, введите URL фотографии' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Загрузить фотографию
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UploadPhoto;