import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const buttonVariants = cva(
	// Base: slightly rounder, proper font weight, smooth hover, focus ring
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 shrink-0 cursor-pointer select-none ' +
		'disabled:pointer-events-none disabled:opacity-40 ' +
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
		"[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				// Primary — indigo gradient, lifts on hover
				default:
					'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 ' +
					'hover:from-indigo-700 hover:to-violet-700 hover:-translate-y-px hover:shadow-lg hover:shadow-indigo-500/30 ' +
					'active:translate-y-0',
				// Destructive — red
				destructive:
					'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/20 ' +
					'hover:from-red-700 hover:to-rose-700 hover:-translate-y-px hover:shadow-lg',
				// Outline — clean border, subtle hover fill
				outline:
					'border border-gray-200 bg-white text-gray-700 shadow-sm ' +
					'hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 hover:-translate-y-px',
				// Secondary — soft indigo tint
				secondary:
					'bg-indigo-50 text-indigo-700 border border-indigo-100 ' +
					'hover:bg-indigo-100 hover:border-indigo-200',
				// Ghost — no background
				ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
				// Link
				link: 'text-indigo-700 underline-offset-4 hover:underline p-0 h-auto shadow-none'
			},
			size: {
				default: 'h-10 px-5 py-2',
				sm: 'h-8 rounded-lg px-3.5 text-xs',
				lg: 'h-12 rounded-xl px-7 text-base',
				icon: 'h-10 w-10'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	}
)

export interface ButtonProps
	extends
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button'
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		)
	}
)
Button.displayName = 'Button'

export { Button, buttonVariants }
