import React, { useState } from 'react';
import { Upload, message, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { instance } from '../api/axios';
import { useUser } from '../context/UserContext';

const UploadPhoto = () => {
  const [fileList, setFileList] = useState([]);
  const { points, updatePoints, updatePhotos } = useUser();

  const handleUpload = async () => {
    if (points < 100) {
      message.error('Недостаточно баллов для загрузки фото. Требуется 100 баллов.');
      return;
    }

    const formData = new FormData();
    fileList.forEach(file => {
      formData.append('photos', file);
    });

    try {
      await instance.post('/api/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('Фото успешно загружено');
      setFileList([]);
      updatePoints();
      updatePhotos();
    } catch (error) {
      message.error('Ошибка при загрузке фото');
    }
  };

  const props = {
    onRemove: file => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: file => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  return (
    <div>
      <h2>Загрузка фото</h2>
      <p>Доступные баллы: {points}</p>
      <Upload {...props}>
        <Button icon={<UploadOutlined />}>Выбрать фото</Button>
      </Upload>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0 || points < 100}
        style={{ marginTop: 16 }}
      >
        Загрузить
      </Button>
    </div>
  );
};

export default UploadPhoto;