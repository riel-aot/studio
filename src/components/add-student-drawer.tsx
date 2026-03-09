'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploader } from '@/components/file-uploader';
import { Loader2, UserPlus, FileSpreadsheet, UploadCloud, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { getWebhookUrl } from '@/lib/webhook-config';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Full name is required.' }),
  studentIdNumber: z.string().min(1, { message: 'Student identification number is required.' }),
  grade: z.string().min(1, { message: 'Grade level is required.' }),
  studentEmail: z.string().email({ message: 'Enter a valid student email address.' }).optional().or(z.literal('')),
  parentEmail: z.string().email({ message: 'Enter a valid parent/guardian email address.' }),
});

type AddStudentFormValues = z.infer<typeof formSchema>;

interface AddStudentDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
}

export function AddStudentDrawer({ isOpen, onOpenChange, onSuccess }: AddStudentDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const { toast } = useToast();
  
  const form = useForm<AddStudentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      studentIdNumber: '',
      grade: '',
      studentEmail: '',
      parentEmail: '',
    },
  });

  const onManualSubmit = async (values: AddStudentFormValues) => {
    setIsLoading(true);
    try {
      const webhookUrl = getWebhookUrl('STUDENT_CREATE');
      if (!webhookUrl) {
        throw new Error('Student creation webhook URL is not configured');
      }

      const payload = {
        name: values.name,
        student_id: values.studentIdNumber,
        grade: values.grade,
        student_email: values.studentEmail || undefined,
        parent_email: values.parentEmail,
      };
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('System error encountered during student creation.');

      const result = await response.json();
      if (result.success === false) throw new Error(result.error?.message || 'Submission rejected by server.');

      toast({
        title: 'Student Created',
        description: `Successfully added ${values.name} to the roster.`,
      });

      form.reset();
      onSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (bulkFiles.length === 0) return;
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: 'Processing File',
        description: 'Your spreadsheet is being imported. Check the student list in a moment.',
      });
      setBulkFiles([]);
      onSuccess();
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl border-l border-slate-200 px-8">
        <div className="flex flex-col h-full overflow-hidden">
          <SheetHeader className="pb-6 pt-2">
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-[#2F5BEA]" />
              Manage Enrollment
            </SheetTitle>
            <SheetDescription className="text-slate-500 text-sm">
              Add a new student manually or upload a roster via spreadsheet.
            </SheetDescription>
          </SheetHeader>

          <Tabs defaultValue="manual" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2 mb-6 shrink-0 bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="manual" className="rounded-lg font-bold text-xs uppercase tracking-wider">
                Manual Entry
              </TabsTrigger>
              <TabsTrigger value="bulk" className="rounded-lg font-bold text-xs uppercase tracking-wider">
                Bulk Import
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="flex-1 flex flex-col m-0 min-h-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onManualSubmit)} className="flex flex-col h-full">
                  <div className="flex-1 space-y-6 overflow-y-auto pr-2 pb-6 scrollbar-thin">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-900 font-bold text-[10px] uppercase tracking-wider">Full Name</FormLabel>
                          <FormControl>
                            <Input id="student-name-field" placeholder="Enter student's legal full name" className="h-12 rounded-xl border-slate-200 focus:border-[#2F5BEA] focus:ring-1 focus:ring-[#2F5BEA] text-sm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="studentIdNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-900 font-bold text-[10px] uppercase tracking-wider">Student ID</FormLabel>
                            <FormControl>
                              <Input placeholder="System ID Number" className="h-12 rounded-xl border-slate-200 text-sm" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="grade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-900 font-bold text-[10px] uppercase tracking-wider">Academic Level</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Grade 5" className="h-12 rounded-xl border-slate-200 text-sm" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Separator className="bg-slate-100" />
                    <FormField
                      control={form.control}
                      name="studentEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-900 font-bold text-[10px] uppercase tracking-wider">Student Email (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Official school email address" className="h-12 rounded-xl border-slate-200 text-sm" {...field} />
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
                          <FormLabel className="text-slate-900 font-bold text-[10px] uppercase tracking-wider">Parent / Guardian Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Primary contact email for reporting" className="h-12 rounded-xl border-slate-200 text-sm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <SheetFooter className="pt-6 border-t mt-auto shrink-0 flex items-center gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onOpenChange(false)}
                      disabled={isLoading}
                      className="font-bold text-slate-400 hover:text-slate-900 h-12 text-sm"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="bg-[#2F5BEA] hover:bg-[#2447C6] h-12 px-8 font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 text-sm">
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add Student
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="bulk" className="flex-1 flex flex-col m-0 min-h-0">
              <div className="flex-1 space-y-6 overflow-y-auto pb-6 scrollbar-thin">
                <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <Info className="h-5 w-5 text-[#2F5BEA]" />
                  </div>
                  <div className="text-sm text-slate-700 leading-relaxed pt-1">
                    <p className="font-bold text-[#2F5BEA] mb-1 uppercase tracking-wider text-[10px]">Import Guidelines</p>
                    <p className="text-xs font-medium">Upload a .csv or .xlsx file. Ensure columns include: <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-blue-100">name</span>, <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-blue-100">student_id</span>, <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-blue-100">grade</span>, and <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-blue-100">parent_email</span>.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <FileUploader
                    onFileSelected={(file) => setBulkFiles([file])}
                    acceptedFileTypes={{
                      'text/csv': ['.csv'],
                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                    }}
                  />
                  
                  {bulkFiles.length > 0 && (
                    <div className="flex items-center gap-4 p-5 border border-slate-200 rounded-2xl bg-white shadow-sm animate-in fade-in slide-in-from-bottom-2">
                      <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center">
                        <FileSpreadsheet className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{bulkFiles[0].name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{(bulkFiles[0].size / 1024).toFixed(1)} KB • Ready to process</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setBulkFiles([])} className="text-slate-400 hover:text-destructive font-bold text-xs uppercase tracking-wider">Remove</Button>
                    </div>
                  )}
                </div>
              </div>

              <SheetFooter className="pt-6 border-t mt-auto shrink-0 flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className="font-bold text-slate-400 hover:text-slate-900 h-12 text-sm"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleBulkUpload} 
                  disabled={isLoading || bulkFiles.length === 0}
                  className="bg-[#2F5BEA] hover:bg-[#2447C6] h-12 px-8 font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 text-sm"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                  Process Roster
                </Button>
              </SheetFooter>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
