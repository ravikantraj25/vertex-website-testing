import Image from "next/image";
import Navbar from "./components/Navbar";
import ChipScroll from "./components/ChipScroll";
import InnoVerseBanner from "./components/sections/InnoVerseBanner";
import AboutVertex from "./components/sections/AboutVertex";
import Domains from "./components/sections/Domains";
import Journey from "./components/journey";
import UpcomingEvents from './components/sections/UpcomingEvents'
import About from "./components/sections/About";
import Clubs from './components/sections/Clubs'
import Members from './components/sections/Members';
import  Contact from './components/sections/Contact'

export default function Home() {
  return (
    <div>
   <Navbar/>
   <ChipScroll/>
   <InnoVerseBanner/>
   <AboutVertex/>
   <Domains/>
   <Journey/>
   <Members/>
   <Contact/>
  
    </div>
  );
}
