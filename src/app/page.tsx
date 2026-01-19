import Image from "next/image";
import Navbar from "./components/sections/Navbar";
import Hero from "./components/sections/Hero";
import UpcomingEvents from './components/sections/upcoming'
import About from "./components/sections/About";
import Clubs from './components/sections/Clubs'
import Members from './components/sections/Members';
import  Contact from './components/sections/Contact'
export default function Home() {
  return (
    <div>
   <Navbar/>
   <Hero/>
   <UpcomingEvents/>
   <About/>
   <Clubs/>
   <Members/>
   <Contact/>
    </div>
  );
}
