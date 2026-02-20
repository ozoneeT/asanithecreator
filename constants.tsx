
import { Testimonial, SectionContent } from './types';

export const BRAND_NAME = "Asani the_creator";

export const USER_IMAGE = "/IMG_5039.png";

export const VIDEO_FOOTAGE = [
  "https://images.unsplash.com/photo-1496337589254-7e19d01ced44?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524749292158-7540c2494485?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1000&auto=format&fit=crop",
];

import AboutImage from './AboutImage.webp';

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
    id: 'p1',
    name: 'ADELOVE25',
    role: 'Client',
    message: 'Asani! The wedding shoot came out absolutely stunning. We love them! I will definitely love to work with you again for our anniversary.',
    type: 'testimonial',
    time: '10:42 AM',
    isOutgoing: false
  },
  {
    id: 'p1-reply',
    name: 'Asani',
    role: 'Creator',
    message: 'Thank you so much! It was a beautiful ceremony to capture. Looking forward to the next one!',
    type: 'testimonial',
    time: '10:45 AM',
    isOutgoing: true
  },
  {
    id: 'p2',
    name: 'Favour',
    role: 'Client',
    message: 'The edits you did for my video are perfect! The transitions are so clean. I will love to work with you again on my next project.',
    type: 'testimonial',
    time: 'Yesterday',
    isOutgoing: false
  },
  {
    id: 'p2-reply',
    name: 'Asani',
    role: 'Creator',
    message: 'I\'m so glad to hear that Favour! Let\'s keep the momentum going.',
    type: 'testimonial',
    time: 'Yesterday',
    isOutgoing: true
  },
  {
    id: 'p3',
    name: 'Tobi',
    role: 'Client',
    message: 'Sis, the birthday photoshoot was a movie! Everyone is asking who shot them. I\'ll definitely love to work with you again next year.',
    type: 'testimonial',
    time: 'Yesterday',
    isOutgoing: false
  },
  {
    id: 'p3-reply',
    name: 'Asani',
    role: 'Creator',
    message: 'Let\'s gooo! It was a great vibe Tobi. We just getting started.',
    type: 'testimonial',
    time: 'Yesterday',
    isOutgoing: true
  },
  {
    id: 'p4',
    name: 'Analee Craftiee',
    role: 'Brand Owner',
    message: 'Asani, our brand video is doing very well on social media! Customers are coming in to buy everything we showed. I will absolutely love to work with you again.',
    type: 'testimonial',
    time: 'Monday',
    isOutgoing: false
  },
  {
    id: 'p4-reply',
    name: 'Asani',
    role: 'Creator',
    message: 'That is incredible news! Your products are beautiful, making them easy to sell visually. Let\'s plan the next drop.',
    type: 'testimonial',
    time: 'Monday',
    isOutgoing: true
  },
  {
    id: 'p5',
    name: 'Esther',
    role: 'Client',
    message: 'Omg Asani... our pre-wedding photoshoot video just hit 16k likes on TikTok! You are amazing. Will definitely love to work with you again.',
    type: 'testimonial',
    time: 'Sunday',
    isOutgoing: false
  },
  {
    id: 'p5-reply',
    name: 'Asani',
    role: 'Creator',
    message: 'Wow 16k?! That is huge Esther, congratulations! Let me know when you need me next.',
    type: 'testimonial',
    time: 'Sunday',
    isOutgoing: true
  },
  {
    id: 'p6',
    name: 'Caleb',
    role: 'Collaborator',
    message: 'The collaboration work we did together was top tier. The final cut is insane. I will definitely love to work with you again sis.',
    type: 'testimonial',
    time: 'Sunday',
    isOutgoing: false
  },
  {
    id: 'p6-reply',
    name: 'Asani',
    role: 'Creator',
    message: 'Appreciate it Caleb! The synergy was perfect. Let\'s do it again soon.',
    type: 'testimonial',
    time: 'Sunday',
    isOutgoing: true
  },
  {
    id: 'p7',
    name: 'Sarah',
    role: 'Client',
    message: 'Asani, thank you so much for the amazing travel reel. The pacing is incredibly captivating. I would love to work with you again when I\'m back in town!',
    type: 'testimonial',
    time: 'Last Week',
    isOutgoing: false
  },
  {
    id: 'p7-reply',
    name: 'Asani',
    role: 'Creator',
    message: 'Thank you Sarah! It was great showing you around the city. Safe travels!',
    type: 'testimonial',
    time: 'Last Week',
    isOutgoing: true
  },
  {
    id: 'p8',
    name: 'Michael',
    role: 'Client',
    message: 'The fitness promo video is getting so much traction. Really appreciate your eye for detail. Will definitely work with you again for the next launch.',
    type: 'testimonial',
    time: 'Last Month',
    isOutgoing: false
  },
  {
    id: 'p8-reply',
    name: 'Asani',
    role: 'Creator',
    message: 'Appreciate that Michael! Your work ethic made the footage look powerful. Let\'s keep the momentum going!',
    type: 'testimonial',
    time: 'Last Month',
    isOutgoing: true
  },
  {
    id: 'p9',
    name: 'Lumiere Studio',
    role: 'Production',
    message: 'Thank you for jumping in on such short notice. The BTS footage is perfect. Looking forward to working with you again!',
    type: 'testimonial',
    time: 'Last Month',
    isOutgoing: false
  },
  {
    id: 'p9-reply',
    name: 'Asani',
    role: 'Creator',
    message: 'Anytime! It was a great set to be on. Let me know when you need me next.',
    type: 'testimonial',
    time: 'Last Month',
    isOutgoing: true
  }
];

