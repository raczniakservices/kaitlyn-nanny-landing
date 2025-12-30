"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-xl text-sm font-semibold",
    "transition-colors transition-shadow motion-reduce:transition-none",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent))]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg))]",
    "disabled:pointer-events-none disabled:opacity-60"
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-[hsl(var(--accent-deep))] via-[hsl(var(--accent))] to-[hsl(var(--accent-deep))] bg-size-200 bg-pos-0 text-white shadow-2xl hover:bg-pos-100 hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)]",
        dark: "bg-[hsl(var(--text))] text-white shadow-soft hover:opacity-95",
        outline: "border border-[hsl(var(--border))] bg-white/70 text-[hsl(var(--text))] shadow-sm hover:bg-white/90",
        ghost: "bg-transparent text-[hsl(var(--text))] hover:bg-white/70"
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-4",
        lg: "h-12 px-6",
        xl: "h-14 px-8 text-base"
      }
    },
    defaultVariants: {
      variant: "outline",
      size: "md"
    }
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, ...props },
  ref
) {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});

Button.displayName = "Button";


