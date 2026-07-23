'use client';

import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

export default function FaqAccordion({ faqs = [] }) {
  if (!faqs || faqs.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
        <p className="text-muted-foreground">No FAQs available at the moment. Please contact us directly.</p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {faqs.map((faq, index) => (
        <AccordionItem
          key={faq.id || index}
          value={`faq-${index}`}
          className="rounded-2xl border border-border bg-card px-6 py-1 transition-all duration-300 hover:border-primary/40 hover:shadow-soft data-[state=open]:border-primary data-[state=open]:shadow-soft"
        >
          <AccordionTrigger className="font-display text-sm font-semibold text-foreground hover:no-underline md:text-base data-[state=open]:text-primary">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed text-muted-foreground/90 border-t border-border/50 pt-4 mt-2">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
