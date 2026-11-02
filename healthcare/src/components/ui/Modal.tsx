"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  header?: React.ReactNode;
  children: React.ReactNode;
};

export function Modal({ open, onOpenChange, title, description, header, children }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="drawer-overlay fixed inset-0 z-40 bg-navy/50" />
        <Dialog.Content className="modal-content fixed inset-x-8 top-8 z-50 mx-auto flex max-h-[calc(100vh-64px)] max-w-[1376px] flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl outline-none">
          <div className="relative px-7 pb-2 pt-6">
            <Dialog.Title className="text-xl font-bold text-navy">{title}</Dialog.Title>
            <Dialog.Description className="mt-0.5 text-[13px] text-muted">{description}</Dialog.Description>
            {header}
            <Dialog.Close
              aria-label="Cerrar"
              className="absolute right-7 top-6 flex size-9 cursor-pointer items-center justify-center rounded-full bg-bg text-muted hover:text-navy"
            >
              <X size={18} />
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-7 pb-7">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}