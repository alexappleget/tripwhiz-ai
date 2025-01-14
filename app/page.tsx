import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/Card/card";
import LoginButton from "@/components/LoginButton/LoginButton";
import { Compass, DollarSign, Palmtree } from "lucide-react";

const features = [
  {
    icon: <Compass />,
    title: "Personalized Itineraries",
    description:
      "AI-powered travel plans tailored to your preferences and budget.",
  },
  {
    icon: <DollarSign />,
    title: "Budget-Friendly Options",
    description: "Find the best deals that fit your financial plan.",
  },
  {
    icon: <Palmtree />,
    title: "Unique Experiences",
    description: "Discover hidden gems and off-the-beaten-path destinations.",
  },
];

export default function Home() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute z-0 min-w-full min-h-full object-cover"
      >
        <source src="/TravelBG.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="relative z-10 flex flex-col items-center justify-center h-full bg-black/50">
        <section className="relative z-10 py-16 px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Plan Your Dream Vacation?
          </h2>
          <p className="text-white mb-8">
            Sign up now and let AI plan your perfect getaway!
          </p>

          <LoginButton />
        </section>

        {/* Features Section */}
        <section className="relative z-10 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Why Choose TravelAI?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardHeader>
                    <span className="w-12 h-12 text-sky-500">
                      {feature.icon}
                    </span>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
