import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CustomButtonProps extends ButtonProps {
  gradient?: boolean
}

export function CustomButton({ children, className, gradient = true, ...props }: CustomButtonProps) {
  return (
    <Button className={cn(gradient ? "btn-primary-gradient" : "", className)} {...props}>
      {children}
    </Button>
  )
}
