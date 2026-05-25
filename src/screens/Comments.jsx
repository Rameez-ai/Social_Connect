import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import {
  Header,
  CustomButton,
} from '../components';
import { colors, SPACING, FONT_SIZES } from '../utils/colors';
import { formatDate } from '../utils/helpers';

const Comments = ({ navigation }) => {
  const route = useRoute();
  const { postId } = route.params;
  const [comments, setComments] = useState([
    {
      id: '1',
      author: 'David Chen',
      avatar: 'https://via.placeholder.com/40',
      text: 'The typography choices are spot on. That Plus Jakarta Sans really gives it a premium feel.',
      timestamp: '45m ago',
      likes: 12,
    },
    {
      id: '2',
      author: 'Elena Rodriguez',
      avatar: 'https://via.placeholder.com/40',
      text: 'Totally agree, David. The spacing rhythm is much better now too.',
      timestamp: '30m ago',
      likes: 3,
    },
    {
      id: '3',
      author: 'Marcus Thorne',
      avatar: 'https://via.placeholder.com/40',
      text: 'Will these tokens be available for the mobile app as well? We need that consistency across platforms.',
      timestamp: '1h ago',
      likes: 8,
    },
    {
      id: '4',
      author: 'Sophie Lane',
      avatar: 'https://via.placeholder.com/40',
      text: 'Great work! The accessibility score must be through the roof with these contrast ratios.',
      timestamp: '2h ago',
      likes: 21,
    },
  ]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        author: 'Current User',
        avatar: 'https://via.placeholder.com/40',
        text: newComment,
        timestamp: 'just now',
        likes: 0,
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.authorName}>{item.author}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
        <TouchableOpacity style={styles.likeButton}>
          <Text style={styles.likeText}>❤️ {item.likes}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity>
        <Text style={styles.moreButton}>⋮</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title={`${comments.length} Comments`}
        onBackPress={() => navigation.goBack()}
      />

      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.commentsList}
      />

      {/* Comment Input */}
      <View style={styles.inputContainer}>
        <Image
          source={{ uri: 'https://via.placeholder.com/36' }}
          style={styles.inputAvatar}
        />
        <TextInput
          style={styles.textInput}
          placeholder="Write a comment..."
          placeholderTextColor={colors.textTertiary}
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={280}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleAddComment}
          disabled={!newComment.trim()}
        >
          <Text style={styles.sendIcon}>▶️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  commentsList: {
    paddingVertical: SPACING.md,
  },
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.md,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  authorName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: colors.text,
    marginRight: SPACING.md,
  },
  timestamp: {
    fontSize: FONT_SIZES.sm,
    color: colors.textTertiary,
  },
  commentText: {
    fontSize: FONT_SIZES.md,
    color: colors.text,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  likeButton: {
    alignSelf: 'flex-start',
  },
  likeText: {
    fontSize: FONT_SIZES.sm,
    color: colors.textSecondary,
  },
  moreButton: {
    fontSize: FONT_SIZES.lg,
    color: colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  inputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: SPACING.md,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.lightGrey,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  sendIcon: {
    fontSize: 18,
  },
});

export default Comments;
