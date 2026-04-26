"use client";

import HeroSection from "@/app/components/hero";
import { features } from "@/data/feature";
import { howItWorks } from "@/data/howItWorks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { testimonial } from "@/data/testimonial";
import { faqs } from "@/data/faqs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 bg-background overflow-hidden relative">
      {/* Grid Background */}
      <div className="grid-background" />

      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-5xl w-full text-center space-y-8 z-10">
        <HeroSection />

        {/* Features Section */}
        <section className="w-full py-8 md:py-12 lg:py-16 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center mb-8">
              Powerful Features for Your Career Growth
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border-2 border-primary/10 hover:border-white transition-all duration-300 bg-background/50 backdrop-blur-sm relative z-20 group"
                >
                  <CardHeader>
                    <div className="flex flex-col items-center text-center space-y-4">
                      {feature.icon}
                      <CardTitle className="text-xl font-bold group-hover:text-white transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-muted-foreground group-hover:text-white/80 transition-colors duration-300">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* statistics */}
        <section className="w-full py-8 md:py-12 mt-8 md:mt-12 relative z-10 border-y border-primary/10 bg-background/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="flex flex-col items-center justify-center space-y-2">
                <h3 className="text-2xl md:text-3xl font-bold">50+</h3>
                <p className="text-muted-foreground text-sm">
                  Industries Covered
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2">
                <h3 className="text-2xl md:text-3xl font-bold">1000+</h3>
                <p className="text-muted-foreground text-sm">
                  Interview Questions
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2">
                <h3 className="text-2xl md:text-3xl font-bold">95%</h3>
                <p className="text-muted-foreground text-sm">Success Rate</p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2">
                <h3 className="text-2xl md:text-3xl font-bold">24/7</h3>
                <p className="text-muted-foreground text-sm">AI Support</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-12 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold tracking-tighter mb-4">
                How It Works
              </h2>
              <p className="text-muted-foreground">
                Four simple steps to achieve your career goals
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((feature, index) => {
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center space-y-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonial section */}
        <section className="w-full py-8 md:py-12 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center mb-8">
              What Our Users Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonial.map((testimonial, index) => {
                return (
                  <Card
                    key={index}
                    className="bg-background border-primary/10 hover:border-primary/30 transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative h-12 w-12 flex-shrink-0">
                            <Image
                              width={40}
                              height={40}
                              src={testimonial.image}
                              alt={testimonial.author}
                              className="rounded-full object-cover border-2 border-primary/30"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {testimonial.author}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {testimonial.role}
                            </p>
                            <p className="text-xs text-primary">
                              {testimonial.company}
                            </p>
                          </div>
                        </div>
                        <blockquote className="text-sm text-muted-foreground italic relative">
                          <span className="ml-2">&quot;</span>
                          {testimonial.quote}
                          <span>&quot;</span>
                        </blockquote>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="w-full pt-12 md:pt-24 pb-0 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold tracking-tighter mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Find answers to common questions about our platform.
              </p>
            </div>
            <div className="max-w-6xl mx-auto">
              <Accordion type="single" collapsible>
                {faqs.map((faq, index) => {
                  return (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Accelerate */}
        <section className="w-full pb-12 md:pb-24 pt-4 md:pt-8 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto py-8 px-4 bg-muted/50 rounded-3xl border border-primary/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              <div className="text-center max-w-3xl mx-auto relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-6">
                  Ready to Accelerate Your Career?
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Join thousands of professionals who have transformed their
                  careers with Sage AI. Sign up today and take the first step
                  towards achieving your goals.
                </p>
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="h-12 px-8 text-base font-semibold animate-bounce"
                  >
                    Start Your Journey Today{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
