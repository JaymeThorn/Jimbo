import { useState } from 'react';
import { searchUsers, followUser } from '../services/api';

function FindPeople() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [following, setFollowing] = useState({});

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    try {
      const { data } = await searchUsers(query);
      setResults(data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const { data } = await followUser(userId);
      setFollowing({ ...following, [userId]: data.following });
    } catch (err) {
      console.error('Follow failed:', err);
    }
  };

  return (
    <div className="container jimbo-container">
      <h2>Find People</h2>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} className="btn-jimbo-primary">
          Search
        </button>
      </div>

      <div className="search-results">
        {results.length === 0 && query && (
          <p className="no-results">No users found</p>
        )}
        
        {results.map(user => (
          <div key={user._id} className="user-result">
            <div className="user-avatar">
              {user.name?.[0] || user.email[0].toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{user.name || user.email}</div>
              <div className="user-email">{user.email}</div>
            </div>
            <button 
              onClick={() => handleFollow(user._id)}
              className={following[user._id] ? 'btn-following' : 'btn-follow'}
            >
              {following[user._id] ? 'Following' : 'Follow'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FindPeople;
