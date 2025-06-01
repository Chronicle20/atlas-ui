"use client"

import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function ScrollToTopButton() {
  const [isFormScrollable, setIsFormScrollable] = useState(false);

  useEffect(() => {
    // Function to check if the form or its container has scrollbars
    const checkIfFormHasScrollbars = () => {
      // Find the form element
      const form = document.querySelector('form');

      if (!form) {
        setIsFormScrollable(false);
        return;
      }

      // Helper function to check if an element has visible scrollbars
      const hasVisibleScrollbar = (element) => {
        const style = window.getComputedStyle(element);
        const overflow = style.getPropertyValue('overflow');
        const overflowY = style.getPropertyValue('overflow-y');

        // Check if overflow is set to auto or scroll
        const hasScrollableStyle = 
          overflow === 'auto' || 
          overflow === 'scroll' || 
          overflowY === 'auto' || 
          overflowY === 'scroll';

        // Check if content exceeds container
        const hasOverflow = element.scrollHeight > element.clientHeight;

        // Element has a visible scrollbar if both conditions are met
        return hasScrollableStyle && hasOverflow;
      };

      // Check if the form itself has scrollbars
      if (hasVisibleScrollbar(form)) {
        setIsFormScrollable(true);
        return;
      }

      // Check if any parent container has scrollbars (up to 3 levels)
      let parent = form.parentElement;
      let level = 0;

      while (parent && level < 3) {
        if (hasVisibleScrollbar(parent)) {
          setIsFormScrollable(true);
          return;
        }
        parent = parent.parentElement;
        level++;
      }

      // Check if the window itself has a scrollbar
      const docElement = document.documentElement;
      const windowHasScrollbar = 
        (docElement.scrollHeight > docElement.clientHeight) && 
        (window.innerWidth > document.documentElement.clientWidth);

      setIsFormScrollable(windowHasScrollbar);
    };

    // Check on mount and on window resize
    checkIfFormHasScrollbars();
    window.addEventListener('resize', checkIfFormHasScrollbars);

    // Set up a MutationObserver to detect changes in the form's content
    const form = document.querySelector('form');
    if (form) {
      const observer = new MutationObserver(() => {
        // Delay the check slightly to allow the DOM to update
        setTimeout(checkIfFormHasScrollbars, 100);
      });

      // Observe changes to the form's children and their attributes
      observer.observe(form, { 
        childList: true, 
        subtree: true, 
        attributes: true,
        characterData: true 
      });

      // Cleanup
      return () => {
        window.removeEventListener('resize', checkIfFormHasScrollbars);
        observer.disconnect();
      };
    } else {
      // Cleanup if no form was found
      return () => {
        window.removeEventListener('resize', checkIfFormHasScrollbars);
      };
    }
  }, []);

  const scrollToTop = () => {
    // Find the form element
    const form = document.querySelector('form');

    if (form) {
      // Scroll to the top of the form
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // Fallback to scrolling to the top of the page
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

  // Only render if the form is scrollable
  if (!isFormScrollable) return null;

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-20 right-8 rounded-full shadow-xl z-50"
      variant="outline"
      type="button"
    >
      <ArrowUp className="h-8 w-8" />
    </Button>
  );
}
