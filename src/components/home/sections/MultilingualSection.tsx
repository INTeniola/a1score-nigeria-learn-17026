import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Languages } from "lucide-react";
const MultilingualSection = () => {
  return <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Speak Your Language, Learn Better
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">A1Score works in all major Nigerian languages so everyone can learn in the way that feels most natural.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[{
          name: "English",
          flag: "🇬🇧",
          speakers: "Official Language",
          color: "bg-blue-500"
        }, {
          name: "Yoruba",
          flag: "🟡",
          speakers: "Southwest Nigeria",
          color: "bg-yellow-500"
        }, {
          name: "Hausa",
          flag: "🟢",
          speakers: "Northern Nigeria",
          color: "bg-green-500"
        }, {
          name: "Igbo",
          flag: "🔴",
          speakers: "Southeast Nigeria",
          color: "bg-red-500"
        }, {
          name: "Pidgin",
          flag: "🌍",
          speakers: "All Over Nigeria",
          color: "bg-purple-500"
        }].map((language, index) => <Card key={index} className="hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer text-center">
              <CardHeader>
                <div className="text-6xl mb-4">{language.flag}</div>
                <CardTitle className="text-xl">{language.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">{language.speakers}</p>
                <Badge className="mt-3 bg-gray-100 text-gray-800">Available Now</Badge>
              </CardContent>
            </Card>)}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-8">
            <Languages className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h4 className="text-2xl font-bold text-gray-900 mb-4">We Understand Nigerian Culture</h4>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI knows Nigerian examples, understands our way of explaining things, and respects our cultural values in every language.
            </p>
          </div>
        </div>
      </div>
    </section>;
};
export default MultilingualSection;