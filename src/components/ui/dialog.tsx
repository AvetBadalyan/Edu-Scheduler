/**
 * Dialog — accessible modal with polished visual design.
 * Dark overlay, white card with subtle shadow, animated entry.
 */
import { cn } from '@/lib/utils'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import * as React from 'react'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

const DialogContent = React.forwardRef<
	React.ComponentRef<typeof DialogPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
		title: string
	}
>(({ className, children, title, ...props }, ref) => (
	<DialogPrimitive.Portal>
		{/* Backdrop */}
		<DialogPrimitive.Overlay
			className={cn(
				'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
				'data-[state=open]:animate-in data-[state=open]:fade-in-0',
				'data-[state=closed]:animate-out data-[state=closed]:fade-out-0'
			)}
		/>

		{/* Panel */}
		<DialogPrimitive.Content
			ref={ref}
			className={cn(
				// Positioning
				'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
				// Sizing
				'w-[calc(100vw-2rem)] max-w-lg max-h-[90vh] overflow-y-auto',
				// Appearance
				'rounded-2xl bg-white shadow-2xl shadow-black/20 border border-gray-100',
				// Animation
				'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-4',
				'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
				'focus:outline-none',
				className
			)}
			{...props}
		>
			{/* Gradient top accent */}
			<div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600" />

			{/* Content */}
			<div className="p-6">
				<DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
				{children}
			</div>

			{/* Close button */}
			<DialogPrimitive.Close
				className={cn(
					'absolute right-4 top-4 rounded-lg p-1.5',
					'text-gray-400 transition-all',
					'hover:bg-gray-100 hover:text-gray-700',
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
				)}
				aria-label="Close dialog"
			>
				<X className="size-4" />
			</DialogPrimitive.Close>
		</DialogPrimitive.Content>
	</DialogPrimitive.Portal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

export { Dialog, DialogClose, DialogContent, DialogTrigger }
