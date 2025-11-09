import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const StayUpdated = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    preferences: {
      productUpdates: true,
      newFeatures: true,
      blogPosts: false,
      communityNews: false
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('newsletter_signups')
        .insert({
          email: formData.email,
          name: formData.name || null,
          update_preferences: formData.preferences
        });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Successfully subscribed to updates!");
    } catch (error: any) {
      toast.error(error.message || "Failed to subscribe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-12 pb-8">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">You're all set!</h2>
            <p className="text-muted-foreground mb-8">
              Thank you for subscribing! You'll receive updates based on your preferences.
            </p>
            <Button onClick={() => navigate('/')} size="lg">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </button>

        <Card className="w-full">
          <CardHeader className="text-center space-y-4">
            <div 
              className="flex justify-center cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate('/')}
            >
              <img 
                src="/lovable-uploads/cd2e80a3-ae02-4d77-b4b6-84f985045e4e.png" 
                alt="A1Score Logo" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <CardTitle className="text-3xl font-bold">Stay Updated</CardTitle>
            <p className="text-muted-foreground">
              Get the latest news, features, and updates from A1Score
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name (optional)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <Label>What would you like to receive?</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="productUpdates"
                    checked={formData.preferences.productUpdates}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, productUpdates: !!checked }
                      })
                    }
                  />
                  <label
                    htmlFor="productUpdates"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Product Updates
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="newFeatures"
                    checked={formData.preferences.newFeatures}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, newFeatures: !!checked }
                      })
                    }
                  />
                  <label
                    htmlFor="newFeatures"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    New Features Announcements
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="blogPosts"
                    checked={formData.preferences.blogPosts}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, blogPosts: !!checked }
                      })
                    }
                  />
                  <label
                    htmlFor="blogPosts"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Blog Posts & Articles
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="communityNews"
                    checked={formData.preferences.communityNews}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, communityNews: !!checked }
                      })
                    }
                  />
                  <label
                    htmlFor="communityNews"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Community News & Events
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Subscribing..." : "Subscribe to Updates"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StayUpdated;
