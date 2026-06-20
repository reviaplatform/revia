import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { gsap } from "gsap"
import { TextPlugin } from "gsap/TextPlugin"
import { useGSAP } from "@gsap/react"
import { MorphingSpinner } from "./morphing-spinner"

if (typeof window !== "undefined") {
  gsap.registerPlugin(TextPlugin)
}

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export const AnimatedText = ({ text }: { text: React.ReactNode }): React.ReactNode => {
  if (text === null || text === undefined) return null;

  if (typeof text === 'string' || typeof text === 'number') {
    const textStr = String(text);
    if (textStr.trim() === '') return <span style={{ whiteSpace: 'pre' }}>{textStr}</span>;

    const isArabic = /[\u0600-\u06FF]/.test(textStr);
    const parts = isArabic ? textStr.split(/(\s+)/).filter(Boolean) : textStr.split('');
    const delayStep = isArabic ? 0.03 : 0.015;

    return (
      <span className="relative inline-flex overflow-hidden">
        <span className="inline-flex items-center">
          {parts.map((part, i) => (
            <span
              key={i}
              className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full"
              style={{ transitionDelay: `${i * delayStep}s`, whiteSpace: part.trim() === '' ? 'pre' : 'normal' }}
            >
              {part}
            </span>
          ))}
        </span>
        <span className="absolute inset-0 inline-flex items-center" aria-hidden="true">
          {parts.map((part, i) => (
            <span
              key={`clone-${i}`}
              className="inline-block translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-y-0"
              style={{ transitionDelay: `${i * delayStep}s`, whiteSpace: part.trim() === '' ? 'pre' : 'normal' }}
            >
              {part}
            </span>
          ))}
        </span>
      </span>
    );
  }

  // Process arrays or fragments
  const childrenArray = React.Children.toArray(text);
  if (childrenArray.length > 1) {
    return (
      <>
        {childrenArray.map((child, idx) => (
          <AnimatedText key={idx} text={child} />
        ))}
      </>
    );
  }

  // Drill into standard HTML text wrappers to animate their internal strings
  if (React.isValidElement(text) && typeof text.type === 'string') {
    const props = text.props as any;
    if (props && props.children && text.type !== 'svg' && text.type !== 'img' && text.type !== 'path') {
      return React.cloneElement(text, {
        ...props,
        children: <AnimatedText text={props.children} />
      });
    }
    return text;
  }

  return <>{text}</>;
};


interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
  loadingVariant?: "text" | "morph"
  animateChars?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, loadingText, loadingVariant = "text", animateChars = true, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button"
    const textRef = React.useRef<HTMLSpanElement>(null)
    const originalText = React.useRef<string>("")
    const internalRef = React.useRef<HTMLButtonElement>(null)
    const mergedRefs = React.useMemo(() => (node: HTMLButtonElement) => {
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
      internalRef.current = node
    }, [ref])

    // Store original text on mount
    React.useEffect(() => {
      if (!originalText.current && typeof props.children === "string") {
        originalText.current = props.children
      }
    }, [props.children])

    useGSAP(() => {
      if (!textRef.current || !loadingText || loadingVariant !== "text" || animateChars) return

      if (isLoading) {
        const tl = gsap.timeline()
        
        tl.to(textRef.current, {
          duration: 0.5,
          text: {
            value: loadingText,
            type: "diff"
          },
          ease: "sine.in"
        })
        .to(textRef.current, {
          duration: 0.6,
          text: {
            value: loadingText.replace(/\.*$/, ""),
            type: "diff"
          },
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        })
      } else if (originalText.current) {
        gsap.to(textRef.current, {
          duration: 0.3,
          text: {
            value: originalText.current,
            type: "diff"
          },
          ease: "power2.out"
        })
      }
    }, { dependencies: [isLoading, loadingText, loadingVariant], scope: textRef })

    return (
      <Comp
        ref={mergedRefs}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size, className }), "relative overflow-hidden", animateChars && "group")}
        {...props}
        disabled={isLoading || props.disabled}
      >
        {isLoading && loadingVariant === "morph" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
            <MorphingSpinner size={size === 'icon' ? 24 : 32} duration={1} />
          </div>
        ) : null}
        
        <span 
          ref={textRef} 
          className={cn(
            "flex items-center justify-center gap-2 transition-opacity",
            isLoading && loadingVariant === "morph" ? "opacity-0" : "opacity-100"
          )}
        >
          {animateChars ? <AnimatedText text={props.children} /> : props.children}
        </span>
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
