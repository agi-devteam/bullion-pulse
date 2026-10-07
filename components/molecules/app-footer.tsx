export interface AppFooterProps {
  leftText: string;
  rightText: string;
}

export function AppFooter({ leftText, rightText }: AppFooterProps) {
  return (
    <footer className="flex flex-wrap justify-between gap-2 text-[0.875rem] text-muted-text">
      <span>{leftText}</span>
      <span>{rightText}</span>
    </footer>
  );
}
