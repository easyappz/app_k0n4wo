import React, { useState, useEffect } from 'react';
import { Table, message } from 'antd';
import instance from '../api/axios';

const Statistics = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserPhotos();
  }, []);

  const fetchUserPhotos = async () => {
    setLoading(true);
    try {
      const response = await instance.get('/api/user-photos');
      setPhotos(response.data);
    } catch (error) {
      message.error('Ошибка при загрузке статистики');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Фотография',
      dataIndex: 'url',
      key: 'url',
      render: (url) => <img src={url} alt="photo" style={{ width: 100 }} />,
    },
    {
      title: 'Средняя оценка',
      dataIndex: 'averageRating',
      key: 'averageRating',
      sorter: (a, b) => a.averageRating - b.averageRating,
    },
    {
      title: 'Всего оценок',
      dataIndex: 'totalRatings',
      key: 'totalRatings',
      sorter: (a, b) => a.totalRatings - b.totalRatings,
    },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => isActive ? 'Активна' : 'Неактивна',
    },
  ];

  return (
    <Table
      dataSource={photos}
      columns={columns}
      rowKey="id"
      loading={loading}
    />
  );
};

export default Statistics;