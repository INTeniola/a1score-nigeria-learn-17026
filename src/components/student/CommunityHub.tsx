// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { 
  Users, MessageSquare, Plus, Search, Filter, 
  BookOpen, School, MapPin, Calendar, TrendingUp,
  FileText, Link as LinkIcon, Image as ImageIcon
} from 'lucide-react';

interface Community {
  id: string;
  name: string;
  description: string;
  type: 'school' | 'subject' | 'zone';
  school?: string;
  location?: string;
  subject?: string;
  member_count: number;
  post_count: number;
  created_by: string;
  created_at: string;
  banner_url?: string;
  rules?: string;
}

interface CommunityPost {
  id: string;
  community_id: string;
  user_id: string;
  type: 'text' | 'file' | 'link' | 'image';
  title?: string;
  content: string;
  file_url?: string;
  file_name?: string;
  upvotes: number;
  downvotes: number;
  reply_count: number;
  created_at: string;
  profiles?: {
    display_name: string;
    avatar_url?: string;
  };
}

const CommunityHub = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  // New community form
  const [newCommunity, setNewCommunity] = useState<{
    name: string;
    description: string;
    type: 'school' | 'subject' | 'zone';
    school: string;
    location: string;
    subject: string;
    rules: string;
  }>({
    name: '',
    description: '',
    type: 'school',
    school: '',
    location: '',
    subject: '',
    rules: ''
  });

  // New post form
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    type: 'text' as const
  });

  useEffect(() => {
    loadCommunities();
  }, []);

  useEffect(() => {
    if (selectedCommunity) {
      loadCommunityPosts(selectedCommunity.id);
    }
  }, [selectedCommunity]);

  const loadCommunities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommunities(data || []);
    } catch (error) {
      console.error('Error loading communities:', error);
      toast({
        title: "Error",
        description: "Failed to load communities",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCommunityPosts = async (communityId: string) => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get profiles separately
      const userIds = data?.map(post => post.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      // Merge posts with profiles
      const postsWithProfiles = data?.map(post => ({
        ...post,
        profiles: profiles?.find(p => p.user_id === post.user_id)
      })) || [];

      setPosts(postsWithProfiles as CommunityPost[]);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: "Error",
        description: "Failed to load community posts",
        variant: "destructive"
      });
    }
  };

  const createCommunity = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a community",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('communities')
        .insert({
          ...newCommunity,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Join the community as creator
      await supabase
        .from('community_members')
        .insert({
          community_id: data.id,
          user_id: user.id,
          role: 'admin'
        });

      setCommunities([data, ...communities]);
      setIsCreateDialogOpen(false);
      setNewCommunity({
        name: '',
        description: '',
        type: 'school',
        school: '',
        location: '',
        subject: '',
        rules: ''
      });

      toast({
        title: "Success",
        description: "Community created successfully!"
      });
    } catch (error) {
      console.error('Error creating community:', error);
      toast({
        title: "Error",
        description: "Failed to create community",
        variant: "destructive"
      });
    }
  };

  const joinCommunity = async (communityId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to join communities",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Joined community successfully!"
      });
    } catch (error) {
      console.error('Error joining community:', error);
      toast({
        title: "Error",
        description: "Failed to join community",
        variant: "destructive"
      });
    }
  };

  const createPost = async () => {
    if (!user || !selectedCommunity) return;

    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          community_id: selectedCommunity.id,
          user_id: user.id,
          ...newPost
        })
        .select()
        .single();

      if (error) throw error;

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .single();

      const postWithProfile = {
        ...data,
        profiles: profile
      };

      setPosts([postWithProfile as CommunityPost, ...posts]);
      setIsPostDialogOpen(false);
      setNewPost({
        title: '',
        content: '',
        type: 'text'
      });

      toast({
        title: "Success",
        description: "Post created successfully!"
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    }
  };

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || community.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getCommunityIcon = (type: string) => {
    switch (type) {
      case 'school': return School;
      case 'subject': return BookOpen;
      case 'zone': return MapPin;
      default: return Users;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'school': return 'bg-blue-100 text-blue-800';
      case 'subject': return 'bg-green-100 text-green-800';
      case 'zone': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (selectedCommunity) {
    return (
      <div className="space-y-6">
        {/* Community Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => setSelectedCommunity(null)}>
                  ← Back to Communities
                </Button>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {(() => {
                      const Icon = getCommunityIcon(selectedCommunity.type);
                      return <Icon className="h-6 w-6" />;
                    })()}
                    {selectedCommunity.name}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">{selectedCommunity.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getTypeColor(selectedCommunity.type)}>
                  {selectedCommunity.type.replace('_', ' ')}
                </Badge>
                <div className="text-sm text-gray-600">
                  {selectedCommunity.member_count} members
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Posts Section */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Community Posts</h2>
          <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={newPost.type} onValueChange={(value: any) => setNewPost({ ...newPost, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Post type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Text Post
                      </div>
                    </SelectItem>
                    <SelectItem value="link">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        Link Post
                      </div>
                    </SelectItem>
                    <SelectItem value="image">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Image Post
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="Post title (optional)"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
                
                <Textarea
                  placeholder="What's on your mind?"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={4}
                />
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsPostDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createPost} disabled={!newPost.content}>
                    Create Post
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {post.profiles?.display_name?.[0] || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{post.profiles?.display_name || 'Unknown User'}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {post.type}
                      </Badge>
                    </div>
                    
                    {post.title && (
                      <h4 className="font-semibold mb-2">{post.title}</h4>
                    )}
                    
                    <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                    
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>{post.upvotes} upvotes</span>
                      <span>{post.reply_count} replies</span>
                      <Button variant="ghost" size="sm">Reply</Button>
                      <Button variant="ghost" size="sm">Share</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {posts.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500">Be the first to start a discussion in this community!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Study Communities</h1>
          <p className="text-gray-600">Connect with fellow students and educators</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Community
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Community</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Community name"
                value={newCommunity.name}
                onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
              />
              
              <Textarea
                placeholder="Description"
                value={newCommunity.description}
                onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                rows={3}
              />
              
              <Select value={newCommunity.type} onValueChange={(value: any) => setNewCommunity({ ...newCommunity, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Community type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="school">School Community</SelectItem>
                  <SelectItem value="subject">Subject Community</SelectItem>
                  <SelectItem value="zone">Zone Community</SelectItem>
                </SelectContent>
              </Select>
              
              {newCommunity.type === 'school' && (
                <Input
                  placeholder="School name"
                  value={newCommunity.school}
                  onChange={(e) => setNewCommunity({ ...newCommunity, school: e.target.value })}
                />
              )}
              
              {newCommunity.type === 'subject' && (
                <Input
                  placeholder="Subject"
                  value={newCommunity.subject}
                  onChange={(e) => setNewCommunity({ ...newCommunity, subject: e.target.value })}
                />
              )}
              
              {newCommunity.type === 'zone' && (
                <Input
                  placeholder="Location"
                  value={newCommunity.location}
                  onChange={(e) => setNewCommunity({ ...newCommunity, location: e.target.value })}
                />
              )}
              
              <Textarea
                placeholder="Community rules (optional)"
                value={newCommunity.rules}
                onChange={(e) => setNewCommunity({ ...newCommunity, rules: e.target.value })}
                rows={3}
              />
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createCommunity} disabled={!newCommunity.name || !newCommunity.description}>
                  Create Community
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Communities</SelectItem>
                <SelectItem value="school">School Communities</SelectItem>
                <SelectItem value="subject">Subject Communities</SelectItem>
                <SelectItem value="zone">Zone Communities</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Communities Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCommunities.map((community) => {
          const Icon = getCommunityIcon(community.type);
          
          return (
            <Card key={community.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{community.name}</h3>
                      <Badge className={getTypeColor(community.type)}>
                        {community.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{community.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {community.member_count} members
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {community.post_count} posts
                  </div>
                </div>
                
                {community.school && (
                  <p className="text-sm text-gray-500 mb-2">📍 {community.school}</p>
                )}
                
                {community.subject && (
                  <p className="text-sm text-gray-500 mb-2">📚 {community.subject}</p>
                )}
                
                {community.location && (
                  <p className="text-sm text-gray-500 mb-2">🌍 {community.location}</p>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => joinCommunity(community.id)}
                  >
                    Join
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedCommunity(community)}
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {filteredCommunities.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No communities found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Be the first to create a community!'
              }
            </p>
            {!searchQuery && filterType === 'all' && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create First Community
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommunityHub;