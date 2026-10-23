import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/provider/theme-provider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <TooltipProvider delay={200}>
      <ThemeProvider
        attribute={"class"}
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </TooltipProvider>
  );
};
