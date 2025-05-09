import * as React from "react";
import { useFormContext, FormProvider, UseFormReturn, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

interface FormProps<TFormValues extends FieldValues> extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  form: UseFormReturn<TFormValues>;
  onSubmit: (values: TFormValues) => void;
}

const Form = <TFormValues extends Record<string, any> = Record<string, any>>({
  form,
  onSubmit,
  children,
  className,
  ...props
}: FormProps<TFormValues>) => {
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-6", className)}
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  );
};

interface FormFieldProps<TFormValues>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  name: keyof TFormValues;
}

const FormField = <TFormValues extends Record<string, any> = Record<string, any>>({
  name,
  children,
  className,
  ...props
}: FormFieldProps<TFormValues>) => {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {children}
    </div>
  );
};

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn("text-sm font-medium leading-none", className)}
        {...props}
      />
    );
  }
);
FormLabel.displayName = "FormLabel";

interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ ...props }, ref) => {
    return <div ref={ref} {...props} />;
  }
);
FormControl.displayName = "FormControl";

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  name?: string;
}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ name, className, children, ...props }, ref) => {
    const { formState } = useFormContext();
    const error = name ? formState.errors[name] : null;
    const message = error?.message as string || children;

    if (!message) {
      return null;
    }

    return (
      <p
        ref={ref}
        className={cn("text-sm font-medium text-destructive", className)}
        {...props}
      >
        {message}
      </p>
    );
  }
);
FormMessage.displayName = "FormMessage";

export {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormMessage
};
