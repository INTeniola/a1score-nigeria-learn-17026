// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Users, MessageCircle, MapPin, School, BookOpen, Search, Plus, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CommunityCard from "./CommunityCard";
import CommunityDetail from "./CommunityDetail";

interface Community {
  id: string;
  name: string;
  type: 'school' | 'zone' | 'subject';
  member_count: number;
  post_count: number;
  description: string;
  location?: string;
  school?: string;
  subject?: string;
  created_at: string;
  isJoined: boolean;
}

const StudentCommunity = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);

  useEffect(() => {
    checkUser();
    fetchCommunities();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchCommunities = async () => {
    try {
      // Fetch all communities
      const { data: communitiesData, error: communitiesError } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });

      if (communitiesError) throw communitiesError;

      // Fetch user's joined communities
      const { data: membershipData, error: membershipError } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', user?.id);

      if (membershipError) throw membershipError;

      const joinedCommunityIds = new Set(membershipData?.map(m => m.community_id) || []);

      const communitiesWithMembership = communitiesData?.map(community => ({
        ...community,
        isJoined: joinedCommunityIds.has(community.id)
      })) || [];

      setCommunities(communitiesWithMembership);
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast.error('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  // Sample communities data for demo (remove this when real data is available)
  const sampleCommunities: Community[] = [
    {
      id: "1",
      name: "University of Lagos Students",
      type: "school" as const,
      member_count: 2847,
      post_count: 156,
      description: "Connect with fellow UNILAG students across all faculties",
      school: "University of Lagos",
      location: "Lagos State",
      created_at: new Date().toISOString(),
      isJoined: true
    },
    {
      id: "2", 
      name: "Lagos Zone Study Group",
      type: "zone" as const,
      member_count: 5643,
      post_count: 423,
      description: "Students from all schools in Lagos State sharing resources",
      location: "Lagos State",
      created_at: new Date().toISOString(),
      isJoined: false
    },
    {
      id: "3",
      name: "Mathematics Excellence",
      type: "subject" as const,
      member_count: 1892,
      post_count: 287,
      description: "Advanced mathematics discussions and problem solving",
      subject: "Mathematics",
      created_at: new Date().toISOString(),
      isJoined: true
    },
    {
      id: "4",
      name: "Ahmadu Bello University",
      type: "school" as const, 
      member_count: 3156,
      post_count: 201,
      description: "ABU community for academic collaboration",
      school: "Ahmadu Bello University",
      location: "Kaduna State",
      created_at: new Date().toISOString(),
      isJoined: false
    },
    {
      id: "5",
      name: "Northern Zone Sciences",
      type: "zone" as const,
      member_count: 2134,
      post_count: 178,
      description: "Science students from northern states",
      location: "Northern States",
      created_at: new Date().toISOString(),
      isJoined: false
    },
    {
      id: "6",
      name: "Physics Study Circle",
      type: "subject" as const,
      member_count: 967,
      post_count: 143,
      description: "Physics concepts, experiments, and discussions",
      subject: "Physics",
      created_at: new Date().toISOString(),
      isJoined: true
    }
  ];

  // Use sample data if no real communities are loaded yet
  const displayCommunities = communities.length > 0 ? communities : sampleCommunities;

  const filteredCommunities = displayCommunities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || community.type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleJoinCommunity = async (communityId: string) => {
    try {
      const community = displayCommunities.find(c => c.id === communityId);
      if (!community) return;

      if (community.isJoined) {
        // Leave community
        const { error } = await supabase
          .from('community_members')
          .delete()
          .eq('community_id', communityId)
          .eq('user_id', user?.id);

        if (error) throw error;
        toast.success('Left community successfully');
      } else {
        // Join community
        const { error } = await supabase
          .from('community_members')
          .insert({
            community_id: communityId,
            user_id: user?.id,
            role: 'member'
          });

        if (error) throw error;
        toast.success('Joined community successfully');
      }

      // Update local state
      const updatedCommunities = displayCommunities.map(c =>
        c.id === communityId ? { ...c, isJoined: !c.isJoined } : c
      );
      setCommunities(updatedCommunities);
    } catch (error) {
      console.error('Error toggling community membership:', error);
      toast.error('Failed to update membership');
    }
  };

  const handleViewCommunity = (community: Community) => {
    setSelectedCommunity(community);
  };

  const handleBackToCommunities = () => {
    setSelectedCommunity(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading communities...</div>;
  }

  if (selectedCommunity) {
    return (
      <CommunityDetail
        community={selectedCommunity}
        onBack={handleBackToCommunities}
        onJoin={toggleJoinCommunity}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">A1Connect</h2>
          <p className="text-muted-foreground">Connect with students from your school, zone, and subjects</p>
          <div className="flex items-center gap-2 mt-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600">All communities are moderated for safety</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Community
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search communities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="school">Schools</TabsTrigger>
            <TabsTrigger value="zone">Zones</TabsTrigger>
            <TabsTrigger value="subject">Subjects</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* My Communities */}
      <div>
        <h3 className="text-lg font-semibold mb-4">My Communities</h3>
        {filteredCommunities.filter(c => c.isJoined).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.filter(c => c.isJoined).map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                onViewCommunity={handleViewCommunity}
                onJoinCommunity={toggleJoinCommunity}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">You haven't joined any communities yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Browse communities below to get started!</p>
          </Card>
        )}
      </div>

      {/* Discover Communities */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Discover Communities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.filter(c => !c.isJoined).map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              onViewCommunity={handleViewCommunity}
              onJoinCommunity={toggleJoinCommunity}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentCommunity;
