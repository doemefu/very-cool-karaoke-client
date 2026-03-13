import { useState } from 'react';
import { Input, List, Avatar, Empty } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';

const { Search } = Input;

// Mock song data
const mockSongs = [
  { id: '1', title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', thumbnail: '🎸' },
  { id: '2', title: 'Wonderwall', artist: 'Oasis', album: "(What's the Story) Morning Glory?", thumbnail: '🎵' },
  { id: '3', title: "Livin' on a Prayer", artist: 'Bon Jovi', album: 'Slippery When Wet', thumbnail: '🎤' },
  { id: '4', title: "Sweet Child O' Mine", artist: "Guns N' Roses", album: 'Appetite for Destruction', thumbnail: '🎸' },
  { id: '5', title: "Don't Stop Believin'", artist: 'Journey', album: 'Escape', thumbnail: '🎹' },
  { id: '6', title: 'Hotel California', artist: 'Eagles', album: 'Hotel California', thumbnail: '🦅' },
  { id: '7', title: 'Rocket Man', artist: 'Elton John', album: 'Honky Château', thumbnail: '🚀' },
  { id: '8', title: 'Eye of the Tiger', artist: 'Survivor', album: 'Eye of the Tiger', thumbnail: '🐯' },
];

interface SongSearchModalProps {
  onSelectSong: (song: any) => void;
}

export default function SongSearchModal({ onSelectSong }: SongSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      // Mock search - filter songs
      const results = mockSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(value.toLowerCase()) ||
          song.artist.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Search
          placeholder="Search by title or artist"
          size="large"
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
        />
      </div>

      {searchQuery && searchResults.length === 0 ? (
        <Empty description="No songs found" style={{ marginTop: 48 }} />
      ) : searchResults.length > 0 ? (
        <List
          dataSource={searchResults}
          style={{ maxHeight: 400, overflow: 'auto' }}
          renderItem={(item) => (
            <List.Item
              style={{
                cursor: 'pointer',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '16px 0',
              }}
              actions={[
                <PlusOutlined
                  key="add"
                  onClick={() => onSelectSong(item)}
                  style={{ fontSize: 18, color: '#FF2D7E', cursor: 'pointer' }}
                />,
              ]}
              onClick={() => onSelectSong(item)}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    size={48}
                    style={{
                      background: 'linear-gradient(135deg, #FF2D7E 0%, #C91F5E 100%)',
                      fontSize: 24,
                    }}
                  >
                    {item.thumbnail}
                  </Avatar>
                }
                title={<span style={{ color: '#FFFFFF', fontWeight: 500 }}>{item.title}</span>}
                description={
                  <div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{item.artist}</div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 12 }}>
                      {item.album}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty
          description="Search for songs to add to your queue"
          style={{ marginTop: 48 }}
        />
      )}
    </div>
  );
}
