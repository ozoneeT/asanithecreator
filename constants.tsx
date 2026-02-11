
import { Testimonial, SectionContent } from './types';

export const BRAND_NAME = "Asani the_creator";

export const USER_IMAGE = "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1974&auto=format&fit=crop";

export const VIDEO_FOOTAGE = [
  "https://images.unsplash.com/photo-1496337589254-7e19d01ced44?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524749292158-7540c2494485?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1000&auto=format&fit=crop",
];

import AboutImage from './AboutImage.PNG';

export const SECTIONS: SectionContent[] = [
  {
    id: "about-me",
    title: "Hi I'm Asani",
    subtitle: "The Creative Director of ASANI the Creator",
    description: "I'm a passionate mobile videographer and content creator, specializing in turning ideas into visually compelling stories using just a smartphone. From brand campaigns and product showcases to event coverage and storytelling videos, I focus on authenticity, creativity, and content that truly connects with audiences. I help clients plan concepts, shoot efficiently, and edit videos that shine across social media and digital platforms, crafting visuals that inspire, engage, and leave a lasting impression.",
    image: AboutImage,
    bgColor: "#0f0f0f"
  },
  {
    id: "content-creation",
    title: "Visual Storytelling",
    subtitle: "Beyond the Lens",
    description: "High-end cinematic production tailored for modern platforms. From concept to final edit, every frame is crafted to evoke emotion and drive engagement.",
    image: "https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=1964&auto=format&fit=crop",
    bgColor: "#1a1a1a"
  },
  {
    id: "brand-identity",
    title: "Brand Identity",
    subtitle: "Unique Signature",
    description: "Creating visual and narrative identities that resonate. We define your aesthetic, tone, and values to build a lasting legacy in the digital space.",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop",
    bgColor: "#111111"
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    role: 'CEO, Lux Media',
    message: 'Asani completely transformed our brand aesthetics. The growth has been exponential.',
    type: 'testimonial',
    time: '2m ago'
  },
  {
    id: '2',
    name: 'New Booking Request',
    role: 'Inquiry',
    message: 'A luxury fashion brand wants to collaborate for their Spring 2025 campaign.',
    type: 'booking',
    time: '5m ago'
  },
  {
    id: '3',
    name: 'Marcus Thorne',
    role: 'Creative Director',
    message: 'Working with Asani is seamless. The attention to detail is truly world-class.',
    type: 'testimonial',
    time: '15m ago'
  }
];