export const PORTFOLIO_VIDEOS = [
  "https://vimeo.com/reviews/62c16a46-08f6-4b14-ae48-0fcc17399c52/videos/1163715974",
  "https://vimeo.com/reviews/62c16a46-08f6-4b14-ae48-0fcc17399c52/videos/1163715968",
  "https://vimeo.com/reviews/62c16a46-08f6-4b14-ae48-0fcc17399c52/videos/1163715925",
  "https://vimeo.com/reviews/62c16a46-08f6-4b14-ae48-0fcc17399c52/videos/1163715942",
  "https://vimeo.com/reviews/62c16a46-08f6-4b14-ae48-0fcc17399c52/videos/1163715969",
  "https://vimeo.com/reviews/62c16a46-08f6-4b14-ae48-0fcc17399c52/videos/1163715981",
  "https://vimeo.com/reviews/62c16a46-08f6-4b14-ae48-0fcc17399c52/videos/1163715971",
  "https://vimeo.com/reviews/62c16a46-08f6-4b14-ae48-0fcc17399c52/videos/1163715972",
  "https://vimeo.com/reviews/62c16a46-08f6-4b14-ae48-0fcc17399c52/videos/1163715953",
  "https://vimeo.com/reviews/62c16a46-08f6-4b14-ae48-0fcc17399c52/videos/1163715941",
  "https://vimeo.com/reviews/62c16a46-08f6-4b14-ae48-0fcc17399c52/videos/1163715959",
  "https://vimeo.com/reviews/62c16a46-08f6-4b14-ae48-0fcc17399c52/videos/1163715939",
  "https://vimeo.com/reviews/62c16a46-08f6-4b14-ae48-0fcc17399c52/videos/1163715940",
  "https://vimeo.com/reviews/62c16a46-08f6-4b14-ae48-0fcc17399c52/videos/1163715958",
  "https://vimeo.com/reviews/62c16a46-08f6-4b14-ae48-0fcc17399c52/videos/1163715960",
  "https://vimeo.com/reviews/62c16a46-08f6-4b14-ae48-0fcc17399c52/videos/1163715973",
  "https://vimeo.com/reviews/62c16a46-08f6-4b14-ae48-0fcc17399c52/videos/1163715956",
  "https://vimeo.com/reviews/62c16a46-08f6-4b14-ae48-0fcc17399c52/videos/1163715935",
  "https://vimeo.com/reviews/62c16a46-08f6-4b14-ae48-0fcc17399c52/videos/1163715938",
  "https://vimeo.com/reviews/62c16a46-08f6-4b14-ae48-0fcc17399c52/videos/1163715957",
  "https://vimeo.com/reviews/62c16a46-08f6-4b14-ae48-0fcc17399c52/videos/1114452062"
];
