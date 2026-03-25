import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActivityFeed, addKudos, addComment, getUserAchievements } from '../services/api';
import { formatDistance, formatPace } from '../utils/units';

function ActivityFeed() {
  const [feed, setFeed] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    loadFeed();
    loadAchievements();
  }, []);

  const loadFeed = async () => {
    try {
      const { data } = await getActivityFeed();
      setFeed(data);
    } catch (err) {
      console.error('Failed to load feed:', err);
    }
  };

  const loadAchievements = async () => {
    try {
      const { data } = await getUserAchievements();
      setAchievements(data);
    } catch (err) {
      console.error('Failed to load achievements:', err);
    }
  };

  const handleKudos = async (runId) => {
    try {
      const { data } = await addKudos(runId);
      setFeed(feed.map(run => run._id === runId ? data : run));
    } catch (err) {
      console.error('Failed to add kudos:', err);
    }
  };

  const handleComment = async (runId) => {
    const text = commentText[runId];
    if (!text || !text.trim()) return;

    try {
      const { data } = await addComment(runId, text);
      setFeed(feed.map(run => run._id === runId ? data : run));
      setCommentText({ ...commentText, [runId]: '' });
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getUserId = () => localStorage.getItem('userId');

  return (
    <div className="container jimbo-container">
      <h2>Activity Feed</h2>

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <div className="achievements-section">
          <h3>🏆 Your Achievements</h3>
          <div className="achievements-grid">
            {achievements.slice(0, 6).map((achievement, idx) => (
              <div key={idx} className="achievement-badge">
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-name">{achievement.name}</div>
                <div className="achievement-date">
                  {new Date(achievement.earnedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
          {achievements.length > 6 && (
            <button className="btn-secondary" onClick={() => navigate('/achievements')}>
              View All {achievements.length} Achievements
            </button>
          )}
        </div>
      )}

      {/* Activity Feed */}
      <div className="feed">
        {feed.length === 0 ? (
          <div className="empty-feed">
            <p>No activities yet. Start running or follow other users!</p>
            <button onClick={() => navigate('/run-tracker')} className="btn-jimbo-primary">
              🏃 START RUN
            </button>
          </div>
        ) : (
          feed.map(run => {
            const currentUserId = getUserId();
            const hasKudos = run.kudos?.some(k => k.userId._id === currentUserId);
            
            return (
              <div key={run._id} className="feed-item">
                <div className="feed-header">
                  <div className="feed-user">
                    <div className="user-avatar">
                      {run.userId?.name?.[0] || run.userId?.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="user-name">{run.userId?.name || run.userId?.email || 'Unknown'}</div>
                      <div className="feed-date">
                        {new Date(run.date).toLocaleDateString()} at {new Date(run.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                  {run.routeName && <div className="route-badge">{run.routeName}</div>}
                </div>

                <div className="feed-stats">
                  <div className="feed-stat">
                    <span className="stat-value">{formatDistance(run.distance)}</span>
                    <span className="stat-label">Distance</span>
                  </div>
                  <div className="feed-stat">
                    <span className="stat-value">{formatTime(run.duration)}</span>
                    <span className="stat-label">Time</span>
                  </div>
                  <div className="feed-stat">
                    <span className="stat-value">{formatPace(run.pace)}</span>
                    <span className="stat-label">Pace</span>
                  </div>
                  {run.elevationGain > 0 && (
                    <div className="feed-stat">
                      <span className="stat-value">{run.elevationGain.toFixed(0)}m</span>
                      <span className="stat-label">Elevation</span>
                    </div>
                  )}
                </div>

                {run.notes && (
                  <div className="feed-notes">{run.notes}</div>
                )}

                <div className="feed-actions">
                  <button 
                    className={`kudos-btn ${hasKudos ? 'active' : ''}`}
                    onClick={() => handleKudos(run._id)}
                  >
                    👏 {run.kudos?.length || 0}
                  </button>
                  <button 
                    className="comment-btn"
                    onClick={() => setShowComments({ ...showComments, [run._id]: !showComments[run._id] })}
                  >
                    💬 {run.comments?.length || 0}
                  </button>
                  <button 
                    className="view-btn"
                    onClick={() => navigate(`/run/${run._id}`)}
                  >
                    View Details
                  </button>
                </div>

                {showComments[run._id] && (
                  <div className="comments-section">
                    {run.comments?.map((comment, idx) => (
                      <div key={idx} className="comment">
                        <strong>{comment.userId.name || comment.userId.email}:</strong> {comment.text}
                        <span className="comment-date">
                          {new Date(comment.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    <div className="comment-input">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentText[run._id] || ''}
                        onChange={(e) => setCommentText({ ...commentText, [run._id]: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && handleComment(run._id)}
                      />
                      <button onClick={() => handleComment(run._id)}>Post</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ActivityFeed;
