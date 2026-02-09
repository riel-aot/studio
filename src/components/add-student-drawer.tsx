'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useWebhook } from '@/lib/hooks';
import type { StudentCreatePayload, StudentCreateResponse } from '@/lib/events';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  studentIdNumber: z.string().min(1, { message: 'Student ID is required.' }),
  className: z.string().min(1, { message: 'Class/Group is required.' }),
  studentEmail: z.string().email({ message: 'Invalid email address.' }).optional().or(z.literal('')),
  parentEmail: z.string().email({ message: 'A valid parent email is required.' }),
});

type AddStudentFormValues = z.infer<typeof formSchema>;

interface AddStudentDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
}

export function AddStudentDrawer({ isOpen, onOpenChange, onSuccess }: AddStudentDrawerProps) {
  const form = useForm<AddStudentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      studentIdNumber: '',
      className: '',
      studentEmail: '',
      parentEmail: '',
    },
  });

  const { trigger: createStudent, isLoading } = useWebhook<StudentCreatePayload, StudentCreateResponse>({
    eventName: 'STUDENT_CREATE',
    manual: true,
    onSuccess: () => {
        onSuccess();
        form.reset();
    },
    errorMessage: "Could not add student. Please check the details and try again."
  });

  const onSubmit = (values: AddStudentFormValues) => {
    createStudent(values);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
            <SheetHeader>
              <SheetTitle>Add New Student</SheetTitle>
              <SheetDescription>
                Fill in the details below to add a new student to your roster.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 py-6 space-y-4 overflow-y-auto pr-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studentIdNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., S12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="className"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class / Group</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Grade 5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studentEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., jane.doe@student.school.edu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="parentEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Email</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., parent@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <SheetFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Student
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
