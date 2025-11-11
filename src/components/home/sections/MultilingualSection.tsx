import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Languages } from "lucide-react";
const MultilingualSection = () => {
  return <section className="py-8 md:py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-3 md:px-4">
        <div className="text-center mb-6 md:mb-10 lg:mb-12 space-y-2">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
            Speak Your Language, Learn Better
          </h3>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">A1Score works in all major Nigerian languages so everyone can learn in the way that feels most natural.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4 lg:gap-6">
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
              <CardHeader className="p-3 md:p-4 lg:p-6">
                <div className="text-4xl md:text-5xl lg:text-6xl mb-2 md:mb-3">{language.flag}</div>
                <CardTitle className="text-sm md:text-base lg:text-lg">{language.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 lg:p-6 pt-0">
                <p className="text-gray-600 text-xs md:text-sm mb-2 leading-relaxed">{language.speakers}</p>
                <Badge className="bg-gray-100 text-gray-800 text-xs">Available Now</Badge>
              </CardContent>
            </Card>)}
        </div>

        <div className="mt-8 md:mt-12 text-center">
          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 md:p-6 lg:p-8">
            <Languages className="h-12 w-12 md:h-14 md:w-14 text-green-600 mx-auto mb-3 md:mb-4" />
            <h4 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2 md:mb-3 leading-tight">We Understand Nigerian Culture</h4>
            <p className="text-gray-600 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
              Our AI knows Nigerian examples, understands our way of explaining things, and respects our cultural values in every language.
            </p>
          </div>
        </div>
      </div>
    </section>;
};
export default MultilingualSection;