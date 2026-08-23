"use client";

import { motion } from "motion/react";
import { ArrowUpRight, Calendar, MapPin, Brain, Gamepad2, CircuitBoard, Clapperboard, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const upcomingEvent = {
  num: "01",
  title: "INNOVERSE 2.0",
  subtitle: "Inter-Departmental Fest",
  category: "Cultural & Technical",
  description:
    "A multi-event inter-departmental showdown — where ideas spark, creativity roars, and every department brings its A-game.",
  accent: "#fbbf24",
  date: "11th - 15th March 2026",
  venue: "Dept of ETE",
  subEvents: [
    { label: "Inspire (Ideathon)", Icon: Brain },
    { label: "BGMI", Icon: Gamepad2 },
    { label: "Hardware Escape Room", Icon: CircuitBoard },
    { label: "Reeluminati", Icon: Clapperboard },
    { label: "More", Icon: Plus },
  ],
};

export default function UpcomingEvents() {
  const { accent } = upcomingEvent;

 
}
