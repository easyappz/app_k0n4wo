import React from 'react';
import { Card, List, Button, Typography } from 'antd';
import { useUser } from '../context/UserContext';
import { instance } from '../api/axios';

const { Title, Text } = Typography;

const UserDashboard = () => {
  const { user, points, photos, updatePoints, updatePhotos } = useUser();

  const togglePhotoStatus = async (photoId) => {
    try {
      await instance.post('/api/toggle-photo-status', { photoId });
      await updatePhotos();
      await updatePoints();
    } catch (error) {
      console.error('Error toggling photo status:', error);
    }
  };

  if (!user) {
    return <Title level={3}>Пожалуйста, войдите в систему</Title>;
  }

  return (
    <div>
      <Title level={2}>Личный кабинет</Title>
      <Card>
        <Text strong>Баллы: {points}</Text>
      </Card>
      <Title level={3}>Мои фотографваши фотографии</Title>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={photos}
        renderItem={(photo) => (
          <List.Item>
            <Card
              cover={<img alt="photo" src={photo.url} />}
              actions={[
                <Button
                  onClick={() => togglePhotoStatus(photo.id)}
                  disabled={!photo.isActive && points < 10}
}
                >
                  {photo.isActive ? 'Деактивировать' : 'Активировать'}
                </Button>
              ]}
            >
              <Card.Meta
                title={`Средняя оценка: ${photo.averageRating.toFixed(2)}`}
                description={`Всего оценок: ${photo.totalRatings}`}
              />
            </<Text>{photo.isActive ? 'Активна' : 'Неактивна'}</Text>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default UserDashboard;