import React, { useState, useEffect } from 'react';
import { Card, Rate, Button, Select, InputNumber, message } from 'antd';
import instance from '../api/axios';

const { Option } = Select;

const RatePhoto = () => {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState('');
  const [minAge, setMinAge] = useState(null);
  const [maxAge, setMaxAge] = useState(null);

  const fetchPhoto = async () => {
    setLoading(true);
    try {
      const response = await instance.get('/api/photos-for-rating', {
        params: { gender, minAge, maxAge }
      });
      setPhoto(response.data[0]);
    } catch (error) {
      message.error('Ошибка при загрузке фотографии');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhoto();
  }, []);

  const handleRate = async (value) => {
    try {
      await instance.post('/api/rate-photo', { photoId: photo._id, rating: value });
      message.success('Оценка сохранена');
      fetchPhoto();
    } catch (error) {
      message.error('Ошибка при сохранении оценки');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 120, marginRight: 8 }}
          placeholder="Пол"
          onChange={setGender}
        >
          <Option value="male">Мужской</Option>
          <Option value="female">Женский</Option>
          <Option value="other">Другой</Option>
        </Select>
        <InputNumber
          style={{ marginRight: 8 }}
          placeholder="Мин. возраст"
          onChange={setMinAge}
        />
        <InputNumber
          style={{ marginRight: 8 }}
          placeholder="Макс. возраст"
          onChange={setMaxAge}
        />
        <Button onClick={fetchPhoto}>Применить фильтры</Button>
      </div>
      {photo ? (
        <Card
          cover={<img alt="photo" src={photo.url} />}
          actions={[<Rate onChange={handleRate} />]}
        >
          <Card.Meta title={`Возраст: ${photo.age}`} description={`Пол: ${photo.gender}`} />
        </Card>
      ) : (
        <p>Нет доступных фотографий для оценки</p>
      )}
    </div>
  );
};

export default RatePhoto;