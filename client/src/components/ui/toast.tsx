import { Toast as ToastPrimitive } from "@base-ui/react/toast";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const toast = ToastPrimitive.createToastManager();

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />;
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed inset-x-4 top-4 z-50 mx-auto w-auto max-w-sm outline-none",
        className,
      )}
      {...props}
    />
  );
}

// One toast visible at a time (see limit={1} on <Toaster>) — queued ones sit
// hidden via data-limited rather than stacking, so this skips the registry's
// multi-toast stack/swipe transform math entirely.
function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "pointer-events-auto w-full rounded-base border-[3px] border-ink bg-panel shadow-[3px_3px_0_var(--color-ink)] outline-none transition-opacity duration-200",
        "data-starting-style:opacity-0",
        "data-ending-style:opacity-0",
        "data-limited:pointer-events-none data-limited:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn("flex items-center gap-2 px-3 py-2.5", className)}
      {...props}
    />
  );
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("font-vt text-[16px] text-navy", className)}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("font-vt text-[14px] text-text-muted", className)}
      {...props}
    />
  );
}

function ToastClose({
  className,
  children,
  render = (
    <Button
      variant="ghost"
      fontSize={12}
      minHeight={36}
      className="h-7 w-7 border-0 bg-transparent p-0 shadow-none!"
    />
  ),
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      render={render}
      className={cn("relative shrink-0 text-text-faint hover:opacity-70", className)}
      {...props}
    >
      {children ?? "×"}
    </ToastPrimitive.Close>
  );
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem}>
      <ToastContent>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastClose />
      </ToastContent>
    </Toast>
  ));
}

function Toaster({
  children,
  toastManager = toast,
  limit = 1,
  ...props
}: ToastPrimitive.Provider.Props) {
  return (
    <ToastProvider toastManager={toastManager} limit={limit} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}

export { Toaster, toast };
