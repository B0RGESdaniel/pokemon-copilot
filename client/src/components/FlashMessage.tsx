export function FlashMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="flex-none border-b-[3px] border-ink bg-[#f5e6a8] px-3 py-2 font-vt text-[24px] text-navy">
      &gt; {message}
    </div>
  );
}
