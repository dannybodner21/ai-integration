import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const Testimonials = () => {
  const testimonials = [
    {
      company: "Nimbus Freight Systems",
      name: "Carlos Mendes",
      title: "Founder & CEO",
      quote: "Honestly, I was skeptical. We'd talked to a few 'AI consultants' before and it was all theory. But within a week they had a dispatcher bot live that actually worked. We didn't lay anyone off — we just stopped hiring for roles we didn't need anymore. The crazy part? Trucks are showing up on time more often now. It's like we got leaner and faster at the same time."
    },
    {
      company: "BrightPath Healthcare",
      name: "Dr. Emily Chen",
      title: "COO",
      quote: "Our intake process was a nightmare. Nurses hated the paperwork, patients hated the wait. They came in, mapped everything out, and built an AI system that now handles 70% of the forms automatically. The staff joke that it's like having an extra team member who never complains. We're finally running on time."
    },
    {
      company: "VoltEdge Fintech",
      name: "Marcus Riley",
      title: "Founder",
      quote: "We had a pitch deck and a dream — but no product. In two weeks they gave us a working MVP we could actually demo. That's what got investors excited. Without that sprint, I don't think we'd have raised our first round. It was the difference between being just another idea and being a real company."
    },
    {
      company: "Harvest & Co. (E-Commerce)",
      name: "Sarah Whitmore",
      title: "CEO",
      quote: "Customer support was crushing us. I was spending weekends answering emails. They built an AI rep that takes care of the repetitive stuff so my team can handle the real issues. We didn't just save money, we got our time back. Now we're scaling up orders without burning out."
    },
    {
      company: "Summit Legal Advisors",
      name: "Jonathan Alvarez",
      title: "Managing Partner",
      quote: "Lawyers aren't exactly early adopters, but I'll admit — this tool changed how we work. The AI doesn't replace attorneys, but it flags the stuff that usually eats up hours. My associates are billing more, clients are happier, and I get fewer 2AM calls about contract wording. That's worth every penny."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section id="testimonials" className="bg-gray-50 py-[50px] w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-12" 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }}
          variants={itemVariants}
        >
          <h2 className="text-3xl font-bold mb-4">
            Real Results from Real Clients
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Don't just take our word for it. Here's what actual clients say about working with us.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {testimonial.company}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {testimonial.name}, {testimonial.title}
                    </p>
                  </div>
                  
                  <blockquote className="text-gray-700 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
