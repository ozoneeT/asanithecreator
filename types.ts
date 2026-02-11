
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  message: string;
  type: 'testimonial' | 'booking';
  time: string;
}

export interface SectionContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  bgColor: string;
}
