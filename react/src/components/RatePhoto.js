import React, { useState, useEffect } from 'react';
import { Card, Rate, Button, message } from 'antd';
import { instance } from '../api/axios';
import { useUser } from '../context/UserContext';

const RatePhoto = () => {
  const [photo, setPhoto] = useState(null);
  const [rating, setRating] = useState(0);
  const { updatePoints } = useUser();

  const fetchPhoto = async () => {
    try {
      const response = await instance.get('/api/photos-for-rating');
      setPhoto(response.data[0]);
    } catch (error) {
      message.error('Ошибка при получении фото для��узке фото для оценки');
    }
  };

  useEffect(() => {
    fetchPhoto();
  }, []);

  const handleRate = async () => {
    if (rating === 0) {
      message.warning('Пожалуйста, выберите оценку');
      return;
    }

    try {
      await instance.post('/api/rate-photo', {
        photoId: photo._id,
        rating: rating
      });
      message.success('Фото успешно оценено');
      setRating(0);
      fetchPhoto();
      updatePoints();
    } catch (error) {
      message.error('Ошибка при оценке фото');
    }
  };

  if (!photo) {
    return <div>Загрузка фото...</div>;
  }

  return (
    <div>
      <h2>Оценка фото</h2>
      <Card
        cover={<img alt="photo" src={photo.url} />}
        actions={[
          <Rate allowHalf value={rating} onChange={setRating} />,
          <Button onClick={handleRate}>Оценить</Button>
        ]}
      >
        <Card.Meta description={`Возраст: ${photo.age}, Пол: ${photo.gender}`} />
      </Card>
    </div>
  );
};

export default RatePhoto;