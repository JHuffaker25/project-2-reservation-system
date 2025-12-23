import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative flex flex-col justify-center w-full min-h-[350px] md:min-h-[450px] lg:min-h-[600px]">
        <img
          src="https://images.unsplash.com/photo-1455587734955-081b22074882?w=1920&h=00&fit=crop"
          alt="Hotel Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 py-12 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                Welcome To Hotel Company
              </h1>
              <p className="text-lg max-w-2xl mb-6">
                Discover comfort, style, and convenience. Book your next stay with us and experience hospitality redefined.
              </p>
              <Link to="/rooms">
                <Button size="lg" className="bg-force-light text-force-dark cursor-pointer hover:bg-force-light hover:text-force-dark">Book Now</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="py-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center justify-self-start">
            <img
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=120&h=120&fit=crop"
              alt="Luxury"
              className="w-36 h-36 rounded-full mb-4 object-cover"
            />
            <h3 className="text-xl font-semibold mb-2">Luxury & Comfort</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Relax in beautifully designed rooms with everything you need for a perfect stay.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <img
              src="https://images.unsplash.com/photo-1515734351777-a9d89b70bff3?w=120&h=120&fit=crop"
              alt="Convenience"
              className="w-36 h-36 rounded-full mb-4 object-cover"
            />
            <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Choose your dates and room with just a few clicks — hassle-free and fast.
            </p>
          </div>

          <div className="flex flex-col items-center justify-self-end">
            <img
              src="https://images.unsplash.com/photo-1715635845783-a184542d95e5?w=120&h=120&fit=crop"
              alt="Service"
              className="w-36 h-36 rounded-full mb-4 object-cover"
            />
            <h3 className="text-xl font-semibold mb-2">Friendly Service</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Our staff is here to make your stay memorable and enjoyable from check-in to check-out.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="py-12 px-4 md:px-6 lg:px-8 border-t">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Ready to book your stay?</h2>
            <p className="text-muted-foreground text-lg">Reserve your room now and enjoy exclusive benefits!</p>
          </div>
          <Link to="/rooms">
            <Button size="lg" className="font-semibold cursor-pointer">Book Now</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
