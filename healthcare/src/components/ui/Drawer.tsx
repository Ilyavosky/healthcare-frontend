"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function Drawer({ open, onOpenChange, title, description, children }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="drawer-overlay fixed inset-0 z-40 bg-[#0F1729]/50" />
        <Dialog.Content className="drawer-content fixed inset-y-0 right-0 z-50 flex w-full max-w-[450px] flex-col bg-surface shadow-2xl outline-none">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <Dialog.Title className="text-xl font-bold text-navy">{title}</Dialog.Title>
              <Dialog.Description className={description ? "text-[13px] text-muted" : "sr-only"}>
                {description ?? title}
                </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Cerrar"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-bg text-muted hover:text-navy"
            >
              <X size={18} />
            </Dialog.Close>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}